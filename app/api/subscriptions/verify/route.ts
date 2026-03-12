import { NextRequest, NextResponse } from 'next/server';
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import sql from '@/lib/db';

function createCashfreeClient() {
  // @ts-ignore
  const cf = new Cashfree('2023-08-01') as any;
  cf.XClientId = process.env.CASHFREE_APP_ID!;
  cf.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
  cf.XEnvironment =
    process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;
  return cf;
}

const PLAN_DETAILS: any = {
  'BASIC': { limit: 10 },
  'PRO': { limit: 20 },
  'ELITE': { limit: null }
};

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    const cf = createCashfreeClient();
    const response = await cf.PGOrderFetchPayments(orderId);
    
    const payments = response.data;
    const successfulPayment = payments.find((p: any) => p.payment_status === 'SUCCESS');

    if (successfulPayment) {
      const [order] = await sql`SELECT * FROM orders WHERE razorpay_order_id = ${orderId}`;
      if (order && order.status === 'pending') {
        // Update order status
        await sql`UPDATE orders SET status = 'paid', razorpay_payment_id = ${successfulPayment.cf_payment_id} WHERE razorpay_order_id = ${orderId}`;
        
        // Extract plan name from order description or order_id
        const planName = orderId.split('_')[1]; // sub_BASIC_...
        const plan = PLAN_DETAILS[planName];

        // Create user subscription
        if (plan) {
            // Set any existing subscriptions to expired
            await sql`UPDATE user_subscriptions SET status = 'expired' WHERE user_id = ${order.user_id} AND status = 'active'`;

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);

            await sql`
                INSERT INTO user_subscriptions (user_id, plan_name, price, product_limit, start_date, end_date, status)
                VALUES (${order.user_id}, ${planName}, ${order.amount}, ${plan.limit}, ${startDate}, ${endDate}, 'active')
            `;
        }

        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: false, error: 'Payment not successful' });
  } catch (error) {
    console.error('Subscription verify error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

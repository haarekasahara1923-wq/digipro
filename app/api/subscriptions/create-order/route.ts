import { NextRequest, NextResponse } from 'next/server';
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import sql from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

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
  'BASIC': { price: 599, limit: 10 },
  'PRO': { price: 999, limit: 20 },
  'ELITE': { price: 1999, limit: null }
};

export async function POST(req: NextRequest) {
  try {
    const payload = await getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const { planName } = await req.json();
    const plan = PLAN_DETAILS[planName];
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const [user] = await sql`SELECT * FROM users WHERE id = ${payload.userId as number}`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const cf = createCashfreeClient();
    const order_id = `sub_${planName}_${user.id}_${Date.now()}`;
    
    let phone = user.whatsapp || '9999999999';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = '+91' + phone;

    const request = {
      order_id,
      order_amount: plan.price,
      order_currency: 'INR',
      customer_details: {
        customer_id: `user_${user.id}`,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: phone,
      },
    };

    const cfResponse = await cf.PGCreateOrder(request);
    
    await sql`
      INSERT INTO orders 
        (user_id, product_name, buyer_name, buyer_email, buyer_whatsapp, razorpay_order_id, amount, status, order_type)
      VALUES
        (${user.id}, ${'Membership: ' + planName}, ${user.name}, ${user.email}, ${user.whatsapp || ''}, ${order_id}, ${plan.price}, 'pending', 'membership')
    `;

    return NextResponse.json({ orderId: order_id, paymentSessionId: cfResponse.data.payment_session_id });
  } catch (error) {
    console.error('Subscription order create error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

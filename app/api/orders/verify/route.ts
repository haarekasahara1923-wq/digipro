import { NextRequest, NextResponse } from 'next/server';
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import sql from '@/lib/db';
import { sendPurchaseEmail, sendAdminSaleAlert } from '@/lib/notifications';

function createCashfreeClient() {
  // @ts-ignore - cashfree-pg v5 takes apiVersion as first constructor arg
  const cf = new Cashfree('2023-08-01') as any;
  cf.XClientId = process.env.CASHFREE_APP_ID!;
  cf.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
  cf.XEnvironment =
    process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;
  return cf;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const cf = createCashfreeClient();

    // ── Fetch payments from Cashfree ─────────────────────────────────────
    const response = await cf.PGOrderFetchPayments(orderId);
    const payments: any[] = response.data || [];
    const payment = payments.find((p: any) => p.payment_status === 'SUCCESS');

    if (!payment) {
      return NextResponse.json({ error: 'Payment verification failed or pending' }, { status: 400 });
    }

    const payment_id = payment.cf_payment_id || payment.payment_id;

    // ── Fetch order from DB ────────────────────────────────────────────────
    const orders = await sql`
      SELECT o.*, p.drive_link, p.name AS product_name_from_product, p.bonus_links
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.razorpay_order_id = ${orderId}
    `;
    if (orders.length === 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    // ── Mark paid ──────────────────────────────────────────────────────────
    await sql`
      UPDATE orders SET
        status = 'paid',
        razorpay_payment_id = ${String(payment_id)},
        razorpay_signature  = 'cashfree_verified'
      WHERE razorpay_order_id = ${orderId}
    `;

    // ── Build all links to deliver ─────────────────────────────────────────
    interface LinkGroup {
      productName: string;
      driveLink: string;
      bonusLinks: { title: string; url: string }[];
    }

    let allLinks: LinkGroup[] = [];

    const cartItems = order.cart_items;
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      allLinks = cartItems.map((item: any) => ({
        productName: item.name,
        driveLink: item.driveLink || item.drive_link || '',
        bonusLinks: item.bonusLinks || item.bonus_links || [],
      }));
    } else {
      allLinks = [{
        productName: order.product_name || order.product_name_from_product,
        driveLink: order.drive_link || '',
        bonusLinks: order.bonus_links || [],
      }];
    }

    const productName = order.product_name || order.product_name_from_product;
    const amount = order.amount;

    // ── 1. Email to buyer ──────────────────────────────────────────────────
    try {
      await sendPurchaseEmail({
        buyerEmail: order.buyer_email,
        buyerName: order.buyer_name,
        productName,
        allLinks,
        amount,
      });
      console.log('✅ Email sent to', order.buyer_email);
    } catch (e) {
      console.error('❌ Email failed:', e);
    }

    // ── 2. Admin sale alert ────────────────────────────────────────────────
    try {
      await sendAdminSaleAlert({
        buyerName: order.buyer_name,
        buyerEmail: order.buyer_email,
        buyerWhatsapp: order.buyer_whatsapp,
        productName,
        amount,
      });
    } catch (e) {
      console.error('❌ Admin alert failed:', e);
    }

    // ── Mark link sent ─────────────────────────────────────────────────────
    await sql`UPDATE orders SET drive_link_sent = true WHERE razorpay_order_id = ${orderId}`;

    return NextResponse.json({ success: true, buyerName: order.buyer_name, productName });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

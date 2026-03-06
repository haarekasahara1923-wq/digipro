import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';
import { sendPurchaseEmail, sendWhatsAppMessage, sendAdminSaleAlert } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // ── Verify signature ───────────────────────────────────────────────────
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // ── Fetch order ────────────────────────────────────────────────────────
    const orders = await sql`
      SELECT o.*, p.drive_link, p.name AS product_name_from_product, p.bonus_links
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.razorpay_order_id = ${razorpay_order_id}
    `;
    if (orders.length === 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    // ── Mark paid ──────────────────────────────────────────────────────────
    await sql`
      UPDATE orders SET
        status = 'paid',
        razorpay_payment_id = ${razorpay_payment_id},
        razorpay_signature  = ${razorpay_signature}
      WHERE razorpay_order_id = ${razorpay_order_id}
    `;

    // ── Build all links to deliver ─────────────────────────────────────────
    interface LinkGroup {
      productName: string;
      driveLink: string;
      bonusLinks: { title: string; url: string }[];
    }

    let allLinks: LinkGroup[] = [];

    // Use cart_items if available (multi-product or single+bump)
    const cartItems = order.cart_items;
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      allLinks = cartItems.map((item: any) => ({
        productName: item.name,
        driveLink: item.driveLink || item.drive_link || '',
        bonusLinks: item.bonusLinks || item.bonus_links || [],
      }));
    } else {
      // Legacy single product
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

    // ── 2. WhatsApp to buyer ───────────────────────────────────────────────
    try {
      await sendWhatsAppMessage({
        phoneNumber: order.buyer_whatsapp,
        buyerName: order.buyer_name,
        productName,
        allLinks,
      });
    } catch (e) {
      console.error('❌ WhatsApp failed:', e);
    }

    // ── 3. Admin sale alert ────────────────────────────────────────────────
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
    await sql`UPDATE orders SET drive_link_sent = true WHERE razorpay_order_id = ${razorpay_order_id}`;

    return NextResponse.json({ success: true, buyerName: order.buyer_name, productName });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

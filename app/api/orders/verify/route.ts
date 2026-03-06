import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';
import { sendPurchaseEmail, sendWhatsAppMessage } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Find the order
    const orders = await sql`
      SELECT o.*, p.drive_link, p.name as product_name_from_product
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.razorpay_order_id = ${razorpay_order_id}
    `;

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Update order to paid
    await sql`
      UPDATE orders
      SET
        status = 'paid',
        razorpay_payment_id = ${razorpay_payment_id},
        razorpay_signature = ${razorpay_signature}
      WHERE razorpay_order_id = ${razorpay_order_id}
    `;

    const driveLink = order.drive_link;
    const productName = order.product_name || order.product_name_from_product;

    // Send email
    try {
      await sendPurchaseEmail({
        buyerEmail: order.buyer_email,
        buyerName: order.buyer_name,
        productName,
        driveLink,
      });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
    }

    // Send WhatsApp
    try {
      await sendWhatsAppMessage({
        phoneNumber: order.buyer_whatsapp,
        buyerName: order.buyer_name,
        productName,
        driveLink,
      });
    } catch (waErr) {
      console.error('WhatsApp send failed:', waErr);
    }

    // Mark link as sent
    await sql`
      UPDATE orders SET drive_link_sent = true WHERE razorpay_order_id = ${razorpay_order_id}
    `;

    return NextResponse.json({
      success: true,
      buyerName: order.buyer_name,
      productName,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

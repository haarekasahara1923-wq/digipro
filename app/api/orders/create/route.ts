import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import sql from '@/lib/db';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { productSlug, buyerName, buyerEmail, buyerWhatsapp } = await req.json();

    if (!productSlug || !buyerName || !buyerEmail || !buyerWhatsapp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get product
    const products = await sql`
      SELECT * FROM products WHERE slug = ${productSlug} AND is_active = true
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];
    const amountInPaise = Math.round(Number(product.discounted_price) * 100);

    // Create Razorpay order
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        product_slug: productSlug,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_whatsapp: buyerWhatsapp,
      },
    });

    // Save pending order in DB
    const dbOrder = await sql`
      INSERT INTO orders (product_id, product_name, buyer_name, buyer_email, buyer_whatsapp, razorpay_order_id, amount, status)
      VALUES (${product.id}, ${product.name}, ${buyerName}, ${buyerEmail}, ${buyerWhatsapp}, ${rzpOrder.id}, ${product.discounted_price}, 'pending')
      RETURNING id
    `;

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      dbOrderId: dbOrder[0].id,
      productName: product.name,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

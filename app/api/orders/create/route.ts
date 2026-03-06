import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import sql, { initDB } from '@/lib/db';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const body = await req.json();
    const { buyerName, buyerEmail, buyerWhatsapp } = body;

    if (!buyerName || !buyerEmail || !buyerWhatsapp) {
      return NextResponse.json({ error: 'Buyer details required' }, { status: 400 });
    }

    // ── CART MODE (multiple products) ──────────────────────────────────────
    if (body.cartItems && Array.isArray(body.cartItems) && body.cartItems.length > 0) {
      const { cartItems } = body;

      // Fetch all products from DB
      const slugs = cartItems.map((i: any) => i.slug);
      const dbProducts = await sql`
        SELECT id, name, discounted_price, drive_link, slug, bonus_links
        FROM products
        WHERE slug = ANY(${slugs})
      `;

      // Build cart items with drive links
      const enrichedItems = cartItems.map((ci: any) => {
        const dbP = dbProducts.find((p: any) => p.slug === ci.slug);
        return {
          name: dbP?.name || ci.name,
          slug: ci.slug,
          price: ci.price,
          driveLink: dbP?.drive_link || '',
          bonusLinks: dbP?.bonus_links || [],
        };
      });

      const totalAmount = enrichedItems.reduce((s: number, i: any) => s + Number(i.price), 0);
      const amountPaisa = Math.round(totalAmount * 100);

      const rzpOrder = await razorpay.orders.create({
        amount: amountPaisa,
        currency: 'INR',
        notes: { buyerEmail, buyerName },
      });

      // Save one combined order record
      const firstProduct = dbProducts[0];
      await sql`
        INSERT INTO orders
          (product_id, product_name, buyer_name, buyer_email, buyer_whatsapp,
           razorpay_order_id, amount, status, cart_items)
        VALUES
          (${firstProduct?.id || null},
           ${enrichedItems.map((i: any) => i.name).join(', ')},
           ${buyerName}, ${buyerEmail}, ${buyerWhatsapp},
           ${rzpOrder.id}, ${totalAmount}, 'pending',
           ${JSON.stringify(enrichedItems)}::jsonb)
      `;

      return NextResponse.json({ orderId: rzpOrder.id, amount: amountPaisa });
    }

    // ── SINGLE PRODUCT MODE ────────────────────────────────────────────────
    const { productSlug, bumpSlug, bumpPrice } = body;
    if (!productSlug) {
      return NextResponse.json({ error: 'Product slug or cartItems required' }, { status: 400 });
    }

    const products = await sql`
      SELECT * FROM products WHERE slug = ${productSlug} AND (is_active = true OR is_active IS NULL)
    `;
    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    const product = products[0];

    // Optional: order bump
    let bumpProduct = null;
    if (bumpSlug) {
      const bumps = await sql`SELECT * FROM products WHERE slug = ${bumpSlug}`;
      if (bumps.length > 0) bumpProduct = bumps[0];
    }

    const basePrice = parseFloat(product.discounted_price);
    const bumpAmount = bumpProduct && bumpPrice ? parseFloat(bumpPrice) : 0;
    const total = basePrice + bumpAmount;
    const amountPaisa = Math.round(total * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountPaisa,
      currency: 'INR',
      notes: { buyerEmail, buyerName, productSlug },
    });

    // Build cart_items for single order (with bump)
    const cartItemsData = [
      { name: product.name, slug: product.slug, price: basePrice, driveLink: product.drive_link, bonusLinks: product.bonus_links || [] },
      ...(bumpProduct ? [{ name: bumpProduct.name, slug: bumpProduct.slug, price: bumpAmount, driveLink: bumpProduct.drive_link, bonusLinks: bumpProduct.bonus_links || [] }] : []),
    ];

    await sql`
      INSERT INTO orders
        (product_id, product_name, buyer_name, buyer_email, buyer_whatsapp,
         razorpay_order_id, amount, status, cart_items)
      VALUES
        (${product.id}, ${product.name},
         ${buyerName}, ${buyerEmail}, ${buyerWhatsapp},
         ${rzpOrder.id}, ${total}, 'pending',
         ${JSON.stringify(cartItemsData)}::jsonb)
    `;

    return NextResponse.json({ orderId: rzpOrder.id, amount: amountPaisa });
  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

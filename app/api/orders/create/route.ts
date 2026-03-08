import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { Cashfree, CFEnvironment } from "cashfree-pg";
import sql, { initDB } from '@/lib/db';

// @ts-ignore
Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
// @ts-ignore
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
// @ts-ignore
Cashfree.XEnvironment = process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

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
      let phone = buyerWhatsapp.replace(/[^0-9]/g, '');
      if (phone.length === 10) phone = '+91' + phone;

      const order_id = `cf_cart_${Date.now()}`;
      const request = {
        order_id: order_id,
        order_amount: totalAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${Date.now()}`,
          customer_name: buyerName,
          customer_email: buyerEmail,
          customer_phone: phone,
        },
      };

      // @ts-ignore
      const cfResponse = await Cashfree.PGCreateOrder("2023-08-01", request);
      const paymentSessionId = cfResponse.data.payment_session_id;

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
           ${cfResponse.data.order_id}, ${totalAmount}, 'pending',
           ${JSON.stringify(enrichedItems)}::jsonb)
      `;

      return NextResponse.json({ orderId: cfResponse.data.order_id, paymentSessionId: paymentSessionId });
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
    let phone = buyerWhatsapp.replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = '+91' + phone;

    const order_id = `cf_${product.id}_${Date.now()}`;
    const request = {
      order_id: order_id,
      order_amount: total,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: buyerName,
        customer_email: buyerEmail,
        customer_phone: phone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/payment-success?order_id={order_id}`
      }
    };

    // @ts-ignore
    const cfResponse = await Cashfree.PGCreateOrder("2023-08-01", request);
    const paymentSessionId = cfResponse.data.payment_session_id;

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
         ${cfResponse.data.order_id}, ${total}, 'pending',
         ${JSON.stringify(cartItemsData)}::jsonb)
    `;

    return NextResponse.json({ orderId: cfResponse.data.order_id, paymentSessionId: paymentSessionId });
  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import sql, { initDB } from '@/lib/db';

// ── Get PayPal access token ───────────────────────────────────────────────
async function getPayPalToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
    const base = process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    const res = await fetch(`${base}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
        body: 'grant_type=client_credentials',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || 'PayPal auth failed');
    return data.access_token;
}

// ── POST /api/paypal/create-order ────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        await initDB();
        const body = await req.json();
        const { productSlug, bumpSlug, bumpPriceUsd, buyerName, buyerEmail, buyerWhatsapp } = body;

        if (!productSlug || !buyerName || !buyerEmail || !buyerWhatsapp) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch main product
        const products = await sql`
      SELECT * FROM products WHERE slug = ${productSlug} AND (is_active = true OR is_active IS NULL)
    `;
        if (products.length === 0) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        const product = products[0];

        if (!product.price_usd) {
            return NextResponse.json({ error: 'USD price not set for this product' }, { status: 400 });
        }

        // Fetch bump product if needed
        let bumpProduct = null;
        if (bumpSlug) {
            const bumps = await sql`SELECT * FROM products WHERE slug = ${bumpSlug}`;
            if (bumps.length > 0) bumpProduct = bumps[0];
        }

        const mainUsd = parseFloat(product.price_usd);
        const bumpUsd = bumpPriceUsd ? parseFloat(bumpPriceUsd) : 0;
        const totalUsd = mainUsd + bumpUsd;

        // Build cart items for delivery later
        const cartItems = [
            { name: product.name, slug: product.slug, price: mainUsd, driveLink: product.drive_link, bonusLinks: product.bonus_links || [] },
            ...(bumpProduct ? [{ name: bumpProduct.name, slug: bumpProduct.slug, price: bumpUsd, driveLink: bumpProduct.drive_link, bonusLinks: bumpProduct.bonus_links || [] }] : []),
        ];

        // Create PayPal order
        const base = process.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        const token = await getPayPalToken();
        const ppRes = await fetch(`${base}/v2/checkout/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: { currency_code: 'USD', value: totalUsd.toFixed(2) },
                    description: product.name,
                }],
            }),
        });
        const ppData = await ppRes.json();
        if (!ppRes.ok) throw new Error(ppData.message || 'PayPal order creation failed');

        // Save order to DB (pending)
        await sql`
      INSERT INTO orders
        (product_id, product_name, buyer_name, buyer_email, buyer_whatsapp,
         razorpay_order_id, amount, status, cart_items)
      VALUES
        (${product.id}, ${product.name},
         ${buyerName}, ${buyerEmail}, ${buyerWhatsapp},
         ${'PP-' + ppData.id}, ${totalUsd}, 'pending',
         ${JSON.stringify(cartItems)}::jsonb)
    `;

        return NextResponse.json({ orderID: ppData.id });
    } catch (error) {
        console.error('PayPal create-order error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

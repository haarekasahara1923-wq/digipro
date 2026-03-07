import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { sendPurchaseEmail, sendWhatsAppMessage, sendAdminSaleAlert } from '@/lib/notifications';

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
    return data.access_token;
}

// ── POST /api/paypal/capture-order ───────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const { orderID } = await req.json();
        if (!orderID) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

        const base = process.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        const token = await getPayPalToken();
        const captureRes = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        const captureData = await captureRes.json();

        if (!captureRes.ok || captureData.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'PayPal capture failed', detail: captureData }, { status: 400 });
        }

        // Find order in DB (stored as PP-{orderID})
        const orders = await sql`
      SELECT * FROM orders WHERE razorpay_order_id = ${'PP-' + orderID}
    `;
        if (orders.length === 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        const order = orders[0];

        // Mark paid
        const paypalPaymentId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderID;
        await sql`
      UPDATE orders SET
        status = 'paid',
        razorpay_payment_id = ${paypalPaymentId}
      WHERE razorpay_order_id = ${'PP-' + orderID}
    `;

        // Build links from cart_items
        const cartItems = order.cart_items;
        const allLinks = Array.isArray(cartItems) && cartItems.length > 0
            ? cartItems.map((item: any) => ({
                productName: item.name,
                driveLink: item.driveLink || item.drive_link || '',
                bonusLinks: item.bonusLinks || item.bonus_links || [],
            }))
            : [{ productName: order.product_name, driveLink: '', bonusLinks: [] }];

        const productName = order.product_name;
        const amount = `$${Number(order.amount).toFixed(2)} USD`;

        // Send notifications
        try { await sendPurchaseEmail({ buyerEmail: order.buyer_email, buyerName: order.buyer_name, productName, allLinks, amount }); } catch (e) { console.error(e); }
        // try { await sendWhatsAppMessage({ phoneNumber: order.buyer_whatsapp, buyerName: order.buyer_name, productName, allLinks }); } catch (e) { console.error(e); }
        try { await sendAdminSaleAlert({ buyerName: order.buyer_name, buyerEmail: order.buyer_email, buyerWhatsapp: order.buyer_whatsapp, productName, amount }); } catch (e) { console.error(e); }

        await sql`UPDATE orders SET drive_link_sent = true WHERE razorpay_order_id = ${'PP-' + orderID}`;

        return NextResponse.json({ success: true, buyerName: order.buyer_name, productName });
    } catch (error) {
        console.error('PayPal capture error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

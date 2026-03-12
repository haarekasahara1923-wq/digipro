import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const payload = await getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const { productSlug } = await req.json();
    if (!productSlug) return NextResponse.json({ error: 'Product slug required' }, { status: 400 });

    const [user] = await sql`SELECT * FROM users WHERE id = ${payload.userId as number}`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check active subscription
    const [sub] = await sql`
      SELECT * FROM user_subscriptions 
      WHERE user_id = ${user.id} 
      AND status = 'active' 
      AND end_date > NOW() 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (!sub) return NextResponse.json({ error: 'No active subscription found' }, { status: 403 });

    // Check limit
    if (sub.product_limit !== null && sub.products_downloaded >= sub.product_limit) {
      return NextResponse.json({ error: 'Monthly download limit reached' }, { status: 403 });
    }

    // Check if already downloaded this product (don't count twice)
    const [history] = await sql`
      SELECT id FROM download_history 
      WHERE user_id = ${user.id} 
      AND product_id = (SELECT id FROM products WHERE slug = ${productSlug})
    `;

    // Fetch product link
    const [product] = await sql`SELECT id, drive_link FROM products WHERE slug = ${productSlug}`;
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    if (!history) {
      // Increment download count and record history
      await sql`UPDATE user_subscriptions SET products_downloaded = products_downloaded + 1 WHERE id = ${sub.id}`;
      await sql`INSERT INTO download_history (user_id, product_id) VALUES (${user.id}, ${product.id})`;
    }

    return NextResponse.json({ 
      success: true, 
      driveLink: product.drive_link 
    });
  } catch (error) {
    console.error('Membership download error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

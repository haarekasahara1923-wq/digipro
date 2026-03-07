import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// ⚡ Force dynamic: disable Next.js static caching so new products
// appear in the store immediately after admin adds them.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const products = await sql`
      SELECT id, name, description, original_price, discounted_price, image_url, slug, price_usd, created_at
      FROM products
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

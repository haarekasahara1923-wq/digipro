import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const products = await sql`
      SELECT id, name, description, original_price, discounted_price, image_url, slug, created_at
      FROM products
      WHERE is_active = true OR is_active IS NULL
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

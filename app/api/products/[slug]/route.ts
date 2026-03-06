import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const products = await sql`
      SELECT id, name, description, original_price, discounted_price, image_url, slug, created_at
      FROM products
      WHERE slug = ${params.slug} AND is_active = true
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: products[0] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

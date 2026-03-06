import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const products = await sql`
      SELECT
        p.*,
        bump.name             AS order_bump_name,
        bump.image_url        AS order_bump_image,
        bump.slug             AS order_bump_slug,
        bump.description      AS order_bump_description,
        bump.original_price   AS order_bump_original_price,
        bump.discounted_price AS order_bump_original_discounted
      FROM products p
      LEFT JOIN products bump ON p.order_bump_product_id = bump.id
      WHERE p.slug = ${params.slug}
        AND (p.is_active = true OR p.is_active IS NULL)
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: products[0] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

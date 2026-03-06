import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = await sql`
    SELECT p.*,
      bump.name AS order_bump_name,
      bump.image_url AS order_bump_image,
      bump.slug AS order_bump_slug
    FROM products p
    LEFT JOIN products bump ON p.order_bump_product_id = bump.id
    ORDER BY p.created_at DESC
  `;
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    name, description, original_price, discounted_price,
    image_url, drive_link,
    bonus_links = [],
    order_bump_product_id = null,
    order_bump_price = null,
    order_bump_description = null,
  } = body;

  if (!name || !original_price || !discounted_price || !image_url || !drive_link) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const slug = generateSlug(name);
  const bonusJson = JSON.stringify(bonus_links);

  try {
    const result = await sql`
      INSERT INTO products
        (name, description, original_price, discounted_price, image_url, drive_link, slug,
         is_active, bonus_links, order_bump_product_id, order_bump_price, order_bump_description)
      VALUES
        (${name}, ${description}, ${original_price}, ${discounted_price}, ${image_url},
         ${drive_link}, ${slug},
         true,
         ${bonusJson}::jsonb, ${order_bump_product_id}, ${order_bump_price}, ${order_bump_description})
      RETURNING *
    `;
    return NextResponse.json({ product: result[0] });
  } catch (error) {
    console.error('Product insert error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

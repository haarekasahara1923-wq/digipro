import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await sql`SELECT * FROM products WHERE id = ${params.id}`;
  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product: result[0] });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    name, description, original_price, discounted_price,
    image_url, drive_link, is_active,
    bonus_links,
    order_bump_product_id,
    order_bump_price,
    order_bump_description,
    price_usd,
  } = body;

  const bonusJson = bonus_links !== undefined ? JSON.stringify(bonus_links) : undefined;

  const result = await sql`
    UPDATE products SET
      name                   = COALESCE(${name}, name),
      description            = COALESCE(${description}, description),
      original_price         = COALESCE(${original_price}, original_price),
      discounted_price       = COALESCE(${discounted_price}, discounted_price),
      image_url              = COALESCE(${image_url}, image_url),
      drive_link             = COALESCE(${drive_link}, drive_link),
      is_active              = COALESCE(${is_active}, is_active),
      bonus_links            = COALESCE(${bonusJson ?? null}::jsonb, bonus_links),
      order_bump_product_id  = COALESCE(${order_bump_product_id ?? null}, order_bump_product_id),
      order_bump_price       = COALESCE(${order_bump_price ?? null}, order_bump_price),
      order_bump_description = COALESCE(${order_bump_description ?? null}, order_bump_description),
      price_usd              = COALESCE(${price_usd ?? null}, price_usd),
      updated_at             = NOW()
    WHERE id = ${params.id}
    RETURNING *
  `;

  return NextResponse.json({ product: result[0] });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await sql`DELETE FROM products WHERE id = ${params.id}`;
  return NextResponse.json({ success: true });
}

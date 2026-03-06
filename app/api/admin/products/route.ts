import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = await sql`
    SELECT * FROM products ORDER BY created_at DESC
  `;
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, description, original_price, discounted_price, image_url, drive_link } = body;

  if (!name || !original_price || !discounted_price || !image_url || !drive_link) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const slug = generateSlug(name);

  const result = await sql`
    INSERT INTO products (name, description, original_price, discounted_price, image_url, drive_link, slug)
    VALUES (${name}, ${description}, ${original_price}, ${discounted_price}, ${image_url}, ${drive_link}, ${slug})
    RETURNING *
  `;

  return NextResponse.json({ product: result[0] });
}

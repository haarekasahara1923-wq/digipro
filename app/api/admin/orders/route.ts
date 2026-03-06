import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await sql`
    SELECT o.*, p.name as product_name, p.slug as product_slug
    FROM orders o
    LEFT JOIN products p ON o.product_id = p.id
    ORDER BY o.created_at DESC
  `;
  return NextResponse.json({ orders });
}

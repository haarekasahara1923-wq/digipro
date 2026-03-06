import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import sql from '@/lib/db';

export async function GET() {
  try {
    await initDB();

    // Extra safety: force all products to is_active = true
    // (fixes any products added without explicit is_active)
    const fixed = await sql`
      UPDATE products
      SET is_active = true
      WHERE is_active IS NULL OR is_active = false
      RETURNING id, name
    `;

    return NextResponse.json({
      success: true,
      message: 'Database initialized & migrations applied',
      productsFixed: fixed.length,
      fixedProducts: fixed.map((p: any) => p.name),
    });
  } catch (error) {
    console.error('initDB error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

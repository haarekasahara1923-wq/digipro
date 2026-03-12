import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const payload = await getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const [user] = await sql`SELECT id, name, email FROM users WHERE id = ${payload.userId as number}`;
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Get active subscription
    const [sub] = await sql`
      SELECT * FROM user_subscriptions 
      WHERE user_id = ${user.id} 
      AND status = 'active' 
      AND end_date > NOW() 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    return NextResponse.json({
      authenticated: true,
      user,
      subscription: sub || null
    });
  } catch (error) {
    console.error('Auth/me error:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

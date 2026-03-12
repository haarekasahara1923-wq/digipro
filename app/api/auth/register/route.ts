import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { initDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await initDB();
    const { name, email, password, whatsapp } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const [user] = await sql`
      INSERT INTO users (name, email, password_hash, whatsapp)
      VALUES (${name}, ${email}, ${passwordHash}, ${whatsapp})
      RETURNING id, name, email
    `;

    const token = await signToken({ userId: user.id, email: user.email, name: user.name });
    
    cookies().set('user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

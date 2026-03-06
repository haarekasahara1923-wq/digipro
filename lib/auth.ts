import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'fallback-secret-change-this');

export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!token) return false;
    const payload = await verifyToken(token);
    return !!payload;
  } catch {
    return false;
  }
}

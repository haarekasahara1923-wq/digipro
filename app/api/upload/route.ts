import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAdminFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'image';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const resourceType = type === 'pdf' ? 'raw' : 'image';
    const url = await uploadToCloudinary(buffer, 'digitalstore', resourceType);

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

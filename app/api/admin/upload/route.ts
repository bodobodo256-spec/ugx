import { NextRequest, NextResponse } from 'next/server';
import { uploadMedia } from '@/app/actions/profiles';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const passkeyHeader = req.headers.get('x-admin-passkey') || req.cookies.get('ug_admin_passkey')?.value;
    const expectedPasskey = process.env.ADMIN_PASSKEY || 'Badman256';

    if (!passkeyHeader || passkeyHeader.trim() !== expectedPasskey) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid admin passkey.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No valid file provided for upload.' }, { status: 400 });
    }

    const url = await uploadMedia(file, folder);

    if (url) {
      return NextResponse.json({ success: true, url });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to upload media to storage.' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('[/api/admin/upload error]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error during upload.' },
      { status: 500 }
    );
  }
}

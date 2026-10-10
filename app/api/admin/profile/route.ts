import { NextRequest, NextResponse } from 'next/server';
import { adminUpdateProfile } from '@/app/actions/profiles';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const passkeyHeader = req.headers.get('x-admin-passkey') || req.cookies.get('ug_admin_passkey')?.value;
    const expectedPasskey = process.env.ADMIN_PASSKEY || 'Badman256';

    if (!passkeyHeader || passkeyHeader.trim() !== expectedPasskey) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid admin passkey.' }, { status: 401 });
    }

    const formData = await req.formData();
    const result = await adminUpdateProfile(formData);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      const errorMsg = 'error' in result ? result.error : 'Update failed';
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[/api/admin/profile error]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error while saving profile.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminUpdateProfile, adminCreateProfile } from '@/app/actions/profiles';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const passkeyHeader = req.headers.get('x-admin-passkey') || req.cookies.get('ug_admin_passkey')?.value;
    const expectedPasskey = process.env.ADMIN_PASSKEY || 'Badman256';

    if (!passkeyHeader || passkeyHeader.trim() !== expectedPasskey) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid admin passkey.' }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get('id');
    const isCreate = !id || id === '0' || id === 'new';

    const result = isCreate
      ? await adminCreateProfile(formData)
      : await adminUpdateProfile(formData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        profileId: 'profileId' in result ? result.profileId : undefined,
      });
    } else {
      const errorMsg = 'error' in result ? result.error : (isCreate ? 'Create failed' : 'Update failed');
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

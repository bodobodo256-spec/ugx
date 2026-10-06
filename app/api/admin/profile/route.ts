import { NextRequest, NextResponse } from 'next/server';
import { adminUpdateProfile } from '@/app/actions/profiles';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
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

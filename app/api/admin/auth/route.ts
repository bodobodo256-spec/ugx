import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { passkey } = await req.json();
    const expectedPasskey = process.env.ADMIN_PASSKEY || 'Badman256';

    if (typeof passkey === 'string' && passkey.trim() === expectedPasskey) {
      const response = NextResponse.json({ success: true, token: expectedPasskey });
      response.cookies.set('ug_admin_passkey', expectedPasskey, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Incorrect admin passkey' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

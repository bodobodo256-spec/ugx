import { NextResponse } from 'next/server';
import { ensureD1Schema, executeD1Query } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const migrationResult = await ensureD1Schema(true);
    const finalCols = await executeD1Query('PRAGMA table_info("profiles");');
    const countRes = await executeD1Query('SELECT COUNT(*) as count FROM "profiles";');

    return NextResponse.json({
      success: true,
      message: 'Cloudflare D1 schema verified and updated successfully.',
      migration: migrationResult,
      totalProfiles: countRes?.[0]?.count ?? 0,
      columns: (finalCols || []).map((c: any) => ({
        cid: c.cid,
        name: c.name,
        type: c.type,
        notnull: c.notnull,
        dflt_value: c.dflt_value,
        pk: c.pk,
      })),
    });
  } catch (err: any) {
    console.error('[API /api/migrate]', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || String(err),
        stack: err?.stack,
      },
      { status: 500 }
    );
  }
}

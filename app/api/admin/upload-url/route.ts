import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifyAdminPasskey } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const passkeyHeader = req.headers.get('x-admin-passkey') || req.cookies.get('ug_admin_passkey')?.value;

    if (!verifyAdminPasskey(passkeyHeader)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid admin passkey.' }, { status: 401 });
    }

    const { filename, contentType, folder = 'uploads' } = await req.json();

    if (!filename) {
      return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
    }

    const r2AccountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2Bucket    = process.env.R2_BUCKET_NAME || 'ugx-bucket';
    const r2PublicUrl = process.env.R2_PUBLIC_URL || 'https://pub-69c390381fd247b6a79b2d9ad87415e9.r2.dev';

    if (!r2AccountId || !r2AccessKey || !r2SecretKey) {
      return NextResponse.json({ success: false, error: 'R2 storage credentials not configured on server.' }, { status: 500 });
    }

    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    });

    const isVideo = contentType?.startsWith('video/') || /\.(mp4|webm|mov|m4v|3gp)$/i.test(filename);
    const subfolder = isVideo ? 'videos' : 'photos';
    const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `profiles/${folder}/${subfolder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${cleanName}`;

    let resolvedContentType = contentType;
    if (!resolvedContentType) {
      if (cleanName.endsWith('.mp4')) resolvedContentType = 'video/mp4';
      else if (cleanName.endsWith('.webm')) resolvedContentType = 'video/webm';
      else if (cleanName.endsWith('.mov')) resolvedContentType = 'video/quicktime';
      else if (cleanName.endsWith('.png')) resolvedContentType = 'image/png';
      else if (cleanName.endsWith('.webp')) resolvedContentType = 'image/webp';
      else resolvedContentType = 'image/jpeg';
    }

    const command = new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      ContentType: resolvedContentType,
    });

    // Valid for 20 minutes (enough for large video uploads)
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 1200 });
    const publicUrl = `${r2PublicUrl}/${key}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
      contentType: resolvedContentType,
    });
  } catch (err: any) {
    console.error('[/api/admin/upload-url error]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

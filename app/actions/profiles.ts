'use server';

import { getDb } from '@/db/index';
import { profiles, type NewProfile } from '@/db/schema';
import { desc } from 'drizzle-orm';

// ─── helpers ─────────────────────────────────────────────────────────────────

function toSlug(name: string) {
  return (
    name.toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    + '-' + Date.now().toString(36)
  );
}

// ─── createProfile ────────────────────────────────────────────────────────────

export async function createProfile(formData: FormData): Promise<
  { success: true; slug: string } | { success: false; error: string }
> {
  try {
    const name      = (formData.get('name')     as string).trim();
    const age       = parseInt(formData.get('age') as string, 10);
    const location  = (formData.get('location')  as string).trim();
    const city      = (formData.get('city')       as string).trim();
    const tier      = (formData.get('tier')       as string) as NewProfile['tier'];
    const phone     = (formData.get('phone')      as string).trim();
    const whatsapp  = (formData.get('whatsapp')   as string).trim();
    const about     = ((formData.get('about')     as string) ?? '').trim();
    const photoFile = formData.get('photo')       as File | null;

    if (!name || !age || age < 18 || !location || !city || !phone || !whatsapp) {
      return { success: false, error: 'Please fill in all required fields (18+).' };
    }

    const slug = toSlug(name);
    let photoUrl: string | null = null;

    // ── Upload photo to R2 via S3-compatible API ──────────────────────────────
    if (photoFile && photoFile.size > 0) {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

      const s3 = new S3Client({
        region:   'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
      });

      const key    = `profiles/${slug}/${photoFile.name}`;
      const buffer = Buffer.from(await photoFile.arrayBuffer());

      await s3.send(new PutObjectCommand({
        Bucket:      process.env.R2_BUCKET_NAME!,
        Key:         key,
        Body:        buffer,
        ContentType: photoFile.type,
      }));

      // Requires "Public Access" to be enabled on the bucket in Cloudflare dashboard
      photoUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    }

    const db = getDb();

    await db.insert(profiles).values({
      name, slug, age, location, city, tier,
      isNew:      true,
      isVerified: false,
      status:     'recent',
      picsCount:  photoFile && photoFile.size > 0 ? 1 : 0,
      photoUrl,
      about,
      phone,
      whatsapp,
    } satisfies NewProfile);

    return { success: true, slug };

  } catch (err) {
    console.error('[createProfile]', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// ─── getProfiles ──────────────────────────────────────────────────────────────

export async function getProfiles() {
  try {
    const db = getDb();
    return await db.select().from(profiles).orderBy(desc(profiles.createdAt));
  } catch (err) {
    console.error('[getProfiles]', err);
    return [];
  }
}

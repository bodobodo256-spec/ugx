'use server';

import { getDb } from '@/db/index';
import { profiles, type Profile, type NewProfile } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ─── helpers ─────────────────────────────────────────────────────────────────

function toSlug(name: string) {
  return (
    name.toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    + '-' + Date.now().toString(36)
  );
}

export async function uploadMedia(file: File, folder: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    const r2AccountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2Bucket    = process.env.R2_BUCKET_NAME || 'ugx-bucket';
    const r2PublicUrl = process.env.R2_PUBLIC_URL || 'https://pub-69c390381fd247b6a79b2d9ad87415e9.r2.dev';

    if (!r2AccountId || !r2AccessKey || !r2SecretKey) {
      console.warn('[uploadMedia] R2 credentials not configured, skipping media upload');
      return null;
    }

    const s3 = new S3Client({
      region:   'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:     r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    });

    const isVideo = file.type?.startsWith('video/') || /\.(mp4|webm|mov|m4v|3gp)$/i.test(file.name);
    const subfolder = isVideo ? 'videos' : 'photos';
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key    = `profiles/${folder}/${subfolder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${cleanName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let contentType = file.type;
    if (!contentType) {
      if (cleanName.endsWith('.mp4')) contentType = 'video/mp4';
      else if (cleanName.endsWith('.webm')) contentType = 'video/webm';
      else if (cleanName.endsWith('.png')) contentType = 'image/png';
      else if (cleanName.endsWith('.webp')) contentType = 'image/webp';
      else contentType = 'image/jpeg';
    }

    await s3.send(new PutObjectCommand({
      Bucket:      r2Bucket,
      Key:         key,
      Body:        buffer,
      ContentType: contentType,
    }));

    return `${r2PublicUrl}/${key}`;
  } catch (err) {
    console.error('[uploadMedia error]', err);
    return null;
  }
}


// ─── Public: createProfile (from registration page) ──────────────────────────

export async function createProfile(formData: FormData): Promise<
  { success: true; slug: string } | { success: false; error: string }
> {
  try {
    const name        = (formData.get('name')        as string)?.trim();
    const age         = parseInt(formData.get('age') as string, 10);
    const location    = (formData.get('location')    as string)?.trim();
    const city        = (formData.get('city')        as string)?.trim();
    const tier        = ((formData.get('tier')       as string) ?? 'Standard') as NewProfile['tier'];
    const phone       = (formData.get('phone')       as string)?.trim();
    const whatsapp    = (formData.get('whatsapp')    as string)?.trim();
    const about       = ((formData.get('about')      as string) ?? '').trim();
    const category    = ((formData.get('category')   as string) ?? 'Adult Hookup').trim();
    const services    = ((formData.get('services')   as string) ?? '').trim();
    const paymentRef  = ((formData.get('payment_ref') as string) ?? '').trim();

    // 1. Featured profile photo
    const photoFile   = formData.get('photo')        as File | null;

    // 2. Gallery photos (multiple files or comma/newline separated URLs)
    const galleryFiles = formData.getAll('gallery').filter((item): item is File => item instanceof File && item.size > 0);
    const rawGalleryUrls = (formData.get('galleryUrls') as string) || '';

    // 3. Videos (multiple video files or comma/newline separated URLs)
    const videoFiles = formData.getAll('videos').filter((item): item is File => item instanceof File && item.size > 0);
    const rawVideoUrls = (formData.get('videoUrls') as string) || '';

    if (!name || !age || age < 18 || !location || !city || !phone || !whatsapp) {
      return { success: false, error: 'Please fill in all required fields (18+).' };
    }

    const slug = toSlug(name);
    let photoUrl: string | null = null;

    // Upload main profile photo
    if (photoFile && photoFile.size > 0) {
      photoUrl = await uploadMedia(photoFile, slug);
    }

    // Upload gallery photos to R2
    const galleryList: string[] = [];
    if (rawGalleryUrls.trim()) {
      try {
        const parsed = JSON.parse(rawGalleryUrls);
        if (Array.isArray(parsed)) galleryList.push(...parsed);
      } catch {
        galleryList.push(...rawGalleryUrls.split(/[\n,]+/).map(s => s.trim()).filter(Boolean));
      }
    }
    for (const gFile of galleryFiles) {
      const gUrl = await uploadMedia(gFile, slug);
      if (gUrl) galleryList.push(gUrl);
    }

    // Upload videos to R2
    const videoList: string[] = [];
    if (rawVideoUrls.trim()) {
      try {
        const parsed = JSON.parse(rawVideoUrls);
        if (Array.isArray(parsed)) videoList.push(...parsed);
      } catch {
        videoList.push(...rawVideoUrls.split(/[\n,]+/).map(s => s.trim()).filter(Boolean));
      }
    }
    for (const vFile of videoFiles) {
      const vUrl = await uploadMedia(vFile, slug);
      if (vUrl) videoList.push(vUrl);
    }

    // Weekly pricing: Standard = 10,000 UGX, VIP = 25,000 UGX
    const paymentAmount = tier === 'VIP' ? 25000 : 10000;
    const picsCount = (photoUrl ? 1 : 0) + galleryList.length;
    const vidsCount = videoList.length;

    const db = getDb();

    await db.insert(profiles).values({
      name,
      slug,
      age,
      location,
      city,
      tier,
      category,
      services,
      isNew:         true,
      isVerified:    false,
      isApproved:    false, // Must be approved by admin before appearing publicly
      isArchived:    false,
      isPremium:     false,
      paymentStatus: 'pending',
      paymentAmount,
      paymentRef:    paymentRef || null,
      status:        'recent',
      picsCount,
      vidsCount,
      photoUrl,
      galleryUrls:   galleryList.length ? JSON.stringify(galleryList) : null,
      videoUrls:     videoList.length ? JSON.stringify(videoList) : null,
      about,
      phone,
      whatsapp,
    } satisfies NewProfile);

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch (revErr) {
      console.warn('[revalidatePath warning]', revErr);
    }
    return { success: true, slug };

  } catch (err) {
    console.error('[createProfile]', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

// ─── Public: getProfiles (active & approved only) ──────────────────────────────

export async function getProfiles(): Promise<Profile[]> {
  try {
    const db = getDb();
    const all = await db.select().from(profiles).orderBy(desc(profiles.createdAt));
    // Only return profiles that are explicitly approved and not archived
    return all.filter((p) => p.isApproved === true && !p.isArchived);
  } catch (err) {
    console.error('[getProfiles]', err);
    return [];
  }
}

// ─── Admin: getAdminProfiles (all profiles) ───────────────────────────────────

export async function getAdminProfiles(): Promise<Profile[]> {
  try {
    const db = getDb();
    return await db.select().from(profiles).orderBy(desc(profiles.createdAt));
  } catch (err) {
    console.error('[getAdminProfiles]', err);
    return [];
  }
}

// ─── Admin: getProfileById ───────────────────────────────────────────────────

export async function getProfileById(id: number): Promise<Profile | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error('[getProfileById]', err);
    return null;
  }
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(profiles).where(eq(profiles.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error('[getProfileBySlug]', err);
    return null;
  }
}

export async function getProfileByIdOrSlug(idOrSlug: string | number): Promise<Profile | null> {
  const numId = typeof idOrSlug === 'number' ? idOrSlug : parseInt(String(idOrSlug).trim(), 10);
  if (!isNaN(numId) && String(numId) === String(idOrSlug).trim()) {
    const byId = await getProfileById(numId);
    if (byId) return byId;
  }
  return getProfileBySlug(String(idOrSlug).trim());
}

// ─── Admin: Toggle Actions ───────────────────────────────────────────────────

export async function toggleProfileApproval(id: number, isApproved: boolean) {
  try {
    const db = getDb();
    await db.update(profiles).set({ isApproved }).where(eq(profiles.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[toggleProfileApproval]', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function toggleProfileArchive(id: number, isArchived: boolean) {
  try {
    const db = getDb();
    await db.update(profiles).set({ isArchived }).where(eq(profiles.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[toggleProfileArchive]', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function toggleProfileVip(id: number, isVip: boolean) {
  try {
    const db = getDb();
    await db.update(profiles).set({ tier: isVip ? 'VIP' : 'Standard' }).where(eq(profiles.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[toggleProfileVip]', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function toggleProfilePremium(id: number, isPremium: boolean) {
  try {
    const db = getDb();
    await db.update(profiles).set({ isPremium }).where(eq(profiles.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[toggleProfilePremium]', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function toggleProfileNew(id: number, isNew: boolean) {
  try {
    const db = getDb();
    await db.update(profiles).set({ isNew }).where(eq(profiles.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[toggleProfileNew]', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function toggleProfileVerified(id: number, isVerified: boolean) {
  try {
    const db = getDb();
    await db.update(profiles).set({ isVerified }).where(eq(profiles.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[toggleProfileVerified]', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updatePaymentStatus(
  id: number,
  paymentStatus: 'pending' | 'verified' | 'unpaid' | 'failed',
  paymentAmount?: number,
  paymentRef?: string
) {
  try {
    const db = getDb();
    const updateData: Partial<Profile> = { paymentStatus };
    if (typeof paymentAmount === 'number') {
      updateData.paymentAmount = paymentAmount;
    }
    if (typeof paymentRef === 'string') {
      updateData.paymentRef = paymentRef;
    }
    // If admin verifies payment, also automatically approve the profile for convenience
    if (paymentStatus === 'verified') {
      updateData.isApproved = true;
    }

    await db.update(profiles).set(updateData).where(eq(profiles.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[updatePaymentStatus]', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Admin: Create Profile directly ──────────────────────────────────────────

export async function adminCreateProfile(formData: FormData): Promise<
  { success: true; profileId: number } | { success: false; error: string }
> {
  try {
    const name        = (formData.get('name')        as string)?.trim();
    const age         = parseInt(formData.get('age') as string, 10);
    const location    = (formData.get('location')    as string)?.trim();
    const city        = (formData.get('city')        as string)?.trim();
    const tier        = ((formData.get('tier')       as string) ?? 'Standard') as NewProfile['tier'];
    const phone       = (formData.get('phone')       as string)?.trim();
    const whatsapp    = (formData.get('whatsapp')    as string)?.trim();
    const about       = ((formData.get('about')      as string) ?? '').trim();
    const customPhotoUrl = ((formData.get('photoUrl') as string) ?? '').trim();
    const photoFile   = formData.get('photo')        as File | null;

    const isApproved  = formData.get('isApproved') === 'true';
    const isArchived  = formData.get('isArchived') === 'true';
    const isVip       = formData.get('isVip') === 'true' || tier === 'VIP';
    const isPremium   = formData.get('isPremium') === 'true' || tier === 'Premium';
    const isNew       = formData.get('isNew') === 'true';
    const isVerified  = formData.get('isVerified') === 'true';
    const paymentStatus = ((formData.get('paymentStatus') as string) ?? 'verified') as Profile['paymentStatus'];
    const paymentAmount = parseInt((formData.get('paymentAmount') as string) || (tier === 'VIP' ? '25000' : '10000'), 10);
    const paymentRef  = ((formData.get('paymentRef') as string) ?? '').trim();
    const status      = ((formData.get('status') as string) ?? 'online') as Profile['status'];
    const picsCount   = parseInt((formData.get('picsCount') as string) || '1', 10);

    if (!name || !age || !location || !city || !phone || !whatsapp) {
      return { success: false, error: 'Please fill in required fields (Name, Age, Location, City, Phone, WhatsApp).' };
    }

    const slug = toSlug(name);
    let photoUrl: string | null = customPhotoUrl || null;

    if (photoFile && photoFile.size > 0) {
      const uploaded = await uploadMedia(photoFile, slug);
      if (uploaded) photoUrl = uploaded;
    }

    // Upload gallery photos to R2
    const rawGalleryUrls = (formData.get('galleryUrls') as string) || '';
    const galleryFiles = formData.getAll('gallery').filter((item): item is File => item instanceof File && item.size > 0);
    const galleryList: string[] = [];
    if (rawGalleryUrls.trim()) {
      try {
        const parsed = JSON.parse(rawGalleryUrls);
        if (Array.isArray(parsed)) galleryList.push(...parsed);
      } catch {
        galleryList.push(...rawGalleryUrls.split(/[\n,]+/).map(s => s.trim()).filter(Boolean));
      }
    }
    for (const gFile of galleryFiles) {
      const gUrl = await uploadMedia(gFile, slug);
      if (gUrl) galleryList.push(gUrl);
    }

    // Upload videos to R2
    const rawVideoUrls = (formData.get('videoUrls') as string) || '';
    const videoFiles = formData.getAll('videos').filter((item): item is File => item instanceof File && item.size > 0);
    const videoList: string[] = [];
    if (rawVideoUrls.trim()) {
      try {
        const parsed = JSON.parse(rawVideoUrls);
        if (Array.isArray(parsed)) videoList.push(...parsed);
      } catch {
        videoList.push(...rawVideoUrls.split(/[\n,]+/).map(s => s.trim()).filter(Boolean));
      }
    }
    for (const vFile of videoFiles) {
      const vUrl = await uploadMedia(vFile, slug);
      if (vUrl) videoList.push(vUrl);
    }

    const finalTier = isVip ? 'VIP' : isPremium ? 'Premium' : tier;
    const finalPicsCount = Math.max(picsCount || 0, (photoUrl ? 1 : 0) + galleryList.length);

    const db = getDb();

    const inserted = await db.insert(profiles).values({
      name,
      slug,
      age,
      location,
      city,
      tier: finalTier,
      isNew,
      isVerified,
      isApproved,
      isArchived,
      isPremium,
      paymentStatus: paymentStatus ?? 'verified',
      paymentAmount: isNaN(paymentAmount) ? 10000 : paymentAmount,
      paymentRef: paymentRef || null,
      status,
      picsCount: finalPicsCount,
      vidsCount: videoList.length,
      photoUrl,
      galleryUrls: galleryList.length ? JSON.stringify(galleryList) : null,
      videoUrls: videoList.length ? JSON.stringify(videoList) : null,
      about,
      phone,
      whatsapp,
    } satisfies NewProfile).returning({ id: profiles.id });

    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch (revErr) {
      console.warn('[revalidatePath warning]', revErr);
    }
    const profileId = inserted[0]?.id || Date.now();
    return { success: true, profileId };

  } catch (err) {
    console.error('[adminCreateProfile]', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Admin: Update Full Profile ──────────────────────────────────────────────

export async function adminUpdateProfile(
  idOrFormData: number | string | FormData,
  maybeFormData?: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    let id: number;
    let formData: FormData;

    if (idOrFormData instanceof FormData) {
      formData = idOrFormData;
      const rawId = formData.get('id') as string;
      id = parseInt(rawId, 10);
    } else if (maybeFormData instanceof FormData) {
      formData = maybeFormData;
      id = typeof idOrFormData === 'number' ? idOrFormData : parseInt(String(idOrFormData), 10);
      if (isNaN(id) && formData.has('id')) {
        id = parseInt(formData.get('id') as string, 10);
      }
    } else {
      return { success: false, error: 'Invalid form submission: no form data provided.' };
    }

    if (!id || isNaN(id) || id <= 0) {
      return { success: false, error: `Invalid profile ID (${id}). Cannot update profile.` };
    }

    const name        = (formData.get('name')        as string)?.trim();
    const rawAge      = formData.get('age')          as string;
    const age         = rawAge ? parseInt(rawAge, 10) : NaN;
    const location    = (formData.get('location')    as string)?.trim();
    const city        = (formData.get('city')        as string)?.trim();
    const tier        = ((formData.get('tier')       as string) ?? 'Standard') as NewProfile['tier'];
    const phone       = (formData.get('phone')       as string)?.trim();
    const whatsapp    = (formData.get('whatsapp')    as string)?.trim();
    const about       = ((formData.get('about')      as string) ?? '').trim();
    const customPhotoUrl = ((formData.get('photoUrl') as string) ?? '').trim();
    const photoFile   = formData.get('photo')        as File | null;

    if (!name || isNaN(age) || !location || !city || !phone || !whatsapp) {
      return {
        success: false,
        error: 'Please fill in required fields: Name, Age, Location, City, Phone, and WhatsApp.',
      };
    }

    const isApproved  = formData.get('isApproved') === 'true';
    const isArchived  = formData.get('isArchived') === 'true';
    const isPremium   = formData.get('isPremium') === 'true' || tier === 'Premium';
    const isNew       = formData.get('isNew') === 'true';
    const isVerified  = formData.get('isVerified') === 'true';
    const paymentStatus = ((formData.get('paymentStatus') as string) ?? 'pending') as Profile['paymentStatus'];
    const paymentAmount = parseInt((formData.get('paymentAmount') as string) || '0', 10);
    const paymentRef  = ((formData.get('paymentRef') as string) ?? '').trim();
    const rawStatus   = formData.get('status') as string | null;
    const picsCount   = parseInt((formData.get('picsCount') as string) || '0', 10);

    const updateFields: Record<string, any> = {
      name,
      age,
      location,
      city,
      tier,
      phone,
      whatsapp,
      about,
      isApproved,
      isArchived,
      isPremium,
      isNew,
      isVerified,
      paymentStatus,
      paymentAmount: isNaN(paymentAmount) ? 0 : paymentAmount,
      paymentRef: paymentRef || null,
      picsCount: isNaN(picsCount) ? 0 : picsCount,
    };

    if (rawStatus === 'online' || rawStatus === 'recent') {
      updateFields.status = rawStatus;
    }

    if (customPhotoUrl) {
      updateFields.photoUrl = customPhotoUrl;
    }

    if (photoFile && photoFile.size > 0) {
      const uploaded = await uploadMedia(photoFile, `profile-${id}`);
      if (uploaded) {
        updateFields.photoUrl = uploaded;
      }
    }

    // 2. Gallery photos
    const rawGalleryUrls = formData.get('galleryUrls') as string | null;
    let galleryList: string[] = [];
    if (rawGalleryUrls !== null) {
      try {
        const parsed = JSON.parse(rawGalleryUrls);
        if (Array.isArray(parsed)) galleryList = parsed;
      } catch {
        galleryList = rawGalleryUrls.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      }
    }

    const newGalleryFiles = formData.getAll('gallery').filter((item): item is File => item instanceof File && item.size > 0);
    for (const gFile of newGalleryFiles) {
      const gUrl = await uploadMedia(gFile, `profile-${id}`);
      if (gUrl) galleryList.push(gUrl);
    }
    if (rawGalleryUrls !== null || newGalleryFiles.length > 0) {
      updateFields.galleryUrls = galleryList.length ? JSON.stringify(galleryList) : null;
      updateFields.picsCount = (updateFields.photoUrl || customPhotoUrl ? 1 : 0) + galleryList.length;
    }

    // 3. Videos
    const rawVideoUrls = formData.get('videoUrls') as string | null;
    let videoList: string[] = [];
    if (rawVideoUrls !== null) {
      try {
        const parsed = JSON.parse(rawVideoUrls);
        if (Array.isArray(parsed)) videoList = parsed;
      } catch {
        videoList = rawVideoUrls.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      }
    }

    const newVideoFiles = formData.getAll('videos').filter((item): item is File => item instanceof File && item.size > 0);
    for (const vFile of newVideoFiles) {
      const vUrl = await uploadMedia(vFile, `profile-${id}`);
      if (vUrl) videoList.push(vUrl);
    }
    if (rawVideoUrls !== null || newVideoFiles.length > 0) {
      updateFields.videoUrls = videoList.length ? JSON.stringify(videoList) : null;
      updateFields.vidsCount = videoList.length;
    }

    const db = getDb();
    await db.update(profiles).set(updateFields).where(eq(profiles.id, id));

    try {
      revalidatePath('/');
      revalidatePath('/admin');
      revalidatePath(`/admin/edit/${id}`);
      revalidatePath(`/profile/${id}`);
    } catch (revErr) {
      console.warn('[revalidatePath warning]', revErr);
    }
    return { success: true };
  } catch (err) {
    console.error('[adminUpdateProfile]', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Admin: Delete Profile ───────────────────────────────────────────────────

export async function deleteProfile(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    await db.delete(profiles).where(eq(profiles.id, id));
    try {
      revalidatePath('/');
      revalidatePath('/admin');
      revalidatePath(`/profile/${id}`);
    } catch (revErr) {
      console.warn('[revalidatePath warning]', revErr);
    }
    return { success: true };
  } catch (err) {
    console.error('[deleteProfile]', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Admin: Refresh — fetch fresh profile list ────────────────────────────────

export async function fetchAdminProfiles(): Promise<Profile[]> {
  return getAdminProfiles();
}

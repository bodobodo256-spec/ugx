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

async function uploadPhoto(file: File, slug: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    const s3 = new S3Client({
      region:   'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const key    = `profiles/${slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET_NAME!,
      Key:         key,
      Body:        buffer,
      ContentType: file.type || 'image/jpeg',
    }));

    return `${process.env.R2_PUBLIC_URL}/${key}`;
  } catch (err) {
    console.error('[uploadPhoto error]', err);
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
    const paymentRef  = ((formData.get('payment_ref') as string) ?? '').trim();
    const photoFile   = formData.get('photo')        as File | null;

    if (!name || !age || age < 18 || !location || !city || !phone || !whatsapp) {
      return { success: false, error: 'Please fill in all required fields (18+).' };
    }

    const slug = toSlug(name);
    let photoUrl: string | null = null;

    if (photoFile && photoFile.size > 0) {
      photoUrl = await uploadPhoto(photoFile, slug);
    }

    // Weekly pricing: Standard = 10,000 UGX, VIP = 25,000 UGX
    const paymentAmount = tier === 'VIP' ? 25000 : 10000;

    const db = getDb();

    await db.insert(profiles).values({
      name,
      slug,
      age,
      location,
      city,
      tier,
      isNew:         true,
      isVerified:    false,
      isApproved:    false, // Must be approved by admin before appearing publicly
      isArchived:    false,
      isPremium:     false,
      paymentStatus: 'pending',
      paymentAmount,
      paymentRef:    paymentRef || null,
      status:        'recent',
      picsCount:     photoUrl ? 1 : 0,
      photoUrl,
      about,
      phone,
      whatsapp,
    } satisfies NewProfile);

    revalidatePath('/');
    revalidatePath('/admin');
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
    // Only return profiles that are approved and not archived
    return all.filter((p) => p.isApproved !== false && !p.isArchived);
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
    return { success: false, error: 'Failed to update approval status' };
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
    return { success: false, error: 'Failed to update archive status' };
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
    return { success: false, error: 'Failed to update VIP status' };
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
    return { success: false, error: 'Failed to update Premium status' };
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
    return { success: false, error: 'Failed to update New status' };
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
    return { success: false, error: 'Failed to update Verified status' };
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
    return { success: false, error: 'Failed to update payment status' };
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
      const uploaded = await uploadPhoto(photoFile, slug);
      if (uploaded) photoUrl = uploaded;
    }

    const finalTier = isVip ? 'VIP' : isPremium ? 'Premium' : tier;

    const db = getDb();

    await db.insert(profiles).values({
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
      picsCount,
      photoUrl,
      about,
      phone,
      whatsapp,
    } satisfies NewProfile);

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, profileId: Date.now() };

  } catch (err) {
    console.error('[adminCreateProfile]', err);
    return { success: false, error: 'Failed to create profile' };
  }
}

// ─── Admin: Update Full Profile ──────────────────────────────────────────────

export async function adminUpdateProfile(id: number, formData: FormData): Promise<
  { success: true } | { success: false; error: string }
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
    const isPremium   = formData.get('isPremium') === 'true';
    const isNew       = formData.get('isNew') === 'true';
    const isVerified  = formData.get('isVerified') === 'true';
    const paymentStatus = ((formData.get('paymentStatus') as string) ?? 'pending') as Profile['paymentStatus'];
    const paymentAmount = parseInt((formData.get('paymentAmount') as string) || '0', 10);
    const paymentRef  = ((formData.get('paymentRef') as string) ?? '').trim();
    const status      = ((formData.get('status') as string) ?? 'recent') as Profile['status'];
    const picsCount   = parseInt((formData.get('picsCount') as string) || '0', 10);

    const updateFields: Partial<Profile> = {
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
      status,
      picsCount,
    };

    if (customPhotoUrl) {
      updateFields.photoUrl = customPhotoUrl;
    }

    if (photoFile && photoFile.size > 0) {
      const uploaded = await uploadPhoto(photoFile, `edit-${id}`);
      if (uploaded) updateFields.photoUrl = uploaded;
    }

    const db = getDb();
    await db.update(profiles).set(updateFields).where(eq(profiles.id, id));

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[adminUpdateProfile]', err);
    return { success: false, error: 'Failed to update profile' };
  }
}

// ─── Admin: Delete Profile ───────────────────────────────────────────────────

export async function deleteProfile(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    await db.delete(profiles).where(eq(profiles.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[deleteProfile]', err);
    return { success: false, error: 'Failed to delete profile' };
  }
}

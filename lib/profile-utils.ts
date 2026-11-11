import { type Profile } from '@/db/schema';

/**
 * Determines if a profile belongs to any VIP tier (e.g. 'VIP', 'VIP Spa').
 */
export function isVipProfile(profile: Pick<Profile, 'tier'>): boolean {
  return Boolean(profile.tier && profile.tier.startsWith('VIP'));
}

/**
 * Determines if a profile is Premium (either isPremium flag is true or tier is 'Premium').
 */
export function isPremiumProfile(profile: Pick<Profile, 'isPremium' | 'tier'>): boolean {
  return Boolean(profile.isPremium || profile.tier === 'Premium');
}

/**
 * Parses raw JSON string or comma/newline-delimited string of media URLs into an array.
 */
export function parseMediaUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  }
}

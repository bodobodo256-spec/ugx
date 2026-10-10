import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/site';
import { LOCATIONS } from '@/data/locations';
import { getProfiles } from '@/app/actions/profiles';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/create-profile`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Location pages for all Ugandan cities
  const locationRoutes: MetadataRoute.Sitemap = LOCATIONS.map((loc) => ({
    url: `${baseUrl}/location/${loc.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Fetch approved profile pages for indexing
  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const approvedProfiles = await getProfiles();
    profileRoutes = approvedProfiles.map((p) => ({
      url: `${baseUrl}/profile/${p.slug || p.id}`,
      lastModified: p.createdAt ? new Date(p.createdAt) : now,
      changeFrequency: 'daily',
      priority: p.tier.startsWith('VIP') ? 0.9 : 0.8,
    }));
  } catch (err) {
    console.warn('[sitemap] Failed to fetch profiles:', err);
  }

  return [...staticRoutes, ...locationRoutes, ...profileRoutes];
}

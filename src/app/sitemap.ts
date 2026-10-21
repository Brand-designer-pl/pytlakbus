import type { MetadataRoute } from 'next';
import { site } from '@/content';

export const dynamic = 'force-static';

// Tylko kanoniczne, indeksowalne adresy zwracające 200 (z ukośnikiem — zgodnie z trailingSlash).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-10-21');
  return [
    { path: '/', priority: 1 },
    { path: '/oferta/', priority: 0.9 },
    { path: '/flota/', priority: 0.9 },
    { path: '/o-nas/', priority: 0.7 },
    { path: '/kontakt/', priority: 0.8 },
    { path: '/polityka-prywatnosci/', priority: 0.2 },
  ].map(({ path, priority }) => ({ url: `${site.url}${path}`, lastModified, changeFrequency: 'monthly', priority }));
}

import type { Metadata } from 'next';
import { area, company, contact, site } from '@/content';

// Podgląd (GitHub Pages) nie może konkurować z docelową domeną — workflow ustawia NEXT_PUBLIC_NOINDEX=1.
export const noindex = process.env.NEXT_PUBLIC_NOINDEX === '1';

/** Metadane podstrony: tytuł, opis, canonical (zawsze docelowa domena z www) i Open Graph. */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', locale: 'pl_PL', siteName: site.name, url: path, title, description, images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Pytlak Przewozy — przewóz osób busami z kierowcą' }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

/** Dane firmy dla wyszukiwarek (schema.org LocalBusiness) — wyłącznie fakty podane przez klienta. */
export function LocalBusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${site.url}/#firma`,
    name: company.name,
    alternateName: site.brand,
    legalName: `${company.name} ${company.owner}`,
    url: `${site.url}/`,
    image: `${site.url}/og.jpg`,
    logo: `${site.url}/media/logo-pytlakbus.png`,
    telephone: contact.phone?.display.replace(/\s/g, ''),
    email: contact.email ?? undefined,
    taxID: company.nip,
    address: { '@type': 'PostalAddress', streetAddress: 'ul. Topolowa 1', postalCode: '62-040', addressLocality: 'Puszczykowo', addressCountry: 'PL' },
    areaServed: area.map((name) => ({ '@type': 'Place', name })),
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

import { ContactPage } from '@/components/ContactPage';
import { pages } from '@/content';
import { LocalBusinessJsonLd, pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ ...pages.kontakt, path: '/kontakt/' });

export default function Page() {
  return (
    <>
      <LocalBusinessJsonLd />
      <ContactPage />
    </>
  );
}

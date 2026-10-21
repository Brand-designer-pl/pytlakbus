import { Landing } from '@/components/Landing';
import { pages } from '@/content';
import { LocalBusinessJsonLd, pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ ...pages.home, path: '/' });

export default function Page() {
  return (
    <>
      <LocalBusinessJsonLd />
      <Landing />
    </>
  );
}

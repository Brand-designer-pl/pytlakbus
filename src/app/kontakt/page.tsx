import type { Metadata } from 'next';
import { ContactPage } from '@/components/ContactPage';

export const metadata: Metadata = {
  title: 'Kontakt — PytlakBus',
  description: 'Zadzwoń albo napisz — przewóz osób 7 dni w tygodniu, 24 godziny na dobę.',
};

export default function Page() {
  return <ContactPage />;
}

import './globals.css';
import { ReactNode } from 'react';
import { Nav } from '@/components/nav';
import { HeaderAdBanner } from '@/components/ad-banners';

export const metadata = {
  title: 'Get It Off Your Chest',
  description: 'Luxury dark social venting platform'
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen max-w-5xl p-4 md:p-8">
          <Nav />
          <HeaderAdBanner />
          <section className="mt-6">{children}</section>
        </main>
      </body>
    </html>
  );
}

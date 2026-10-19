import type { Metadata } from 'next';
import { Newsreader, Public_Sans } from 'next/font/google';
import { StorefrontShell } from '@/components/layout/StorefrontShell';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Barakah Bazaar',
    template: '%s | Barakah Bazaar',
  },
  description: 'Curated bridal collections, farm-direct organic naturals, and Kerala pure coconut oil.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${newsreader.variable} ${publicSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        <ToastProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--surface)] focus:border focus:border-[var(--line)]"
          >
            Skip to content
          </a>

          <StorefrontShell>{children}</StorefrontShell>
        </ToastProvider>
      </body>
    </html>
  );
}

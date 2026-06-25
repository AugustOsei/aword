import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { SITE_URL } from '@/lib/config';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Aword — five words a day',
    template: '%s · Aword',
  },
  description:
    'Five words a day — and what they mean. A daily word game that teaches you the meaning of every word, with a medal for how you do.',
  applicationName: 'Aword',
  keywords: [
    'word game',
    'daily word game',
    'wordle-style',
    'vocabulary',
    'five letter words',
    'puzzle',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Aword',
    title: 'Aword — five words a day',
    description:
      'Five words a day — and what they mean. A daily word game that teaches you something every day.',
    url: '/',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aword — five words a day',
    description: 'Five words a day — and what they mean.',
  },
};

// Structured data so search engines understand this is a free web game.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Aword',
  url: SITE_URL,
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  genre: 'Word game',
  description:
    'Five words a day — and what they mean. A daily word game that teaches you the meaning of every word.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export const viewport: Viewport = {
  themeColor: '#FBFAF6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Runs before paint to apply the saved theme and avoid a flash.
// Defaults to the warm light theme; only goes dark if the player chose it.
const themeScript = `(function(){try{if(localStorage.getItem('aword:theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${hanken.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-bg text-ink antialiased">
        <Script id="aword-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K3T788EZJJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-K3T788EZJJ');`}
        </Script>
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col">
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}

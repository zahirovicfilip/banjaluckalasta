import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import { site } from '@/content/site';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Klub skakača, Banja Luka`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: 'website',
    locale: 'sr_BA',
    siteName: site.name,
    title: site.name,
    description: site.description,
    // The share image is src/app/opengraph-image.jpg (built by scripts/build-media.sh).
  },
};

export const viewport: Viewport = {
  // Lets the page paint under the notch; the header and .shell pad back with env().
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f7fa' },
    { media: '(prefers-color-scheme: dark)', color: '#03162b' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr-Latn" className={archivo.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Preskoči na sadržaj
        </a>
        {children}
      </body>
    </html>
  );
}

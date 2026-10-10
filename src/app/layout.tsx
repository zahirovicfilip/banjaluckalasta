import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Big_Shoulders_Stencil, Geist } from 'next/font/google';
import { site } from '@/content/site';
import { themeScript } from '@/lib/theme';
import './globals.css';

/*
 * Type: Big Shoulders for headlines and numbers (a condensed sports display face; its
 * optical-size axis keeps it crisp from a nav label to a 10rem number), Geist for reading
 * text. The stencil cut of Big Shoulders is only for the airsoft club's section. All three
 * carry latin-ext, for č ć š ž đ.
 */
const display = Big_Shoulders({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  variable: '--font-big-shoulders',
  display: 'swap',
});
const stencil = Big_Shoulders_Stencil({
  subsets: ['latin', 'latin-ext'],
  weight: ['800'],
  variable: '--font-big-shoulders-stencil',
  display: 'swap',
});
const sans = Geist({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-geist',
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
    <html lang="sr-Latn" className={`${display.variable} ${stencil.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* A theme picked in the menu is applied before the first paint (src/lib/theme.ts). */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
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

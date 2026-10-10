import type { Metadata } from 'next';
import { metadata as studioMetadata, viewport as studioViewport } from 'next-sanity/studio';
import { sanityReady } from '@/sanity/env';
import Studio from './Studio';

/**
 * The admin for news, at /studio. The Studio itself handles signing in: only
 * members of the club's Sanity project get past its sign-in screen. It is kept
 * out of search engines.
 */
export const dynamic = 'force-static';
export const metadata: Metadata = { ...studioMetadata, title: 'Admin', robots: { index: false, follow: false } };
export const viewport = studioViewport;

export default function StudioPage() {
  if (!sanityReady) {
    return (
      <main className="shell grid min-h-[100svh] place-content-center gap-3 text-center">
        <p className="display text-3xl">Admin još nije povezan</p>
        <p className="max-w-[46ch] text-muted">
          Upišite ID Sanity projekta u <code>src/sanity/env.ts</code> (ili kao NEXT_PUBLIC_SANITY_PROJECT_ID) i
          ponovo pokrenite sajt.
        </p>
      </main>
    );
  }
  return <Studio />;
}

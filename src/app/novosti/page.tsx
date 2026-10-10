import type { Metadata } from 'next';
import Streaks from '@/components/ui/Streaks';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/sections/Footer';
import SanityImage from '@/components/novosti/SanityImage';
import { sanityFetch } from '@/sanity/client';
import { formatDatum, novostiQuery, type NovostCard } from '@/sanity/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Novosti',
  description: 'Novosti iz udruženja „Banjalučka lasta“: skokovi, takmičenja, kamp na Manjači.',
};

/**
 * The news page: every post the club publishes in the Studio (/studio), newest
 * first. The newest one runs wide across the top, the rest follow in a grid.
 */
export default async function NovostiPage() {
  const posts = await sanityFetch<NovostCard[]>(novostiQuery, {}, []);
  const [first, ...rest] = posts;

  return (
    <>
      <Nav />
      <main id="main" className="relative isolate pb-24 pt-[calc(env(safe-area-inset-top,0px)+8.5rem)] sm:pt-40">
        <Streaks side="right" />
        <div className="shell">
          <h1 className="display text-[clamp(4rem,14vw,10rem)]">Novosti</h1>

          {!first && (
            <div className="mt-10 max-w-[44ch]">
              <p className="text-2xl font-medium leading-snug">Uskoro prve novosti.</p>
              <p className="mt-3 text-lg leading-relaxed text-muted">Ovdje će se pojavljivati vijesti sa mosta, sa takmičenja i iz kampa.</p>
              <Link href="/" className="btn btn-ghost mt-6">
                Nazad na početnu
              </Link>
            </div>
          )}

          {first && (
            <Link href={`/novosti/${first.slug}`} className="group mt-12 grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
              {first.naslovna && (
                <div className="overflow-hidden rounded-[var(--radius)] bg-surface md:col-span-7">
                  <SanityImage
                    image={first.naslovna}
                    aspect={4 / 3}
                    sizes="(min-width: 768px) 58vw, 100vw"
                    priority
                    className="aspect-[4/3] w-full object-cover transition-[scale] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="md:col-span-5 md:pb-2">
                <p className="text-muted tabular-nums">{formatDatum(first.datum)}</p>
                <h2 className="display mt-3 text-[clamp(1.9rem,4vw,3.25rem)]">{first.naslov}</h2>
                <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-muted">{first.opis}</p>
                <span className="mt-6 inline-block font-semibold text-accent-ink">Pročitaj →</span>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <ul className="mt-16 grid gap-x-6 gap-y-12 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <li key={post._id}>
                  <Link href={`/novosti/${post.slug}`} className="group block">
                    {post.naslovna && (
                      <div className="overflow-hidden rounded-[var(--radius)] bg-surface">
                        <SanityImage
                          image={post.naslovna}
                          aspect={4 / 3}
                          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
                          className="aspect-[4/3] w-full object-cover transition-[scale] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <h2 className="display mt-5 text-3xl">{post.naslov}</h2>
                    <p className="mt-2 text-sm text-muted tabular-nums">{formatDatum(post.datum)}</p>
                    <p className="mt-2 leading-relaxed text-muted">{post.opis}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

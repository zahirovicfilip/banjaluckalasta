import type { Metadata } from 'next';
import Streaks from '@/components/ui/Streaks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import Nav from '@/components/Nav';
import Footer from '@/components/sections/Footer';
import SanityImage from '@/components/novosti/SanityImage';
import YouTube from '@/components/ui/YouTube';
import { sanityFetch, urlFor } from '@/sanity/client';
import { formatDatum, novostQuery, slugsQuery, type Novost } from '@/sanity/queries';
import { youtubeIdFrom } from '@/sanity/schemaTypes/novost';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>(slugsQuery, {}, []);
  return slugs.map((slug) => ({ slug }));
}

async function load(slug: string) {
  return sanityFetch<Novost | null>(novostQuery, { slug }, null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await load((await params).slug);
  if (!post) return {};
  const image = post.naslovna ? urlFor(post.naslovna).width(1200).height(630).fit('crop').url() : undefined;
  return {
    title: post.naslov,
    description: post.opis,
    openGraph: { type: 'article', title: post.naslov, description: post.opis, images: image ? [image] : undefined },
  };
}

const text: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-5 first:mt-0">{children}</p>,
    h3: ({ children }) => <h3 className="mt-10 text-xl font-semibold text-ink">{children}</h3>,
  },
  list: { bullet: ({ children }) => <ul className="mt-5 list-disc space-y-2 pl-6">{children}</ul> },
};

/** One news post: title, date and description, the cover picture, the text, then the pictures and videos. */
export default async function NovostPage({ params }: Props) {
  const post = await load((await params).slug);
  if (!post) notFound();

  const gallery = post.galerija ?? [];

  return (
    <>
      <Nav />
      <main id="main" className="relative isolate pb-24 pt-[calc(env(safe-area-inset-top,0px)+8.5rem)] sm:pt-40">
        <Streaks side="left" />
        <article>
          <header className="shell">
            <Link href="/novosti" className="text-sm font-semibold text-accent-ink">
              ← Sve novosti
            </Link>
            <h1 className="display mt-10 max-w-[18ch] text-[clamp(2.25rem,6.5vw,5.5rem)]">{post.naslov}</h1>
            <p className="mt-4 text-muted tabular-nums">
              <time dateTime={post.datum}>{formatDatum(post.datum)}</time>
            </p>
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted sm:text-xl">{post.opis}</p>
          </header>

          {post.naslovna && (
            <div className="shell mt-12">
              <div className="overflow-hidden rounded-[var(--radius)] bg-surface">
                <SanityImage image={post.naslovna} sizes="(min-width: 1400px) 1320px, 100vw" priority className="max-h-[80svh] w-full object-cover" />
              </div>
            </div>
          )}

          {post.tekst && post.tekst.length > 0 && (
            <div className="shell mt-12">
              <div className="max-w-[65ch] text-lg leading-relaxed text-muted">
                <PortableText value={post.tekst as never} components={text} />
              </div>
            </div>
          )}

          {gallery.length > 0 && (
            <section aria-label="Slike i video" className="shell mt-16">
              {/* Columns rather than a grid, so tall and wide pictures keep their own shape. */}
              <ul className="gap-4 sm:columns-2 lg:columns-3">
                {gallery.map((item) => (
                  <li key={item._key} className="mb-4 break-inside-avoid">
                    <figure>
                      {item._type === 'image' && (
                        <div className="overflow-hidden rounded-[var(--radius)] bg-surface">
                          <SanityImage image={item} sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw" className="w-full" />
                        </div>
                      )}
                      {item._type === 'video' && item.url && (
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full rounded-[var(--radius)] bg-ink"
                        >
                          <source src={item.url} type={item.mimeType === 'video/quicktime' ? 'video/mp4' : item.mimeType} />
                        </video>
                      )}
                      {item._type === 'youtube' && youtubeIdFrom(item.url) && (
                        <YouTube id={youtubeIdFrom(item.url)!} title={item.opis || post.naslov} className="aspect-video w-full" />
                      )}
                      {item.opis && <figcaption className="mt-2 text-sm text-muted">{item.opis}</figcaption>}
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}

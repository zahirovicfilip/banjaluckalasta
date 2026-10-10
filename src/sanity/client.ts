import { createClient } from 'next-sanity';
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { apiVersion, dataset, projectId, sanityReady } from './env';

/** Reads published posts only, from Sanity's CDN. No token: the dataset is public to read. */
export const client = createClient({ projectId: projectId || 'missing', dataset, apiVersion, useCdn: true, perspective: 'published' });

const builder = createImageUrlBuilder({ projectId: projectId || 'missing', dataset });
/** A resized, cropped, modern-format picture URL: `urlFor(img).width(800).url()`. */
export const urlFor = (source: SanityImageSource) => builder.image(source).auto('format');

/**
 * Runs a query, cached for a minute: a new post shows up on the site within
 * about a minute of being published. Without a project it returns the fallback.
 */
export async function sanityFetch<T>(query: string, params: Record<string, string> = {}, fallback: T): Promise<T> {
  if (!sanityReady) return fallback;
  try {
    return await client.fetch<T>(query, params, { next: { revalidate: 60, tags: ['novost'] } });
  } catch (error) {
    console.error('Sanity fetch failed', error);
    return fallback;
  }
}

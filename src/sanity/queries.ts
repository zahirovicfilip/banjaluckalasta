import { defineQuery } from 'next-sanity';
import type { SanityImageSource } from '@sanity/image-url';

type Picture = SanityImageSource & { alt?: string; lqip?: string; aspect?: number };

export type NovostCard = {
  _id: string;
  naslov: string;
  slug: string;
  datum: string;
  opis: string;
  naslovna: Picture | null;
};

export type GalleryItem =
  | ({ _type: 'image'; _key: string; opis?: string } & Picture)
  | { _type: 'video'; _key: string; opis?: string; url: string; mimeType?: string }
  | { _type: 'youtube'; _key: string; opis?: string; url: string };

export type Novost = NovostCard & {
  tekst: unknown[] | null;
  galerija: GalleryItem[] | null;
};

const card = `
  _id, naslov, "slug": slug.current, datum, opis,
  naslovna{ ..., "lqip": asset->metadata.lqip, "aspect": asset->metadata.dimensions.aspectRatio }
`;

export const novostiQuery = defineQuery(`
  *[_type == "novost" && defined(slug.current)] | order(datum desc, _createdAt desc) { ${card} }
`);

export const novostQuery = defineQuery(`
  *[_type == "novost" && slug.current == $slug][0] {
    ${card},
    tekst,
    galerija[]{
      _type, _key, opis,
      _type == "image" => { ..., "lqip": asset->metadata.lqip, "aspect": asset->metadata.dimensions.aspectRatio },
      _type == "video" => { "url": asset->url, "mimeType": asset->mimeType },
      _type == "youtube" => { url }
    }
  }
`);

export const slugsQuery = defineQuery(`*[_type == "novost" && defined(slug.current)].slug.current`);

/** "2026-07-12" → "12. jul 2026." */
export function formatDatum(datum: string) {
  const months = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
  const [y, m, d] = datum.split('-').map(Number);
  return `${d}. ${months[m - 1]} ${y}.`;
}

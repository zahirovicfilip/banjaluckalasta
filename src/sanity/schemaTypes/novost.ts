import { defineArrayMember, defineField, defineType } from 'sanity';

/** "Šampionat na Đetinji" → "sampionat-na-djetinji": web addresses without č, ć, š, ž, đ. */
export function slugify(input: string) {
  const map: Record<string, string> = { č: 'c', ć: 'c', š: 's', ž: 'z', đ: 'dj' };
  return input
    .toLowerCase()
    .replace(/[čćšžđ]/g, (c) => map[c])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const youtubeId = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/;

/**
 * One news post. What the club's admin fills in, in the Studio at /studio:
 * a title, a date, a cover picture, a short description for the list, an
 * optional longer text, and any number of pictures, uploaded videos and
 * YouTube links.
 */
export const novost = defineType({
  name: 'novost',
  title: 'Novost',
  type: 'document',
  fields: [
    defineField({
      name: 'naslov',
      title: 'Naslov',
      type: 'string',
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Adresa stranice',
      description: 'Pravi se iz naslova klikom na „Generate“.',
      type: 'slug',
      options: { source: 'naslov', slugify },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'datum',
      title: 'Datum',
      type: 'date',
      options: { dateFormat: 'DD. MM. YYYY.' },
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'naslovna',
      title: 'Naslovna slika',
      description: 'Prikazuje se u listi novosti i na vrhu objave.',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Šta je na slici', type: 'string' })],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'opis',
      title: 'Kratak opis',
      description: 'Jedna ili dvije rečenice za listu novosti.',
      type: 'text',
      rows: 3,
      validation: (r) => r.required().max(240),
    }),
    defineField({
      name: 'tekst',
      title: 'Tekst',
      description: 'Duži opis, ako treba. Može ostati prazan.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraf', value: 'normal' },
            { title: 'Podnaslov', value: 'h3' },
          ],
          lists: [{ title: 'Lista', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Podebljano', value: 'strong' },
              { title: 'Ukošeno', value: 'em' },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'galerija',
      title: 'Slike i video',
      description: 'Slike i kraći video snimci se dodaju direktno. Za duže snimke stavite YouTube link.',
      type: 'array',
      options: { layout: 'grid' },
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Slika',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Šta je na slici', type: 'string' }),
            defineField({ name: 'opis', title: 'Potpis', type: 'string' }),
          ],
        }),
        defineArrayMember({
          name: 'video',
          type: 'file',
          title: 'Video',
          options: { accept: 'video/mp4,video/quicktime,video/webm' },
          fields: [defineField({ name: 'opis', title: 'Potpis', type: 'string' })],
        }),
        defineArrayMember({
          name: 'youtube',
          type: 'object',
          title: 'YouTube video',
          fields: [
            defineField({
              name: 'url',
              title: 'Link',
              type: 'url',
              validation: (r) =>
                r.required().custom((url) => (!url || youtubeId.test(url) ? true : 'Ovo nije YouTube link.')),
            }),
            defineField({ name: 'opis', title: 'Potpis', type: 'string' }),
          ],
          preview: { select: { title: 'opis', subtitle: 'url' }, prepare: ({ title, subtitle }) => ({ title: title || 'YouTube video', subtitle }) },
        }),
      ],
    }),
  ],
  orderings: [{ title: 'Najnovije prvo', name: 'datumDesc', by: [{ field: 'datum', direction: 'desc' }] }],
  preview: {
    select: { title: 'naslov', datum: 'datum', media: 'naslovna' },
    prepare: ({ title, datum, media }) => ({
      title,
      subtitle: datum ? datum.split('-').reverse().join('. ') + '.' : 'Bez datuma',
      media,
    }),
  },
});

/** The 11-character YouTube ID from any kind of YouTube link, or null. */
export function youtubeIdFrom(url: string | undefined) {
  return url?.match(youtubeId)?.[1] ?? null;
}

'use client';

/**
 * The Studio, the club's admin for news, served by the site itself at /studio
 * (src/app/studio). Only people invited to the Sanity project can sign in and
 * edit; everyone else gets the sign-in screen and nothing more.
 */
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { dataset, projectId } from './src/sanity/env';
import { novost } from './src/sanity/schemaTypes/novost';

export default defineConfig({
  name: 'banjalucka-lasta',
  title: 'Banjalučka lasta',
  basePath: '/studio',
  projectId: projectId || 'missing',
  dataset,
  schema: { types: [novost] },
  plugins: [
    structureTool({
      title: 'Sadržaj',
      structure: (S) =>
        S.list()
          .title('Sadržaj')
          .items([
            S.listItem()
              .title('Novosti')
              .schemaType('novost')
              .child(S.documentTypeList('novost').title('Novosti').defaultOrdering([{ field: 'datum', direction: 'desc' }])),
          ]),
    }),
  ],
  document: {
    // Only "Novost" can be created from the "+" button.
    newDocumentOptions: (prev) => prev.filter((t) => t.templateId === 'novost'),
  },
});

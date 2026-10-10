/**
 * Where the news lives: the club's Sanity project. The project ID and dataset
 * are not secrets (every visitor's browser sees them when it loads a picture),
 * so they are kept here rather than only in environment variables, and the
 * site works on any host without extra setup. An environment variable, if set,
 * wins.
 *
 * TODO: paste the project ID from sanity.io/manage once the project exists.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
/** The date of the API behaviour the queries are written against. */
export const apiVersion = '2026-10-01';

/** False until a project ID is set: the news page then shows an empty state instead of failing. */
export const sanityReady = /^[a-z0-9-]+$/.test(projectId);

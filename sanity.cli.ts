/** For the Sanity command line (`npx sanity ...`), e.g. adding a CORS origin. */
import { defineCliConfig } from 'sanity/cli';
import { dataset, projectId } from './src/sanity/env';

export default defineCliConfig({ api: { projectId, dataset } });

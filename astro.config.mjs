import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Tailwind v3 is wired through PostCSS (see postcss.config.mjs); the
// @astrojs/tailwind integration is not used (it does not support current Astro).
export default defineConfig({
  output: 'static',
  site: 'https://expertnetworks.net',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});

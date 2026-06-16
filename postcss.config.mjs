// Tailwind v3 is processed via PostCSS directly (Astro 6 deprecated the
// @astrojs/tailwind integration). The @tailwind directives live in
// src/styles/global.css, which BaseLayout imports.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

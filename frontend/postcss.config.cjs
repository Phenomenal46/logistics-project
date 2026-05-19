/*
 * postcss.config.cjs
 * Purpose: Wire Tailwind into PostCSS so styles compile correctly.
 * Why it exists: Tailwind is a PostCSS plugin under the hood.
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

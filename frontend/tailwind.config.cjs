/*
 * tailwind.config.cjs
 * Purpose: Tell Tailwind which files to scan for class names.
 * Why it exists: Tailwind removes unused styles in production builds.
 */

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {}
  },
  plugins: []
};

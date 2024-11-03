/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/popup/index.html',
    './entrypoints/popup/**/*.{vue,js,ts,jsx,tsx}',
    './entrypoints/sidepanel/index.html',
    './entrypoints/sidepanel/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

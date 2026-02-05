/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          light: '#f3e5ab',
          dark: '#b8860b',
        },
        cream: '#fdfbf7',
      }
    },
  },
  plugins: [],
}

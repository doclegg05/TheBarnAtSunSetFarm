/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.tsx',
    './contexts/**/*.tsx',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Cormorant Garamond'", 'serif'],
        sans: ['Raleway', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

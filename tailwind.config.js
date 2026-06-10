/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './components/**/*.{js,ts,jsx,tsx}',
    './*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-cream': '#FDF8F5',
        'brand-charcoal': '#4a4a4a',
        'brand-pink': '#EAD1DC',
        'brand-sage': '#A2B29F',
        'brand-gold': '#D4AF37',
      },
      fontFamily: {
        sans: ['Raleway', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
    },
  },
  plugins: [],
};

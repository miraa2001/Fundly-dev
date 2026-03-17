/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clay: '#746258',
        moss: '#759971',
        lilac: '#d7cfe6',
        mist: '#93acba',
        teal: '#4c8a91',
      },
      boxShadow: {
        soft: '0 30px 80px rgba(116, 98, 88, 0.18)',
      },
      fontFamily: {
        sans: ['Aptos', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
        serif: ['Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};


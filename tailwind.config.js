/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f2f2f2',
        surface: '#ffffff',
        ink: '#011826',
        ocean: '#0c2a46',
        clay: '#A67a53',
        cedar: '#401f14',
      },
      fontFamily: {
        body: ['"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', 'Georgia', 'serif'],
        ui: ['"Aptos"', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        quiet: '0 1px 2px rgba(1, 24, 38, 0.04)',
      },
    },
  },
  plugins: [],
};

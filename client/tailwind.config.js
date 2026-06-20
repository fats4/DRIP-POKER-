/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#1a5c3a',
          dark: '#0f3d26',
          light: '#2a7a4f',
        },
        gold: {
          DEFAULT: '#d4a843',
          light: '#f0cc6a',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

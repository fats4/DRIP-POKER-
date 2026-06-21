/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        drip: {
          dark: '#0a0612',
          darker: '#12081c',
          purple: '#5B2D7A',
          plum: '#4A1D6B',
          violet: '#6B3FA0',
          cream: '#F5F0E8',
          creamDim: '#EDE4D4',
          gold: '#C9A227',
          goldLight: '#E8C547',
        },
        felt: {
          DEFAULT: '#2d1b4e',
          dark: '#1a0f2e',
          light: '#3d2866',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#E8C547',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'drip-gradient': 'linear-gradient(135deg, #0a0612 0%, #2d1b4e 50%, #0a0612 100%)',
        'table-felt': 'radial-gradient(ellipse at center, #3d2866 0%, #2d1b4e 45%, #1a0f2e 100%)',
      },
      boxShadow: {
        drip: '0 0 40px rgba(91, 45, 122, 0.35)',
        card: '0 8px 24px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};

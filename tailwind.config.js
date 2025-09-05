/** @type {import('tailwindcss').Config} */
import colors from './public/brand-colors.json';

export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        flash: 'flash 1.5s ease-out',
      },
      keyframes: {
        flash: {
            '0%, 100%': { backgroundColor: 'transparent' },
            '25%, 75%': { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}

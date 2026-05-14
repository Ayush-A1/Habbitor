/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 300:'#A5B4FC', 400:'#818CF8', 500:'#6366F1', 600:'#5558E3', 700:'#4338CA' },
      },
    },
  },
  plugins: [],
};

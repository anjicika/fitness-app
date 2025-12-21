/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gym-black': '#0a0a0a',
        'gym-gray': '#1f1f1f',
        'gym-green': '#ccff00', // Neonska zelena, gumbi/poudarki
        'gym-blue': '#00d1ff',  // Svetlo modra, grafi/napredek
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
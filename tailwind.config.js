/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0D1310',
        surface: '#151E19',
        'surface-light': '#1C2922',
        border: '#22332A',
        jade: '#10B981',
        'jade-dark': '#059669',
        champagne: '#D4AF37',
        'champagne-dark': '#C5A059',
        sage: '#8E9F95',
        cream: '#F9FBF9',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
};

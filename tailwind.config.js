/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8f4f3',
          100: '#ccefe9',
          200: '#99dfd4',
          300: '#66cfbe',
          400: '#33bfa9',
          500: '#0E8C7F',
          600: '#0E8C7F',
          700: '#0A6C62',
          800: '#085349',
          900: '#063a32',
        },
        cobalt: {
          500: '#2D5BFF',
          600: '#2448cc',
        },
        navy: {
          DEFAULT: '#14161D',
          50:  '#e8f4f3',
          100: '#ccefe9',
          200: '#99dfd4',
          300: '#66cfbe',
          400: '#33bfa9',
          500: '#0E8C7F',
          600: '#0E8C7F',
          700: '#0A6C62',
          800: '#14161D',
        },
        gold: '#F4A24C',
        paper: '#FAF8F4',
      },
      fontFamily: {
        sans: ['Sora', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

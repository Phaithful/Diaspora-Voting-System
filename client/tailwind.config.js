/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#008751',
          50: '#F0FBF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          600: '#008751',
          700: '#006B3F',
          800: '#065F46',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        'card-md': '0 4px 6px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
}


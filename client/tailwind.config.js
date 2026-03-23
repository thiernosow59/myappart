/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          700: '#1D4ED8',
          900: '#1A3D6E',
        },
        orange: {
          DEFAULT: '#F97316',
          dark:    '#EA580C',
        },
        slate: {
          bg: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

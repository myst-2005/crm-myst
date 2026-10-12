/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        edge: {
          bg: '#0B0A24',
          surface: '#11102D',
          elevated: '#171638',
          card: '#131235',
          border: 'rgba(196, 181, 253, 0.14)',
          borderSubtle: 'rgba(196, 181, 253, 0.08)',
          borderBright: 'rgba(196, 181, 253, 0.28)',
          violet: '#8B5CF6',
          'violet-hover': '#7C3AED',
          blue: '#4F7DFF',
          'blue-hover': '#3B6AEC',
          lavender: '#C4B5FD',
          white: '#F7F7FF',
          muted: '#AAA9C5',
          dark: '#08071B',
        },
        brand: {
          50: '#FAF7FD',
          100: '#F3EBF9',
          200: '#E6D7F3',
          300: '#D2B9EB',
          400: '#B892DF',
          500: '#9C6AD3',
          600: '#8B5CF6',
          700: '#7C3AED',
          800: '#6D28D9',
          900: '#4C1D95',
          950: '#2E1065',
        },
        myst: {
          dark: '#0B0A24',
          card: '#11102D',
          surface: '#171638',
          border: 'rgba(196, 181, 253, 0.14)',
          muted: '#AAA9C5',
          accent: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'premium': '0 4px 20px -2px rgba(139, 92, 246, 0.16), 0 2px 6px -1px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(11, 10, 36, 0.5)',
        'glow': '0 0 35px -5px rgba(139, 92, 246, 0.45)',
        'glow-blue': '0 0 35px -5px rgba(79, 125, 255, 0.45)',
        'horizon': '0 -15px 40px -10px rgba(139, 92, 246, 0.35)',
      }
    },
  },
  plugins: [],
}

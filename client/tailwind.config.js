/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          500: '#8B5CF6',
        },
        success: {
          DEFAULT: '#22C55E',
          500: '#22C55E',
        },
        warning: {
          DEFAULT: '#F59E0B',
          500: '#F59E0B',
        },
        danger: {
          DEFAULT: '#EF4444',
          500: '#EF4444',
        },
        dark: {
          bg: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          text: '#F8FAFC',
          muted: '#94A3B8'
        }
      },
    },
  },
  plugins: [],
};

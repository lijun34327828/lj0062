/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#E6ECEC',
          100: '#C2D0D0',
          200: '#9AB3B3',
          300: '#729696',
          400: '#558080',
          500: '#1A3A3A',
          600: '#152E2E',
          700: '#102323',
          800: '#0B1717',
          900: '#050C0C',
        },
        gold: {
          50: '#FAF6ED',
          100: '#F2E8D0',
          200: '#E9D8AE',
          300: '#DFC78C',
          400: '#D7BA71',
          500: '#C9A962',
          600: '#B89A5A',
          700: '#A38650',
          800: '#8E7346',
          900: '#6B5636',
        },
        accent: {
          50: '#F5E5E4',
          100: '#E5BDBB',
          200: '#D4928E',
          300: '#C26661',
          400: '#B4433C',
          500: '#A63B33',
          600: '#8E322C',
          700: '#762824',
          800: '#5E1F1C',
          900: '#461513',
        },
        cream: {
          50: '#FDFCF9',
          100: '#FAF7EF',
          200: '#F5F1E8',
          300: '#EFEADB',
          400: '#E8E4DB',
          500: '#D4CEC0',
          600: '#B8B0A0',
          700: '#8C8578',
          800: '#5E5950',
          900: '#2E2C28',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        serif: ['Noto Serif SC', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(201, 169, 98, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(201, 169, 98, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};

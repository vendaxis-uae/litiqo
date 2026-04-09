/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7c5cfc',
          600: '#6d4fe0',
          700: '#5b3ec9',
          800: '#4c32a8',
          900: '#3b2785',
        },
        surface: {
          bg: '#f8f8fc',
          bg2: '#efeff5',
          card: '#ffffff',
          hover: '#f0f0f6',
        },
        txt: {
          primary: '#111118',
          secondary: '#6b6b80',
          muted: '#9999aa',
        },
        status: {
          ok: '#059669',
          warn: '#d97706',
          danger: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'input': '10px',
        'modal': '20px',
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0,0,0,0.08)',
        'sm': '0 2px 8px rgba(0,0,0,0.05)',
        'glow': '0 0 0 3px rgba(109,79,224,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
        'pulse-slow': 'pulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

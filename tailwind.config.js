/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-bebas)'],
        body: ['var(--font-dm-sans)'],
      },
      colors: {
        gold: '#FFD700',
        'gold-dark': '#B8960C',
        'gold-light': '#FFF176',
        dark: '#0A0A0A',
        'dark-2': '#111111',
        'dark-3': '#1A1A1A',
        'dark-4': '#242424',
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,215,0,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255,215,0,0)' },
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust this based on your file structure
  ],
  theme: {
    extend: {
      colors: {
        // Mapping your CSS variables to Tailwind utilities
        gold: {
          DEFAULT: 'var(--gold)',
          light: 'var(--gold-light)',
          dim: 'var(--gold-dim)',
        },
        obsidian: {
          DEFAULT: 'var(--obsidian)',
          2: 'var(--obsidian-2)',
          3: 'var(--obsidian-3)',
          4: 'var(--obsidian-4)',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) both',
        'fade-in': 'fadeIn 0.6s ease both',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
        'marquee': 'marquee 28s linear infinite',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(40px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        // Note: 'shimmer' and 'particle-drift' are better kept in 
        // the CSS file due to their complex linear-gradient dependencies.
      },
    },
  },
  plugins: [],
}
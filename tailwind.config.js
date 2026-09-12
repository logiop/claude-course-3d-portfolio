/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#05060f',
          900: '#0a0e1f',
          800: '#10162e',
        },
        neon: {
          cyan: '#4df3ff',
          purple: '#b967ff',
          amber: '#ffb84d',
        },
      },
      fontFamily: {
        game: ['"Orbitron"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(77, 243, 255, 0.6)',
      },
    },
  },
  plugins: [],
}

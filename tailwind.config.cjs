/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bitcoin-orange forward palette.
        bitcoin: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f7931a', // canonical Bitcoin orange
          600: '#ea7a08',
          700: '#c2620a',
        },
      },
    },
  },
  plugins: [],
};

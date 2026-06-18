/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#19171b',
        card: '#2f2921',
        accent: '#9e8123',
        muted: '#563a17',
        sand: '#c9b896',
        'sand-dim': '#a8926a',
        umber: '#2f2921',
        charcoal: '#19171b',
      },
    },
  },
  plugins: [],
};

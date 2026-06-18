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
      },
    },
  },
  plugins: [],
};

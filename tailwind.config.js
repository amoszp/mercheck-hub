/** @type {import('tailwindcss').Config} */

// Colours are CSS-variable triplets (see index.css) so Tailwind's alpha
// syntax works: `bg-fg/10`, `text-accent/80`, ...
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        fg: token('fg'),
        accent: token('accent'),
        'accent-ink': token('accent-ink'),
        'accent-text': token('accent-text'),
        danger: token('danger'),
      },
      fontFamily: {
        sans: [
          'ui-rounded',
          '"SF Pro Rounded"',
          'system-ui',
          '-apple-system',
          '"Segoe UI Variable"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

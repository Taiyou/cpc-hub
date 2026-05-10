/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Helvetica Neue"',
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          'sans-serif',
        ],
      },
      colors: {
        ink: {
          DEFAULT: '#1a1a1a',
          muted: '#5a5a5a',
        },
      },
    },
  },
  plugins: [],
};

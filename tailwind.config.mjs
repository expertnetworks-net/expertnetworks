/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#1D1D1F',
        secondary: '#6E6E73',
        tertiary: '#86868B',
        accent: '#0071E3',
        'accent-hover': '#0077ED',
        'accent-green': '#30D158',
        'accent-orange': '#FF9F0A',
        'accent-purple': '#BF5AF2',
        'bg-primary': '#FBFBFD',
        'bg-secondary': '#F5F5F7',
        'bg-dark': '#1D1D1F',
        border: '#D2D2D7',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        sm: '10px',
      },
      maxWidth: {
        site: '1200px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#1D1D1F',
        secondary: '#5F5F65',
        // Darkened from #86868B so small meta text meets WCAG AA (4.5:1) on white and #F5F5F7.
        tertiary: '#6E6E73',
        accent: '#0071E3',
        'accent-hover': '#0068D1',
        // Link-sized accent text on light surfaces (AA on white and #F5F5F7).
        'accent-text': '#0066CC',
        'accent-green': '#30D158',
        'accent-orange': '#FF9F0A',
        'accent-purple': '#BF5AF2',
        'bg-primary': '#FBFBFD',
        'bg-secondary': '#F5F5F7',
        'bg-dark': '#1D1D1F',
        border: '#D2D2D7',
      },
      fontFamily: {
        sans: ['Inter', 'Inter Fallback', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Fluid type scale — values live in :root (src/styles/global.css).
        'step--1': ['var(--step--1)', { lineHeight: '1.5' }],
        'step-0': ['var(--step-0)', { lineHeight: '1.65' }],
        'step-1': ['var(--step-1)', { lineHeight: '1.5' }],
        'step-2': ['var(--step-2)', { lineHeight: '1.25' }],
        'step-3': ['var(--step-3)', { lineHeight: '1.15' }],
        'step-4': ['var(--step-4)', { lineHeight: '1.08' }],
        'step-5': ['var(--step-5)', { lineHeight: '1.04' }],
      },
      spacing: {
        section: 'var(--space-section)',
        'section-sm': 'var(--space-section-sm)',
        nav: 'var(--nav-h)',
      },
      borderRadius: {
        card: '16px',
        panel: '24px',
        sm: '10px',
      },
      maxWidth: {
        site: '1200px',
        measure: '68ch',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        elevated: 'var(--shadow-elevated)',
      },
      transitionTimingFunction: {
        'out-expo': 'var(--ease-out)',
        spring: 'var(--ease-spring)',
      },
    },
  },
  plugins: [],
};

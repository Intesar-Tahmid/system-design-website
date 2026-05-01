import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts}',
    './src/hooks/**/*.{js,ts}',
  ],
  safelist: [
    { pattern: /^from-/ },
    { pattern: /^to-/ },
    { pattern: /^bg-gradient-to-/ },
    { pattern: /^bg-(blue|violet|cyan|green|orange|yellow|amber|red|rose|pink|teal|indigo|lime|emerald|purple|fuchsia|sky|slate|gray)-(50|100|200|500|600|700)$/ },
    { pattern: /^border-(blue|violet|cyan|green|orange|yellow|amber|red|rose|pink|teal|indigo|lime|emerald|purple|fuchsia|sky|slate|gray)-(100|200|300)$/ },
    { pattern: /^text-(blue|violet|cyan|green|orange|yellow|amber|red|rose|pink|teal|indigo|lime|emerald|purple|fuchsia|sky|slate|gray)-(600|700|800)$/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      animation: {
        'count-up': 'countUp 1s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

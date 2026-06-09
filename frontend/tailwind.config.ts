import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable-driven theme colors — override via themes
        primary: {
          50:  'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          light:   'rgb(var(--color-accent-light) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          raised:  'rgb(var(--color-surface-raised) / <alpha-value>)',
          overlay: 'rgb(var(--color-surface-overlay) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        card:   'var(--radius-card)',
        button: 'var(--radius-button)',
        badge:  'var(--radius-badge)',
      },
      boxShadow: {
        card:      'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        modal:     'var(--shadow-modal)',
        input:     'var(--shadow-input)',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to:   { transform: 'scale(1)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgb(var(--color-primary-500) / 0.4)' },
          '70%':  { boxShadow: '0 0 0 10px rgb(var(--color-primary-500) / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(var(--color-primary-500) / 0)'   },
        },
      },
      animation: {
        'slide-up':     'slide-up 0.4s ease-out forwards',
        'fade-in':      'fade-in 0.3s ease-out forwards',
        'scale-in':     'scale-in 0.2s ease-out forwards',
        shimmer:        'shimmer 2s infinite linear',
        'bounce-subtle':'bounce-subtle 2s ease-in-out infinite',
        'pulse-ring':   'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':   'var(--gradient-mesh)',
        'noise':           "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}

export default config

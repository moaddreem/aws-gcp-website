import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aws: {
          orange: '#FF9900',
          'orange-light': '#FFB84D',
          'orange-dark': '#CC7A00',
        },
        gcp: {
          blue: '#4285F4',
          'blue-light': '#6BA3F7',
          'blue-dark': '#2B69D6',
        },
        dark: {
          bg: '#0a0a0f',
          card: '#12121a',
          border: '#1f1f2e',
        },
        light: {
          bg: '#fafafa',
          card: '#ffffff',
          border: '#e5e7eb',
        },
      },
      fontFamily: {
        sans: ['var(--font-ibm-arabic)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-ibm-arabic)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

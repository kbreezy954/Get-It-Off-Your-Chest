import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: '#121212',
        accent: '#d4af37'
      },
      boxShadow: {
        luxe: '0 10px 30px rgba(212, 175, 55, 0.18)'
      }
    }
  },
  plugins: []
};

export default config;

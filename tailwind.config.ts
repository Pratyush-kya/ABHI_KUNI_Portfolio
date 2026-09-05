import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        odia: ['"Noto Sans Odia"', 'sans-serif'],
        ui: ['Poppins', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#DC6803',
          dark: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};

export default config;

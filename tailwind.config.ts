import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#123B2A',
          900: '#174A35',
          700: '#26734D',
          100: '#E8F2EC',
        },
        canvas: '#F6F8F6',
        surface: '#FFFFFF',
        'text-primary': '#18231D',
        'text-secondary': '#66736B',
        border: '#E2E8E3',
        success: '#237A4B',
        warning: '#A96812',
        danger: '#B83B3B',
        info: '#326A9A',
      },
      borderRadius: {
        card: '12px',
        input: '8px',
      },
    },
  },
  plugins: [],
};

export default config;

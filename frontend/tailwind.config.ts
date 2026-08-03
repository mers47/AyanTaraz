import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3',
          500: '#000000', 600: '#000000', 700: '#000000', 800: '#000000', 900: '#000000', 950: '#000000',
        },
        gold: {
          50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047',
          400: '#f59e0b', 500: '#ca8a04', 600: '#a16207', 700: '#854d0e', 800: '#713f12', 900: '#422006', 950: '#281304',
        },
        success: '#22c55e', warning: '#eab308', error: '#ef4444', info: '#3b82f6',
      },
      fontFamily: { sans: ['Inter', 'Vazirmatn', 'Tahoma', 'system-ui', 'sans-serif'] },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out', 'slide-up': 'slideUp 0.5s ease-out', 'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      boxShadow: { 'gold': '0 4px 14px 0 rgba(202, 138, 4, 0.39)', 'gold-lg': '0 10px 25px 0 rgba(202, 138, 4, 0.25)' },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #ca8a04 0%, #f59e0b 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
      },
    },
  },
  plugins: [],
};

export default config;

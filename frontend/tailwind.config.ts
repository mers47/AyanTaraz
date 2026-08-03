import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { black: '#0a0a0a', 'black-soft': '#111111', 'black-card': '#18181b' },
        gold: { 50: '#fdf8ec', 100: '#f9edcc', 200: '#f3da94', 300: '#ecc25c', 400: '#e0c878', 500: '#c6a962', 600: '#a68b3c', 700: '#8b7232', 800: '#705c29', 900: '#5a4a22', 950: '#302710' },
        surface: { card: '#18181b', hover: '#222228', raised: '#252530' },
        border: { subtle: '#27272a', default: '#3f3f46', strong: '#52525b' },
      },
      fontFamily: { sans: ['Vazirmatn', 'Inter', 'system-ui', 'sans-serif'] },
      animation: { 'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both', 'gradient-shift': 'gradientShift 4s ease infinite', 'spin-border': 'spinBorder 8s linear infinite', 'spin-border-fast': 'spinBorder 3s linear infinite', 'wave-bar': 'waveBar 1.2s ease-in-out infinite' },
      keyframes: { fadeInUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }, gradientShift: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } }, spinBorder: { to: { '--angle': '360deg' } }, waveBar: { '0%, 100%': { height: '10px' }, '50%': { height: '26px' } } },
      boxShadow: { 'gold-sm': '0 2px 12px rgba(198,169,98,0.3)', 'gold': '0 4px 24px rgba(198,169,98,0.45)', 'card': '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(198,169,98,0.2)' },
      backgroundImage: { 'gradient-gold': 'linear-gradient(135deg, #c6a962, #e0c878 50%, #c6a962)', 'gradient-text': 'linear-gradient(135deg, #c6a962, #e0c878, #a68b3c, #e0c878, #c6a962)', 'radial-hero': 'radial-gradient(ellipse at 15% 40%, rgba(198,169,98,0.1) 0%, transparent 55%), radial-gradient(ellipse at 85% 25%, rgba(224,200,120,0.05) 0%, transparent 50%)', 'pattern-lines': 'repeating-linear-gradient(45deg, #c6a962 0, #c6a962 1px, transparent 0, transparent 40px)' },
      borderRadius: { 'sm': '8px', 'md': '12px', 'lg': '16px', 'xl': '20px' },
    },
  },
  plugins: [],
};
export default config;

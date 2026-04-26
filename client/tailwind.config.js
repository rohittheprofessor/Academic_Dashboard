/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class strategy
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: {
          light: '#FAFAFC', // Apple style very light gray
          dark: '#0A0A0A', // Deep pure dark
        },
        surface: {
          light: '#FFFFFF',
          dark: '#141414',
        },
        border: {
          light: '#E5E7EB', // slate-200
          dark: '#262626', // neutral-800
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Sky blue as primary for a sleek SaaS look
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
        'glass-hover': '0 12px 48px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'glass-hover-dark': '0 12px 48px 0 rgba(0, 0, 0, 0.5)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
        'inner-dark': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-light': 'radial-gradient(at 40% 20%, hsla(210,100%,96%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,94%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,95%,1) 0px, transparent 50%)',
        'mesh-dark': 'radial-gradient(at 40% 20%, hsla(210,100%,10%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,8%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,10%,1) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}

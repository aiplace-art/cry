/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Official BNB Chain Colors
        bnb: {
          primary: '#F3BA2F',      // BNB Gold - Primary brand color
          secondary: '#FCD535',    // Light Gold - Secondary accents
          dark: '#1E2026',         // Dark background
          darker: '#14151A',       // Darker background
          success: '#0ECB81',      // Success green
          error: '#F6465D',        // Error red
          warning: '#F0B90B',      // Warning yellow
          text: '#EAECEF',         // Text light
          textSecondary: '#848E9C', // Text muted
          border: '#2B3139',       // Border color
          hover: '#FED535',        // Hover state
          active: '#E8A42A',       // Active state
        },
        // Legacy support - maps to BNB colors
        primary: {
          DEFAULT: '#F3BA2F',
          50: '#FFFBF0',
          100: '#FEF5D9',
          200: '#FDEAB3',
          300: '#FCDF8D',
          400: '#FBD467',
          500: '#F3BA2F',
          600: '#E8A42A',
          700: '#C28A23',
          800: '#9C6E1C',
          900: '#765215',
        },
        secondary: {
          DEFAULT: '#FCD535',
          50: '#FFFEF5',
          100: '#FEFCE8',
          200: '#FEF9C3',
          300: '#FEF08A',
          400: '#FDE047',
          500: '#FCD535',
          600: '#EAC435',
          700: '#CAA62D',
          800: '#A88825',
          900: '#866A1D',
        },
        accent: {
          DEFAULT: '#0ECB81',
          50: '#E6F9F2',
          100: '#CCF3E5',
          200: '#99E7CB',
          300: '#66DBB1',
          400: '#33CF97',
          500: '#0ECB81',
          600: '#0BA66A',
          700: '#087D4F',
          800: '#055334',
          900: '#032A1A',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FCD535 0%, #F3BA2F 100%)',
        'gradient-accent': 'linear-gradient(135deg, #0ECB81 0%, #33CF97 100%)',
        'gradient-bnb': 'linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%)',
        'gradient-bnb-dark': 'linear-gradient(135deg, #1E2026 0%, #14151A 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(243, 186, 47, 0.5), 0 0 10px rgba(243, 186, 47, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(243, 186, 47, 0.8), 0 0 30px rgba(243, 186, 47, 0.5)' },
        },
        'gradient-x': {
          '0%, 100%': {
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundSize: '200% 200%',
            backgroundPosition: '100% 50%'
          },
        },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      screens: {
        'xs': '375px',
        'hover-hover': { raw: '(hover: hover)' },
        'touch': { raw: '(pointer: coarse)' },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.touch-manipulation': {
          'touch-action': 'manipulation',
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.safe-area-inset-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-area-inset-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-area-inset-left': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.safe-area-inset-right': {
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.overscroll-none': {
          'overscroll-behavior': 'none',
        },
        '.no-tap-highlight': {
          '-webkit-tap-highlight-color': 'transparent',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
}

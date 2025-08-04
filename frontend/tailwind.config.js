/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite',
        'particle-float': 'particle-float 3s ease-out forwards',
        'crush-impact': 'crush-impact 0.6s ease-out forwards',
        'satisfaction-burst': 'satisfaction-burst 1s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wiggle: {
          '0%, 7%, 100%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(-3deg)' },
          '20%': { transform: 'rotate(3deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '30%': { transform: 'rotate(3deg)' },
          '35%': { transform: 'rotate(-1deg)' },
          '40%': { transform: 'rotate(1deg)' },
        },
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(147, 51, 234, 0.5)' 
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.8), 0 0 30px rgba(147, 51, 234, 0.6)' 
          },
        },
        'particle-float': {
          '0%': { 
            transform: 'translateY(0px) scale(1) rotate(0deg)',
            opacity: 1 
          },
          '100%': { 
            transform: 'translateY(-100px) scale(0) rotate(360deg)',
            opacity: 0 
          },
        },
        'crush-impact': {
          '0%': { 
            transform: 'scale(1)',
            opacity: 1 
          },
          '50%': { 
            transform: 'scale(1.2)',
            opacity: 0.8 
          },
          '100%': { 
            transform: 'scale(0)',
            opacity: 0 
          },
        },
        'satisfaction-burst': {
          '0%': { 
            transform: 'scale(0) rotate(0deg)',
            opacity: 1 
          },
          '50%': { 
            transform: 'scale(1.5) rotate(180deg)',
            opacity: 0.8 
          },
          '100%': { 
            transform: 'scale(2) rotate(360deg)',
            opacity: 0 
          },
        },
      },
      colors: {
        'crush': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        'asmr': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'satisfaction': {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(147, 51, 234, 0.4)',
        'glow-sm': '0 0 10px rgba(147, 51, 234, 0.3)',
        'glow-lg': '0 0 40px rgba(147, 51, 234, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(147, 51, 234, 0.2)',
        'crush': '0 10px 25px rgba(239, 68, 68, 0.3)',
        'asmr': '0 10px 25px rgba(14, 165, 233, 0.3)',
        'satisfaction': '0 10px 25px rgba(217, 70, 239, 0.3)',
      },
      blur: {
        '4xl': '72px',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-glow': {
          textShadow: '0 0 10px currentColor',
        },
        '.text-glow-sm': {
          textShadow: '0 0 5px currentColor',
        },
        '.text-glow-lg': {
          textShadow: '0 0 20px currentColor',
        },
        '.bg-mesh-gradient': {
          background: `
            radial-gradient(at 40% 20%, hsla(228,100%,74%,1) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%),
            radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%),
            radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%),
            radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)
          `,
        },
        '.glass-effect': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        '.crush-button': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.98)',
          },
        },
        '.particle-trail': {
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            animation: 'shimmer 2s infinite',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
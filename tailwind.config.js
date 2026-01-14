/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where your templates are so it can purge unused styles in production
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './public/**/*.html'
  ],

  // Small safelist for any utility classes that are generated dynamically or referenced in JS
  // Add more entries here (strings or regex objects) if you dynamically construct class names
  safelist: [
    'animate-scroll-slow'
  ],

  theme: {
    extend: {
      animation: {
        // Fade animations
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fade-out': 'fadeOut 0.6s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.6s ease-out',
        'fade-in-right': 'fadeInRight 0.6s ease-out',
        
        // Scale animations
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in-up': 'scaleInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        
        // Slide animations
        'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.43, 0.13, 0.23, 0.96)',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.43, 0.13, 0.23, 0.96)',
        'slide-in-up': 'slideInUp 0.6s cubic-bezier(0.43, 0.13, 0.23, 0.96)',
        'slide-in-down': 'slideInDown 0.6s cubic-bezier(0.43, 0.13, 0.23, 0.96)',
        
        // Bounce animations
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        
        // Flip animations
        'flip-in-x': 'flipInX 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'flip-in-y': 'flipInY 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        
        // Rotate animations
        'rotate-in': 'rotateIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'rotate-scale': 'rotateScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        
        // Pulse & glow
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        
        // Shimmer effect
        'shimmer': 'shimmer 2s infinite',
        
        // Float animations
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 4s ease-in-out infinite',
        
        // Morph animations
        'morph': 'morph 4s ease-in-out infinite',
        
        // Text animations
        'text-shine': 'textShine 3s infinite',
        'text-glow': 'textGlow 2s ease-in-out infinite',
        
        // Stagger
        'stagger': 'stagger 0.6s ease-out',
      },
      keyframes: {
        // Fade keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        
        // Scale keyframes
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleInUp: {
          '0%': { opacity: '0', transform: 'scale(0.9) translateY(30px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        
        // Slide keyframes
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInDown: {
          '0%': { opacity: '0', transform: 'translateY(-100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        
        // Bounce keyframes
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        
        // Flip keyframes
        flipInX: {
          '0%': { opacity: '0', transform: 'perspective(400px) rotateX(90deg)' },
          '40%': { transform: 'perspective(400px) rotateX(-10deg)' },
          '70%': { transform: 'perspective(400px) rotateX(10deg)' },
          '100%': { opacity: '1', transform: 'perspective(400px) rotateX(0deg)' },
        },
        flipInY: {
          '0%': { opacity: '0', transform: 'perspective(400px) rotateY(90deg)' },
          '40%': { transform: 'perspective(400px) rotateY(-10deg)' },
          '70%': { transform: 'perspective(400px) rotateY(10deg)' },
          '100%': { opacity: '1', transform: 'perspective(400px) rotateY(0deg)' },
        },
        
        // Rotate keyframes
        rotateIn: {
          '0%': { opacity: '0', transform: 'rotate(-200deg)' },
          '100%': { opacity: '1', transform: 'rotate(0)' },
        },
        rotateScale: {
          '0%': { opacity: '0', transform: 'rotate(-180deg) scale(0)' },
          '100%': { opacity: '1', transform: 'rotate(0) scale(1)' },
        },
        
        // Pulse & glow keyframes
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3)' },
          '50%': { textShadow: '0 0 10px rgba(59, 130, 246, 1), 0 0 20px rgba(59, 130, 246, 0.6)' },
        },
        
        // Shimmer keyframes
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        
        // Float keyframes
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        
        // Morph keyframes
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        
        // Text shine keyframes
        textShine: {
          '0%': { backgroundPosition: '-1000px center' },
          '100%': { backgroundPosition: '1000px center' },
        },
        
        // Text glow keyframes
        textGlow: {
          '0%, 100%': { textShadow: '0 0 10px rgba(251, 146, 60, 0.5)' },
          '50%': { textShadow: '0 0 20px rgba(251, 146, 60, 1), 0 0 30px rgba(251, 146, 60, 0.7)' },
        },
        
        // Stagger animation
        stagger: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};

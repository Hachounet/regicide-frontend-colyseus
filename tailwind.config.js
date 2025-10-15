/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs du jeu de cartes
        'card-red': '#dc2626',
        'card-black': '#1f2937',
        'heart': '#ef4444',
        'diamond': '#f59e0b',
        'club': '#374151',
        'spade': '#111827',
        // Couleurs de l'interface
        'game-bg': '#0f172a',
        'pyramid-bg': '#1e293b',
        'card-bg': '#f8fafc',
        'selected': '#3b82f6',
        'valid-move': '#10b981',
        'invalid-move': '#ef4444',
      },
      fontFamily: {
        'game': ['Inter', 'sans-serif'],
      },
      spacing: {
        'card-width': '4.5rem',
        'card-height': '6.5rem',
      },
      animation: {
        'card-flip': 'cardFlip 0.6s ease-in-out',
        'card-place': 'cardPlace 0.4s ease-out',
        'card-select': 'cardSelect 0.2s ease-out',
        'pyramid-glow': 'pyramidGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(-90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        cardPlace: {
          '0%': { transform: 'scale(1.2) rotate(5deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        cardSelect: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-8px)' },
        },
        pyramidGlow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
        },
      },
      backdropBlur: {
        'card': '8px',
      },
    },
  },
  plugins: [],
}

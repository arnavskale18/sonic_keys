/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tells Tailwind where to look for class names.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // We use 'extend' to add our custom styles to Tailwind's defaults.
    extend: {
      // Defines the 'Poppins' and 'Roboto Mono' fonts for your project.
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },

      // CORRECTED: This color palette now matches the names used in your index.css.
      colors: {
        'dark-bg': '#0d1117',
        'brand-purple': '#8A2BE2',
        'brand-pink': '#FF00FF',
        'brand-cyan': '#00F6FF',
        'light-purple': '#1a1a3d',
        'custom-gray': '#a0a0c0',
        'success': '#00ff6a',
        'error': '#ff4d4d',
      },

      // Defines the glowing shadow effect for buttons and cards.
      boxShadow: {
        'neon-glow': '0 0 5px theme("colors.brand-cyan"), 0 0 20px theme("colors.brand-cyan / 70%"), 0 0 30px theme("colors.brand-cyan / 40%")',
        'neon-glow-magenta': '0 0 5px theme("colors.brand-pink"), 0 0 20px theme("colors.brand-pink / 70%"), 0 0 30px theme("colors.brand-pink / 40%")',
      },

      // NEWLY ADDED: This section fixes the "animate-glow" error.
      // 1. Defines the steps for a pulsing animation.
      keyframes: {
        glow: {
          '0%, 100%': { opacity: 0.8, textShadow: '0 0 7px theme("colors.brand-cyan"), 0 0 10px theme("colors.brand-cyan"), 0 0 21px theme("colors.brand-cyan"), 0 0 42px theme("colors.brand-purple")' },
          '50%': { opacity: 1, textShadow: '0 0 10px theme("colors.brand-cyan"), 0 0 20px theme("colors.brand-cyan"), 0 0 30px theme("colors.brand-cyan"), 0 0 50px theme("colors.brand-purple")' },
        }
      },
      // 2. Creates the 'animate-glow' utility class that uses the keyframes.
      animation: {
        glow: 'glow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where to look for class names to keep the final CSS file small.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Define the fonts specified in the blueprint.
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // For all general UI text - clean and modern.
        mono: ['Roboto Mono', 'monospace'], // For the typing challenge text - clear and code-like.
      },
      // The core color palette for the Neon Racer vibe.
      
    colors: {
        'dark-bg': '#0d1117',        // Renamed to match your index.css
        'brand-purple': '#8A2BE2',   // Added from your index.css
        'brand-pink': '#FF00FF',     // Added from your index.css
        'brand-cyan': '#00F6FF',     // Added from your index.css
        'light-purple': '#1a1a3d',
        'custom-gray': '#a0a0c0',
        'success': '#00ff6a',
        'error': '#ff4d4d',
    },
      // Custom shadow effects are crucial for the "glow" UX.
      boxShadow: {
        'neon-glow': '0 0 5px theme("colors.neon-cyan"), 0 0 20px theme("colors.neon-cyan / 70%"), 0 0 30px theme("colors.neon-cyan / 40%")',
        'neon-glow-magenta': '0 0 5px theme("colors.neon-magenta"), 0 0 20px theme("colors.neon-magenta / 70%"), 0 0 30px theme("colors.neon-magenta / 40%")',
      },
      // Subtle animations to make the UI feel alive.
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 1 },
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

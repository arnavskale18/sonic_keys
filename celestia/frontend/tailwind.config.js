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
        'dark-purple': '#0d0d1a',   // The deep space background color.
        'light-purple': '#1a1a3d', // A slightly lighter shade for card backgrounds.
        'neon-cyan': '#00f6ff',     // The primary, vibrant action color.
        'neon-magenta': '#ff00ff', // A secondary accent color for highlights.
        'custom-gray': '#a0a0c0',   // For secondary text, designed to be soft on a dark background.
        'success': '#00ff6a',       // A glowing green for correct entries and success states.
        'error': '#ff4d4d',         // A clear, neon red for mistakes and error states.
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

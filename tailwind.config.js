/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "navy-deep": "#0A192F",
        "gold-royal": "#FFD700",
        "neon-green": "#39FF14",
        "space-dark": "#000000",
        "glass-light": "rgba(255, 255, 255, 0.1)",
        "glass-border": "rgba(255, 255, 255, 0.2)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        grotesk: ["Space Grotesk", "sans-serif"],
      },
      backdropBlur: {
        glass: "15px",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-down": "slideDown 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "glow": "glow 2s ease-in-out infinite",
        "radar": "radar 3s ease-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255, 215, 0, 0.5)", opacity: "1" },
          "50%": { boxShadow: "0 0 20px rgba(255, 215, 0, 0.8)", opacity: "0.8" },
        },
        radar: {
          "0%": {
            opacity: "0.8",
            transform: "scale(0.1)"
          },
          "100%": {
            opacity: "0",
            transform: "scale(1)"
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      boxShadow: {
        glow: "0 0 30px rgba(255, 215, 0, 0.5)",
        "glow-lg": "0 0 50px rgba(255, 215, 0, 0.7)",
        "neon": "0 0 20px rgba(57, 255, 20, 0.6)",
        "floating": "0 20px 40px rgba(0, 0, 0, 0.5)",
      },
      gridTemplateColumns: {
        "fluid": "repeat(auto-fit, minmax(250px, 1fr))",
      },
    },
  },
  plugins: [],
}

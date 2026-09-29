import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060911", // deepest void
          900: "#0A0F1D", // base background
          850: "#0D1424", // elevated background
          800: "#111A30", // card surface
          750: "#16223F", // highlighted card surface
          700: "#1D2D52", // borders / dividers
          600: "#2B3F6E", // subtle borders
        },
        radio: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4", // primary electric cyan
          600: "#0891B2",
          700: "#0E7490",
        },
        gold: {
          300: "#FDE68A",
          400: "#FBBF24",
          500: "#F59E0B", // campus accent gold
          600: "#D97706",
        },
        live: "#EF4444",
        online: "#10B981",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.96)" },
        },
        "wave-bar": {
          "0%, 100%": { height: "20%" },
          "50%": { height: "100%" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave-1": "wave-bar 1.2s ease-in-out infinite",
        "wave-2": "wave-bar 0.9s ease-in-out infinite 0.2s",
        "wave-3": "wave-bar 1.4s ease-in-out infinite 0.4s",
        "wave-4": "wave-bar 1.0s ease-in-out infinite 0.1s",
        "wave-5": "wave-bar 1.3s ease-in-out infinite 0.3s",
      },
    },
  },
  plugins: [],
};

export default config;

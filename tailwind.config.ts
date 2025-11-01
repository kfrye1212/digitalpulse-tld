import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#00f0ff",
          dark: "#00d4e6",
        },
        secondary: {
          DEFAULT: "#ff00ff",
          dark: "#e600e6",
        },
        accent: "#9945ff",
        muted: "#1a1a1f",
        border: "rgba(0, 240, 255, 0.2)",
      },
      fontFamily: {
        orbitron: ['"Orbitron"', 'sans-serif'],
        inter: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-pulse': 'linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%)',
        'gradient-radial': 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, rgba(255,0,255,0.1) 50%, transparent 70%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.5)',
        'glow-magenta': '0 0 20px rgba(255, 0, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(153, 69, 255, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;


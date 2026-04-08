import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        ink: "#050816",
        mist: "#95a6d8",
        line: "rgba(166, 186, 255, 0.14)",
        accent: "#6df4ff",
        signal: "#6c7cff"
      },
      boxShadow: {
        ambient: "0 30px 120px rgba(10, 16, 40, 0.55)",
        glow: "0 0 120px rgba(109, 244, 255, 0.18)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(166,186,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(166,186,255,0.08) 1px, transparent 1px)"
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        drift: "drift 14s ease-in-out infinite",
        pulseGlow: "pulseGlow 5s ease-in-out infinite"
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", filter: "blur(0px)" },
          "50%": { opacity: "1", filter: "blur(8px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;

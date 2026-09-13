import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F2016",      // deep pine green, near-black
        forest: "#12301F",   // primary brand green
        forestdeep: "#0A1F14",
        gold: "#C9A227",     // accent
        goldsoft: "#EFE3B8",
        paper: "#F5F6F1",    // background
        panel: "#FFFFFF",
        line: "#DBE1D6",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-plex)", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#377cc0",
          mid: "#83bee9",
          soft: "#cce5f8",
          dark: "#2a6099"
        }
      },
      fontFamily: {
        display: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
        secondary: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        body: ["var(--font-roboto)", "var(--font-lato)", "Roboto", "Lato", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

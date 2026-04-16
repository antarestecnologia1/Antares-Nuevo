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
          DEFAULT: "#42A5F5",
          dark: "#1976D2",
          light: "#E3F2FD"
        }
      }
    }
  },
  plugins: []
};

export default config;

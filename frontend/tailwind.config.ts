import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0b1a33",
          900: "#0f2247",
          800: "#132c58",
          700: "#1a3a70"
        },
        brand: {
          blue: "#1e4fd6",
          green: "#1f8a4c",
          red: "#d64545",
          amber: "#e0982e",
          purple: "#7c5cd6"
        },
        surface: {
          DEFAULT: "#f4f6fb",
          card: "#ffffff",
          border: "#e4e8f0"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ]
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

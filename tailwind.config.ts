import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1bd488", // Vibrant Green
          dark: "#055b65", // Dark Teal
          light: "#b2c9c5", // Sage
        },
        secondary: {
          DEFAULT: "#45828b", // Muted Teal
          dark: "#055b65",
          light: "#e0e5e9", // Light Grey/Blue
        },
        accent: "#1bd488",
        sidebar: {
          DEFAULT: "#055b65", // Dark Teal Sidebar
          hover: "#45828b",
          active: "#1bd488",
        },
        background: "#fbfcfc", // Near White Background
        surface: "#FFFFFF",
        border: "#e0e5e9",
        text: {
          main: "#055b65",
          muted: "#45828b",
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },

  plugins: [],
};

export default config;

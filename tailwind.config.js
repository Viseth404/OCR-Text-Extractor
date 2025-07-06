/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Use class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all your React components
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#ffffff", // white
          dark: "#000000",     // black
        },
        foreground: {
          DEFAULT: "#000000",  // black
          dark: "#ffffff",     // white
        },
        border: {
          DEFAULT: "#d4d4d8",  // neutral-300
          dark: "#3f3f46",     // neutral-700
        },
        input: {
          DEFAULT: "#f5f5f5",  // neutral-100
          dark: "#1a1a1a",     // near-black
        },
        muted: {
          DEFAULT: "#737373",  // neutral-500
          dark: "#a3a3a3",     // neutral-400
        },
        primary: {
          DEFAULT: "#000000",  // black for buttons
          foreground: "#ffffff", // white text
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

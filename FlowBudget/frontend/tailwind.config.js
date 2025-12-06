/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#CCFF00", // Acid Green
        secondary: "#D946EF", // Electric Purple
        dark: "#09090B", // Deep Black
        "dark-lighter": "#18181B", // Zinc 900
        light: "#F4F4F5", // Zinc 100
        glass: "rgba(255, 255, 255, 0.05)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

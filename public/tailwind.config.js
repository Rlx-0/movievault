/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        lightGray: "#D9D9D9",
        darkGray: "#2D2D2D",
        black: "#161616",
        red: {
          DEFAULT: "#D90900",
          light: "#D90900B3", // 50% opacity version
        },
        green: "#197E4D",
        yellow: "#D2A119",
      },
      screens: {
        xs: "400px",
      },
    },
  },
  plugins: [],
};

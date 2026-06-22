/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0D5C3F",
          light: "#1A7A55",
          dark: "#083D29",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E8D48B",
        },
        cream: {
          DEFAULT: "#FFF8F0",
          dark: "#F5E6D0",
        },
      },
      fontFamily: {
        nastaliq: ["NotoNastaliqUrdu"],
      },
    },
  },
  plugins: [],
};

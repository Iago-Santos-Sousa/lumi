/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        titleColor: "#333333",
        inputDescriptionColor: "#FBFBFB",
        labelInputColor: "#8D8D8D",
        prymaryBlue: "#1AC5E2",
        prymaryBlueDark: "#6087EA",
        prymaryPurple: "#DA1FFB",
        spanColor: "#666",
        spanTwoColor: "#333",
        blueLightAqua: "#50C6D8",
      },
    },
  },
  plugins: [],
};

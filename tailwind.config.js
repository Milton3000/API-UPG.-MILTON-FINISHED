/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["**/*{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Young Serif"', "sans-serif"],
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".container": {
          maxWidth: "86rem",
          width: "90%",
          margin: "0 auto",
        },
      });
    },
  ],
};

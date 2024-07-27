/** @type {import('tailwindcss').Config} */

const typography = require('@tailwindcss/typography');
const daisyui = require('daisyui');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
    daisyui,
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#EB73CB",
          "secondary": "#E359FF",
          "accent": "#52C5FF",
          "neutral": "#3F4448",
          "base-100": "#000000",
          "info": "#2E008E",
          "success": "#00FA9A",
          "warning": "#FFCE52",
          "error": "#FFA33A",
        },
      },
    ],
  },
}

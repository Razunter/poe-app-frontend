const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: {
    content: ['./src/**/*.html']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'poe-bg': '#03191e',
        'poe-text': '#c1cfda',
        'poe-link': '#38aef4',
        'poe-link-hover': '#99d5fa',
        'poe-headings': '#59f8e8',
      },
    },
  },
  variants: {},
  plugins: [],
}

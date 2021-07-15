const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: {
    content: [
      './src/**/*.njk',
      './src/**/*.js',
      './src/**/*.svg',
      './src/**/*.md',
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      'sm': '500px',
      'md': '800px',
      'lg': '1024px',
      'xl': '1200px',
      '2xl': '1536px',
    },
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

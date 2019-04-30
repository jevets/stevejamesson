const fs = require('fs')
const path = require('path')
const tailwind = require('tailwindcss')
const autoprefixer = require('autoprefixer')
const precss = require('precss')
const postcss = require('postcss')
const atImport = require('postcss-import')

module.exports = class {
  async data () {
    const rawFilepath = path.join(__dirname, '_includes/css/main.css')

    return {
      permalink: 'styles.css',
      rawFilepath,
      rawCss: await fs.readFileSync(rawFilepath),
    }
  }

  async render ({ rawCss, rawFilepath }) {
    return await postcss([
      atImport,
      precss,
      tailwind,
      autoprefixer,
    ])
      .process(rawCss, { from: rawFilepath })
      .then(result => result.css)
  }
}

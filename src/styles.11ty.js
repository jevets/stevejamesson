const fs = require('fs')
const path = require('path')
const postcss = require('postcss')

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
      require('postcss-import'),
      require('precss'),
      require('tailwindcss'),
      require('autoprefixer'),
    ])
      .process(rawCss, { from: rawFilepath })
      .then(result => result.css)
  }
}

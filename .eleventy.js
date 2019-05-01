const url = require('url')
const { DateTime } = require('luxon')
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const pluginTOCNested = require('eleventy-plugin-nesting-toc')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const mdDefinitionLists = require('markdown-it-deflist')
const CleanCSS = require('clean-css')
const PurgeCSS = require('purgecss')
const htmlmin = require('html-minifier')

module.exports = config => {
  config.dir = {
    input: 'src',
    output: 'dist',
  }

  // Filters
  config.addFilter('readableDate', dt => {
    return DateTime.fromJSDate(dt, {zone: 'utc'}).toFormat('DDD')
  })
  config.addFilter('machineDate', dt => {
    return DateTime.fromJSDate(dt, {zone: 'utc'}).toISODate()
  })
  config.addFilter('productionUrl', path => {
    return new URL(path, 'https://www.stevejamesson.com/')
  })

  // Plugins
  config.addPlugin(pluginSyntaxHighlight)
  config.addPlugin(pluginTOCNested)

  // Add `id`s to markdown headings for the TOC plugin
  // https://www.npmjs.com/package/eleventy-plugin-nesting-toc
  config.setLibrary('md', markdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })
    .use(markdownItAnchor, {})
    .use(mdDefinitionLists)
  )

  // Minify HTML
  config.addTransform('htmlmin', (content, outputPath) => {
    if (outputPath.endsWith('.html')) {
      content = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      })
    }

    return content
  })

  // Purge and minify CSS files
  config.addTransform('cleancss', async (content, outputPath) => {
    if (outputPath.endsWith('.css')) {
      const purgeCss = await new PurgeCSS({
        content: ['./dist/**/*.html'],
        css: [{ raw: content }],
      }).purge()

      content = purgeCss[0].css || content

      content = new CleanCSS({}).minify(content).styles
    }

    return content
  })

  // Collections
  config.addCollection('posts', collection => {
    return collection.getFilteredByGlob('src/posts/**/*.md').reverse()
  })

  return config
}

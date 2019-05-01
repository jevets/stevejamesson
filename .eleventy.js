const { DateTime } = require('luxon')
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')

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

  // Plugins
  config.addPlugin(syntaxHighlight)

  // Collections
  config.addCollection('posts', collection => {
    return collection.getFilteredByGlob('src/posts/**/*.md').reverse()
  })

  return config
}

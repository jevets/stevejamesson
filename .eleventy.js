const { DateTime } = require('luxon')

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

  return config
}

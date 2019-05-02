const debug = require('debug')('App:siteNav')

module.exports = () => {
  const items = [
    {
      label: 'Home',
      uri: '/',
      activeWhen: currentPage => currentPage.url === '/',
    },
    {
      label: 'Posts',
      uri: '/posts/',
      activeWhen: currentPage => currentPage.url.includes('/posts/'),
    },
    {
      label: 'Now',
      uri: '/now/',
      activeWhen: currentPage => currentPage.url === '/now/',
    },
    {
      label: 'About',
      uri: '/about/',
      activeWhen: currentPage => currentPage.url === '/about/',
    }
  ]

  debug('Nav items loaded: %d items', items.length)

  return items
}

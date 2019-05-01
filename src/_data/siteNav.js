module.exports = [
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
]

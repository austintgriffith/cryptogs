const Promise = require(`bluebird`)
const path = require(`path`)
/*
exports.modifyWebpackConfig = function(config, env) {
  if (env === 'build-javascript' || env === 'develop') {
    config._config.entry.unshift('babel-polyfill')
  }
  return config
}*/
exports.modifyBabelrc = ({ babelrc }) => ({
  ...babelrc,
  plugins: babelrc.plugins.concat([ 'transform-regenerator']),
})
exports.onCreatePage = ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    if (page.path === `/join/`) {
      page.matchPath = `join/:stack`
      createPage(page)
    }else if (page.path === `/play/`) {
      page.matchPath = `play/:stack`
      createPage(page)
    }else if (page.path === `/address/`) {
      page.matchPath = `address/:address`
      createPage(page)
    }else{
      createPage(page)
    }
    resolve()
  })
}

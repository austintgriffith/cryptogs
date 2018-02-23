const Promise = require(`bluebird`)
const path = require(`path`)
exports.onCreatePage = ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    if (page.path === `/join/`) {
      page.matchPath = `join/:stack`
      createPage(page)
    }else if (page.path === `/play/`) {
      page.matchPath = `play/:stack`
      createPage(page)
    }else{
      createPage(page)
    }
    resolve()
  })
}

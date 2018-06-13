// 服务端，需要把访问的路径传到vue-router
import createApp from './app.js'
// const createApp = require('./app')

// 外面的express服务用
export default ({url}) => {
  return new Promise((resolve, reject) => {
    let { app, router } = createApp()
    router.push(url)
    router.onReady(() => {
      let matchedComponents = router.getMatchedComponents()
      if (!matchedComponents) {
        return reject(new Error('404'))
      }
      resolve(app)
    }, reject)
  })
}

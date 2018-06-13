const serverConf = require('./webpack.server.config')
const clientConf = require('./webpack.dev.conf')

const webpack = require('webpack')
const fs = require('fs')
const path = require('path')
const Mfs = require('memory-fs')
const axios = require('axios')

module.exports = (app, cb) => {
  let callback = cb
  let serverBundle
  let clientBundle
  let clientComplier
  let template = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8')
  const serverComplier = webpack(serverConf)

  // 融合服务端bundle，客户端bundle，模板template
  let combineBunlde = () => {
    console.log('serverBundle :' + serverBundle)
    console.log('clientBundle :' + clientBundle)
    if (serverBundle && clientBundle) {
      cb(serverBundle, clientBundle, template)
    }
  }

  // 生成服务端bundle
  let mfs = new Mfs()
  serverComplier.outputFileSystem = mfs
  serverComplier.watch({}, async (error, stats) => {
    if (error) return console.log(error);
    stats = stats.toJson();
    stats.errors.forEach(err => console.log(err))
    stats.warnings.forEach(err => console.log(err))
    // 监听client，如果生成bundle结束
    // server Bundle Json 文件
    let serverBundlePath = path.join(
      serverConf.output.path,
      'vue-ssr-server-bundle.json'
    )

    serverBundle = JSON.parse(mfs.readFileSync(serverBundlePath, 'utf-8'))
    // client Bundle Json 文件
    clientBundle = await axios.get('http://localhost:8081/vue-ssr-client-manifest.json')
    // clientBundle = await require('http://localhost:8081/vue-ssr-client-manifest.json')
    combineBunlde()
  })

  // 生成客户端bundle
  // clientConf.then(async complier => {
  //   // clientComplier = await webpack(complier)
  //   // const devMiddleware = require('webpack-dev-middleware')(clientComplier, {
  //   //   publicPath: `http://localhost:${process.env.PORT}`,
  //   //   noInfo: true
  //   // })
  //   // app.use(devMiddleware)
  //   webpack(complier).plugin('done', stats => {
  //     console.log('client done')
  //     console.log(stats)
  //   })
  //   // clientBundle = JSON.parse(readFile(
  //   //   devMiddleware.fileSystem,
  //   //   'vue-ssr-client-manifest.json'
  //   // ))
  // })
}

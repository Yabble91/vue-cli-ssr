const clientConf = require('./webpack.client.conf')
const serverConf = require('./webpack.server.config')

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const fs = require('fs')
const path = require('path')
const Mfs = require('memory-fs')
const axios = require('axios')
const config = require('../config')

const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConf.output.path, file), 'utf-8')
  } catch (e) {}
}

module.exports = (app, cb) => {
  let callback = cb
  let serverBundle
  let clientBundle
  let template = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8')

  // 融合服务端bundle，客户端bundle，模板template
  let combineBunlde = () => {
    if (serverBundle && clientBundle) {
      cb(serverBundle, clientBundle, template)
    }
  }

  // 生成服务端bundle
  const serverComplier = webpack(serverConf)
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
    // // client Bundle Json 文件
    // clientBundle = await axios.get('http://localhost:8081/vue-ssr-client-manifest.json')
    combineBunlde()
  })

  // 生成客户端bundle
  clientConf.entry.app = ['webpack-hot-middleware/client', clientConf.entry.app]
  clientConf.output.filename = '[name].js'
  clientConf.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )
  const clientCompiler = webpack(clientConf)
  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    publicPath: clientConf.output.publicPath
  })
  app.use(devMiddleware)
  clientCompiler.plugin('done', stats => {
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))
    if (stats.errors.length) return
    // 将生成的客户端bundle从内存中找出来
    clientBundle = JSON.parse(readFile(
      devMiddleware.fileSystem,
      'vue-ssr-client-manifest.json'
    ))
    combineBunlde()
  })
  app.use(require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000 }))
}



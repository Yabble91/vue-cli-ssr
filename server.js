const devServer = require("./build/dev-server")
const express = require("express")
const app = express()
const Vue = require('vue')
const path = require('path')
const vueRenderer = require("vue-server-renderer");

app.get("*", async (req, res) => {
  res.status(200);
  res.setHeader('Content-type', 'text/html;charset=utf-8;')

  devServer(app, (serverBundle, clientBundle, template) => {
    let render = vueRenderer.createBundleRenderer(serverBundle, {
      template,
      clientManifest: clientBundle.data,
      runInNewContext: false
    })

    render.renderToString({
      url: req.url
    })
    .then(html => {
      res.end(html)
    })
    .catch(error => console.log(error))
  })
})

app.listen(5000, () => {
  console.log("启动成功")
})

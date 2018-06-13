# vue-ssr-cli-pra

> A Vue.js project for ssr

###基于node v8.0.0开发

###使用方法

npm run dev // 在内存生成client-bundle

npm run server // 生成server-bundle 和 template 并与client-bundle合并

访问服务端地址即可

###缺陷

1，还未完成生产打包功能，思路是将client-bundle打成.json文件，在上线的时候部署Node服务器，访问打包的client-bundle文件并合并

2，目前是使用axios在webpack-dev-server启动的本地内存中寻找client-bundle，可以优化成使用webpack-dev-middleware监听client-bundle的生成并合并
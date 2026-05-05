const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 生产环境部署在 /bank/ 路径下
  publicPath: process.env.NODE_ENV === 'production' ? '/bank/' : '/',
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})

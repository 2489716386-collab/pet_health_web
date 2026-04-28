const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081, // 前端运行端口
    proxy: {
      '/knowledge-base': {
        target: 'http://localhost:8080', // 后端地址
        changeOrigin: true
      }
    }
  }
})

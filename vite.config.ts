import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // 开发服务器配置
  server: {
    // 开发服务器端口
    port: 5173,

    // 自动打开浏览器
    open: true,

    // 配置代理
    proxy: {
      // 精确匹配 /api 开头的请求
      '/api': {
        // 目标服务器地址
        target: 'http://localhost:9090',

        // 是否允许跨域
        changeOrigin: true,

        // 路径重写 - 保留 /api 前缀
        rewrite: (path) => path
      }
    }
  }
})
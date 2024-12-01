import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import type { ProxyOptions } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
    https: {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem'),
    },
    proxy: {
      '/api': {
        target: 'http://192.168.50.6',
        changeOrigin: true,
        // 使用标准的代理配置
        headers: {
          'X-Forwarded-For': '',
          'X-Real-IP': ''
        },
        configure: (proxy, options) => {
          // 在这里动态修改请求头
          proxy.on('proxyReq', (proxyReq, req) => {
            const clientIp = req.socket.remoteAddress || 'unknown';
            proxyReq.setHeader('X-Forwarded-For', clientIp);
            proxyReq.setHeader('X-Real-IP', clientIp);
          });
        },
        rewrite: (path) => path
      } as ProxyOptions
    }
  }
})
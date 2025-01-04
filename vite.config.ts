import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import type { ProxyOptions } from 'vite'
import { seoConfig } from './src/utils/seo/config'
import { generateRobotsTxt } from './src/utils/seo/robots'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'generate-robots-txt',
      // 在构建完成后执行
      closeBundle() {
        try {
          // Generate robots.txt content
          const robotsTxt = generateRobotsTxt(seoConfig.robots)

          // Write to dist folder
          fs.writeFileSync('dist/robots.txt', robotsTxt)
          console.log('✓ Generated robots.txt')
        } catch (error) {
          console.error('Failed to generate robots.txt:', error)
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    open: true,
    https: {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem'),
    },
    proxy: {
      '/api': {
        // target: 'http://localhost:8080',
        target: 'http://4kmoviehub.com:8080',
        changeOrigin: true,
        headers: {
          'X-Forwarded-For': '',
          'X-Real-IP': ''
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const clientIp = req.socket.remoteAddress || 'unknown'
            proxyReq.setHeader('X-Forwarded-For', clientIp)
            proxyReq.setHeader('X-Real-IP', clientIp)
          })
        },
        rewrite: (path) => path
      },
      '/ip-api': {
        target: 'https://api.ip.sb',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ip-api/, '')
      }
    }
  }
})
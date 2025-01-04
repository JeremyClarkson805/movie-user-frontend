import { SitemapStream, streamToPromise } from 'sitemap'
import { createWriteStream } from 'fs'
import { Readable } from 'stream'
import axios from 'axios'

async function getGuestToken() {
    try {
        // 获取访客token
        const guestResponse = await axios.post('/api/user/guest', {
            fingerprint: '0595830ba182231e85ac0989e3fdedde',
            userAgent: 'Mozilla/5.0 SitemapGenerator',
            ip: '123.123.123.123'
        })

        if (guestResponse.data.code === 200) {
            return guestResponse.data.data.token
        }
        throw new Error('Failed to get guest token')
    } catch (error) {
        console.error('Error getting guest token:', error)
        throw error
    }
}

async function generateSitemap() {
    try {
        // 创建sitemap stream
        const sitemapStream = new SitemapStream({
            hostname: 'https://4kmoviehub.com'
        })

        // 获取访客token
        const guestToken = await getGuestToken()

        // 获取所有电影列表
        const response = await axios.get('/api/movie/list', {
            params: {
                page: 1,
                pageSize: 10000
            },
            headers: {
                'Authorization': guestToken
            }
        })

        const movies = response.data.data.list || []

        // 添加静态路由
        sitemapStream.write({ url: '/', changefreq: 'daily', priority: 1.0 })
        sitemapStream.write({ url: '/membership', changefreq: 'weekly', priority: 0.8 })

        // 添加电影详情页
        for (const movie of movies) {
            sitemapStream.write({
                url: `/movie/${movie.movieId}`,
                changefreq: 'weekly',
                priority: 0.7,
                lastmod: movie.createTime || new Date().toISOString()
            })
        }

        // 添加分类页面
        const categories = ['Action', 'Crime', 'Comedy', 'Sci-Fi', 'Horror', 'Romantic', 'Cartoon']
        for (const category of categories) {
            sitemapStream.write({
                url: `/category/${category}`,
                changefreq: 'daily',
                priority: 0.6
            })
        }

        // 结束写入
        sitemapStream.end()

        // 将stream转换为string
        const sitemap = await streamToPromise(Readable.from(sitemapStream))

        // 写入文件
        createWriteStream('./dist/sitemap.xml').write(sitemap.toString())
        console.log('Sitemap generated successfully!')
    } catch (error) {
        console.error('Error generating sitemap:', error)
        process.exit(1)
    }
}

// 设置axios默认配置
axios.defaults.baseURL = 'http://8.217.248.157:8080'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.post['Content-Type'] = 'application/json'

generateSitemap()
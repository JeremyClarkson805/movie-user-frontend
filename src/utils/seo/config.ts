import type { SeoConfig } from './types'

export const seoConfig: SeoConfig = {
    baseUrl: 'https://4kmoviehub.com',
    robots: {
        userAgent: '*',
        allow: ['/'],
        disallow: [
            '/api/',
            '/private/',
            '/admin/'
        ],
        sitemap: 'https://4kmoviehub.com/sitemap.xml'
    }
}
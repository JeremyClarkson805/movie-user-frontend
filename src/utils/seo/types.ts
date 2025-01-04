export interface RobotsConfig {
    userAgent: string
    allow: string[]
    disallow: string[]
    sitemap?: string
}

export interface SeoConfig {
    baseUrl: string
    robots: RobotsConfig
}
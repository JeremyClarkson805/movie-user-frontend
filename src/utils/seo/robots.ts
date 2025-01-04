import type { RobotsConfig } from './types'

export function generateRobotsTxt(config: RobotsConfig): string {
    const lines: string[] = []

    // User-agent
    lines.push(`User-agent: ${config.userAgent}`)

    // Allow rules
    config.allow.forEach(rule => {
        lines.push(`Allow: ${rule}`)
    })

    // Disallow rules
    config.disallow.forEach(rule => {
        lines.push(`Disallow: ${rule}`)
    })

    // Sitemap
    if (config.sitemap) {
        lines.push(`Sitemap: ${config.sitemap}`)
    }

    return lines.join('\n')
}
import axios from 'axios'

const IP_SERVICES = [
    {
        url: 'https://api.ipify.org?format=json',
        extract: (data: any) => data.ip
    },
    {
        url: 'https://api.ip.sb/ip',
        extract: (data: any) => data.trim()
    },
    {
        url: 'https://api.myip.com',
        extract: (data: any) => data.ip
    }
]

export async function getClientIP(): Promise<string> {
    // 首先尝试从请求头获取
    if (typeof window !== 'undefined') {
        // 检查是否在本地开发环境
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return '127.0.0.1'
        }
    }

    // 依次尝试不同的 IP 服务
    for (const service of IP_SERVICES) {
        try {
            const response = await axios.get(service.url, {
                timeout: 5000, // 5秒超时
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            })
            const ip = service.extract(response.data)
            if (ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
                return ip
            }
        } catch (err) {
            console.warn(`IP service ${service.url} failed:`, err)
            continue // 继续尝试下一个服务
        }
    }

    // 如果所有服务都失败，返回一个后备值
    return '0.0.0.0'
}
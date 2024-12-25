import axios from 'axios'

const IP_SERVICES = [
    {
        url: '/ip-api/ip',  // 使用代理路径
        extract: (data: any) => data.trim()
    },
    {
        url: 'https://api.ipify.org?format=json',
        extract: (data: any) => data.ip
    },
    {
        url: 'https://api.myip.com',
        extract: (data: any) => data.ip
    }
]

export async function getClientIP(): Promise<string> {
    if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return '127.0.0.1'
        }
    }

    for (const service of IP_SERVICES) {
        try {
            const response = await axios.get(service.url, {
                timeout: 5000,
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
            continue
        }
    }

    return '0.0.0.0'
}
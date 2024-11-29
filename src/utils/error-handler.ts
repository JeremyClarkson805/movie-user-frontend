import { AxiosError } from 'axios'

export interface ApiError {
    statusCode?: number
    message: string
    details?: string
}

export const handleApiError = (error: unknown): ApiError => {
    if (error instanceof AxiosError) {
        const statusCode = error.response?.status

        // 处理网络错误
        if (!error.response) {
            return {
                message: '网络连接失败，请检查网络设置',
                details: '确保您的设备已连接到互联网，并且网络状态良好'
            }
        }

        // 处理服务器错误
        if (statusCode && statusCode >= 500) {
            let message = '服务器发生错误'
            if (statusCode === 503) {
                message = '服务器暂时不可用，可能正在维护'
            }
            return {
                statusCode,
                message,
                details: error.response.data?.message || '请稍后重试'
            }
        }

        // 处理认证错误
        if (statusCode === 401) {
            return {
                statusCode,
                message: '登录已过期或未授权',
                details: '请重新登录'
            }
        }

        // 处理其他客户端错误
        if (statusCode && statusCode >= 400) {
            return {
                statusCode,
                message: error.response.data?.message || '请求发生错误',
                details: error.response.data?.details
            }
        }
    }

    // 处理其他类型错误
    if (error instanceof Error) {
        return {
            message: error.message,
            details: '发生了未知错误，请稍后重试'
        }
    }

    return {
        message: '发生了未知错误',
        details: '请刷新页面重试，如果问题持续存在请联系客服'
    }
}
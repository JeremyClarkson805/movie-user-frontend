import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { API_CONFIG } from '../config/api'
import { useGuestStore } from '../stores/guest'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: API_CONFIG.headers
})

// Flag to prevent infinite retry loops
let isRefreshing = false
let failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: any) => void
    config: AxiosRequestConfig
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error)
        } else if (token) {
            promise.config.headers.Authorization = token
            promise.resolve(apiClient(promise.config))
        }
    })
    failedQueue = []
}

// Clear tokens and reset refresh state
const clearTokens = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('guestToken')
    isRefreshing = false
    failedQueue = []
}

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const userToken = localStorage.getItem('userToken')
        const guestToken = localStorage.getItem('guestToken')

        if (userToken || guestToken) {
            config.headers.Authorization = userToken || guestToken
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        if (response.data.code === 200) {
            return response.data
        }
        return Promise.reject(new Error(response.data.message || 'Request failed'))
    },
    async (error: AxiosError) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && originalRequest) {
            // Clear both tokens when receiving 401
            clearTokens()

            if (isRefreshing) {
                // If token refresh is in progress, add request to queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, config: originalRequest })
                })
            }

            isRefreshing = true

            try {
                // Initialize guest store
                const guestStore = useGuestStore()

                // Force refresh guest token
                await guestStore.initializeGuest(true)

                // Get new token
                const newToken = localStorage.getItem('guestToken')
                if (newToken) {
                    // Update Authorization header
                    originalRequest.headers.Authorization = newToken

                    // Process queued requests
                    processQueue(null, newToken)

                    // Retry original request
                    return apiClient(originalRequest)
                }
            } catch (refreshError) {
                // Process queued requests with error
                processQueue(refreshError as Error)
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

// API interfaces
interface MovieListParams {
    page?: number
    pageSize?: number
    title?: string
    category?: string
}

interface LoginCredentials {
    email: string
    password: string
}

interface RegisterData {
    userName: string
    email: string
    passwd: string
}

// API service
export const apiService = {
    // Movie related APIs
    movies: {
        getList: (params: MovieListParams = {}) =>
            apiClient.get('/api/movie/list', { params }),

        getDetail: (id: string | number) =>
            apiClient.get('/api/movie/detail', { params: { id } })
    },

    // Auth related APIs
    auth: {
        login: async (credentials: LoginCredentials) => {
            try {
                // 检查是否支持 crypto.subtle
                if (!window.crypto || !window.crypto.subtle) {
                    throw new Error('您的浏览器不支持加密API，请使用更现代的浏览器。')
                }

                // 获取浏览器指纹
                const fp = await FingerprintJS.load()
                const result = await fp.get()
                const fingerprint = result.visitorId

                // 获取客户端IP
                const response = await fetch('https://api.ipify.org?format=json')
                const ipData = await response.json()
                const ip = ipData.ip

                const encoder = new TextEncoder()
                const data = encoder.encode(credentials.password)
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
                const hashArray = Array.from(new Uint8Array(hashBuffer))
                const hashedPassword = hashArray.map(byte =>
                    byte.toString(16).padStart(2, '0')).join('').toUpperCase()

                return apiClient.post('/api/user/login', {
                    email: credentials.email,
                    passwd: hashedPassword,
                    fingerprint,
                    ip,
                    userAgent: navigator.userAgent
                })
            } catch (err) {
                if (err instanceof Error) {
                    throw new Error(`登录失败: ${err.message}`)
                }
                throw new Error('登录过程中发生未知错误')
            }
        },

        register: async (data: RegisterData) => {
            const encoder = new TextEncoder()
            const hashBuffer = await crypto.subtle.digest('SHA-256',
                encoder.encode(data.passwd))
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const hashedPassword = hashArray.map(byte =>
                byte.toString(16).padStart(2, '0')).join('').toUpperCase()

            return apiClient.post('/api/user/register', {
                userName: data.userName,
                email: data.email,
                passwd: hashedPassword
            })
        },

        verifyRegistration: (data: { email: string, code: string }) =>
            apiClient.post('/api/user/register/verify', data)
    },

    // Guest related APIs
    guest: {
        initialize: (data: { fingerprint: string, userAgent: string, ip: string }) =>
            apiClient.post('/api/user/guest', data)
    }
}

export default apiService
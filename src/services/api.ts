import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { API_CONFIG } from '../config/api'

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: API_CONFIG.headers
})

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
    (error) => {
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
            const encoder = new TextEncoder()
            const data = encoder.encode(credentials.password)
            const hashBuffer = await crypto.subtle.digest('SHA-256', data)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const hashedPassword = hashArray.map(byte =>
                byte.toString(16).padStart(2, '0')).join('').toUpperCase()

            return apiClient.post('/api/user/login', {
                email: credentials.email,
                passwd: hashedPassword
            })
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
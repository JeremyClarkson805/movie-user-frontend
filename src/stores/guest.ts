import { defineStore } from 'pinia'
import { ref } from 'vue'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { apiService } from '../services/api'

export const useGuestStore = defineStore('guest', () => {
    const guestToken = ref<string | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const initializeGuest = async (forceRefresh = false) => {
        try {
            const storedToken = localStorage.getItem('guestToken')

            // 如果有存储的token且不是强制刷新，先验证token
            if (!forceRefresh && storedToken) {
                try {
                    // 尝试使用stored token进行一个简单的API调用来验证
                    await apiService.movies.getList({ page: 1, pageSize: 1 })
                    guestToken.value = storedToken
                    return
                } catch (err) {
                    // 如果验证失败，清除token并继续获取新token
                    localStorage.removeItem('guestToken')
                    guestToken.value = null
                }
            }

            isLoading.value = true
            error.value = null

            // 获取浏览器指纹
            const fp = await FingerprintJS.load()
            const result = await fp.get()
            const fingerprint = result.visitorId

            // 获取客户端IP
            const ip = await getClientIP()

            // 从API获取游客token
            const response = await apiService.guest.initialize({
                fingerprint,
                userAgent: navigator.userAgent,
                ip
            })

            guestToken.value = response.data.token
            localStorage.setItem('guestToken', response.data.token)

        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to initialize guest'
            console.error('Guest initialization error:', err)

            // 清除无效token
            localStorage.removeItem('guestToken')
            guestToken.value = null

            throw err // 重新抛出错误以便在app store中处理
        } finally {
            isLoading.value = false
        }
    }

    // 获取客户端IP的辅助函数
    const getClientIP = async (): Promise<string> => {
        try {
            const response = await fetch('https://api.ipify.org?format=json')
            const data = await response.json()
            return data.ip
        } catch (err) {
            console.error('Failed to get IP:', err)
            return ''
        }
    }

    return {
        guestToken,
        isLoading,
        error,
        initializeGuest,
        $reset: () => {
            guestToken.value = null
            isLoading.value = false
            error.value = null
            localStorage.removeItem('guestToken')
        }
    }
})
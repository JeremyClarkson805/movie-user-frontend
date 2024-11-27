import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGuestStore } from './guest'
import { useAuthStore } from './auth'
import { handleApiError } from '../utils/error-handler'

export const useAppStore = defineStore('app', () => {
    const isInitializing = ref(true)
    const isReady = ref(false)
    const error = ref<string | null>(null)
    const errorCode = ref<number | undefined>(undefined)

    const initialize = async () => {
        const guestStore = useGuestStore()
        const authStore = useAuthStore()

        try {
            isInitializing.value = true
            error.value = null
            errorCode.value = undefined
            isReady.value = false

            // 检查用户 token
            const userToken = localStorage.getItem('userToken')

            if (userToken) {
                try {
                    // 尝试初始化认证存储
                    await authStore.initializeFromStorage()
                    isReady.value = true
                } catch (err) {
                    console.error('Auth initialization failed:', err)
                    const apiError = handleApiError(err)
                    error.value = apiError.message
                    errorCode.value = apiError.statusCode

                    // 清除无效的用户 token
                    localStorage.removeItem('userToken')
                    localStorage.removeItem('userInfo')

                    // 尝试初始化游客模式
                    try {
                        await guestStore.initializeGuest(true)
                        isReady.value = true
                        // 清除错误，因为游客模式初始化成功
                        error.value = null
                        errorCode.value = undefined
                    } catch (guestErr) {
                        const guestApiError = handleApiError(guestErr)
                        error.value = guestApiError.message
                        errorCode.value = guestApiError.statusCode
                        isReady.value = false
                    }
                }
            } else {
                // 没有用户 token，初始化游客模式
                try {
                    await guestStore.initializeGuest()
                    isReady.value = true
                } catch (err) {
                    const apiError = handleApiError(err)
                    error.value = apiError.message
                    errorCode.value = apiError.statusCode
                    isReady.value = false
                }
            }
        } catch (err) {
            console.error('App initialization failed:', err)
            const apiError = handleApiError(err)
            error.value = apiError.message
            errorCode.value = apiError.statusCode
            isReady.value = false
        } finally {
            isInitializing.value = false
        }
    }

    return {
        isInitializing,
        isReady,
        error,
        errorCode,
        initialize
    }
})
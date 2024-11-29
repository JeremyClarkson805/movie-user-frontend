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
            // 重置所有状态
            isInitializing.value = true
            error.value = null
            errorCode.value = undefined
            isReady.value = false

            // 检查用户 token
            const userToken = localStorage.getItem('userToken')
            const guestToken = localStorage.getItem('guestToken')

            if (userToken) {
                try {
                    // 验证用户 token
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
                    await initializeGuestMode()
                }
            } else if (guestToken) {
                try {
                    // 验证游客 token
                    await guestStore.validateGuestToken()
                    isReady.value = true
                } catch (err) {
                    console.error('Guest token validation failed:', err)
                    // 如果游客 token 无效，重新初始化游客模式
                    await initializeGuestMode()
                }
            } else {
                // 没有任何 token，初始化游客模式
                await initializeGuestMode()
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

    const initializeGuestMode = async () => {
        const guestStore = useGuestStore()
        try {
            await guestStore.initializeGuest(true)
            isReady.value = true
            error.value = null
            errorCode.value = undefined
        } catch (err) {
            const apiError = handleApiError(err)
            error.value = apiError.message
            errorCode.value = apiError.statusCode
            isReady.value = false
            throw err
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
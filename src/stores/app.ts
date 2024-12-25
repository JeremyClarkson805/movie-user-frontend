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
        try {
            isInitializing.value = true
            error.value = null
            errorCode.value = undefined
            isReady.value = false

            const userToken = localStorage.getItem('userToken')
            const guestToken = localStorage.getItem('guestToken')

            if (userToken) {
                try {
                    const authStore = useAuthStore()
                    await authStore.initializeFromStorage()
                    isReady.value = true
                } catch (err) {
                    console.error('Auth initialization failed:', err)
                    const apiError = handleApiError(err)
                    error.value = apiError.message
                    errorCode.value = apiError.statusCode

                    localStorage.removeItem('userToken')
                    localStorage.removeItem('userInfo')

                    await initializeGuestMode()
                }
            } else if (guestToken) {
                try {
                    const guestStore = useGuestStore()
                    await guestStore.validateGuestToken()
                    isReady.value = true
                } catch (err) {
                    console.error('Guest token validation failed:', err)
                    await initializeGuestMode()
                }
            } else {
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
        try {
            const guestStore = useGuestStore()
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
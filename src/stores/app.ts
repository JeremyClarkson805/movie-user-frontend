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

            // Check for existing user token
            const userToken = localStorage.getItem('userToken')

            if (userToken) {
                // Initialize auth store with existing user token
                await authStore.initializeFromStorage()
            } else {
                // Initialize guest token if no user token exists
                await guestStore.initializeGuest()
            }

            isReady.value = true
        } catch (err) {
            console.error('App initialization failed:', err)
            const apiError = handleApiError(err)
            error.value = apiError.message
            errorCode.value = apiError.statusCode
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
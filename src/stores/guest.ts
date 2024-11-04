import { defineStore } from 'pinia'
import { ref } from 'vue'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { apiRequest } from '../config/api'

interface GuestResponse {
    code: number
    message: string
    data: {
        token: string
    }
}

export const useGuestStore = defineStore('guest', () => {
    const guestToken = ref<string | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const initializeGuest = async () => {
        // Don't initialize if we already have a token
        const storedToken = localStorage.getItem('guestToken')
        if (storedToken) {
            guestToken.value = storedToken
            return
        }

        try {
            isLoading.value = true
            error.value = null

            // Get browser fingerprint
            const fp = await FingerprintJS.load()
            const result = await fp.get()
            const fingerprint = result.visitorId

            // Get guest token from API
            const response = await apiRequest<GuestResponse>('/api/user/guest', {
                method: 'POST',
                body: JSON.stringify({
                    fingerprint,
                    userAgent: navigator.userAgent,
                    ip: await getClientIP()
                })
            })

            if (response.code !== 200) {
                throw new Error(response.message || 'Failed to get guest token')
            }

            guestToken.value = response.data.token
            localStorage.setItem('guestToken', response.data.token)

        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to initialize guest'
            console.error('Guest initialization error:', err)
        } finally {
            isLoading.value = false
        }
    }

    // Helper function to get client IP
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
        }
    }
})
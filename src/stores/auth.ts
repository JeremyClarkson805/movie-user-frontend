import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGuestStore } from './guest'
import { apiService } from '../services/api'

interface UserInfo {
  userId: string
  username: string
  balance: number
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const guestStore = useGuestStore()
  const isAuthenticated = ref(false)
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const initializeFromStorage = async () => {
    const storedToken = localStorage.getItem('userToken')
    const storedUser = localStorage.getItem('userInfo')

    if (storedToken && storedUser) {
      token.value = storedToken
      userInfo.value = JSON.parse(storedUser)
      isAuthenticated.value = true
      return true
    }
    return false
  }

  const login = async (credentials: { email: string; password: string }) => {
    try {
      isLoading.value = true
      error.value = null

      const result = await apiService.auth.login(credentials)

      // Store token and user info
      token.value = result.data.token
      userInfo.value = {
        userId: result.data.userId,
        username: result.data.username,
        balance: result.data.balance
      }
      isAuthenticated.value = true

      // Save to localStorage
      localStorage.setItem('userToken', result.data.token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

      // Remove guest token since we're now logged in
      localStorage.removeItem('guestToken')
      guestStore.$reset()

      // Add a delay before navigation
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      console.error('Login error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // Clear auth state
      token.value = null
      userInfo.value = null
      isAuthenticated.value = false
      error.value = null

      // Clear localStorage
      localStorage.removeItem('userToken')
      localStorage.removeItem('userInfo')

      // Navigate to home page first
      router.push('/')

      // Then reinitialize guest token
      await guestStore.initializeGuest(true)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return {
    isAuthenticated,
    userInfo,
    token,
    error,
    isLoading,
    login,
    logout,
    initializeFromStorage
  }
})
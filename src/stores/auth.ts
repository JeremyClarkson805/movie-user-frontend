import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGuestStore } from './guest'
import { apiRequest } from '../config/api'

interface LoginResponse {
  code: number
  message: string
  data: {
    token: string
    userId: string
    username: string
    balance: number
  }
}

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

  // Initialize from localStorage
  const initializeFromStorage = () => {
    const storedToken = localStorage.getItem('userToken')
    const storedUser = localStorage.getItem('userInfo')

    if (storedToken && storedUser) {
      token.value = storedToken
      userInfo.value = JSON.parse(storedUser)
      isAuthenticated.value = true
    }
  }

  // Call initialization
  initializeFromStorage()

  const login = async (credentials: { email: string; password: string }) => {
    try {
      error.value = null

      // Hash the password using SHA-256
      const encoder = new TextEncoder()
      const data = encoder.encode(credentials.password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashedPassword = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase()

      const result = await apiRequest<LoginResponse>('/user/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          passwd: hashedPassword
        })
      })

      if (result.code !== 200) {
        throw new Error(result.message || 'Login failed')
      }

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

      router.push('/')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      console.error('Login error:', err)
      return false
    }
  }

  const logout = () => {
    // Clear auth state
    token.value = null
    userInfo.value = null
    isAuthenticated.value = false
    error.value = null

    // Clear localStorage
    localStorage.removeItem('userToken')
    localStorage.removeItem('userInfo')

    // Reinitialize guest token
    guestStore.initializeGuest()

    router.push('/login')
  }

  return {
    isAuthenticated,
    userInfo,
    token,
    error,
    login,
    logout
  }
})
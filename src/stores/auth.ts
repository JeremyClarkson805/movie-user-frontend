import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const isAuthenticated = ref(false)
  const user = ref(null)

  const login = (credentials: { email: string; password: string }) => {
    // Implement login logic here
    isAuthenticated.value = true
    router.push('/')
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    router.push('/login')
  }

  const register = (userData: {
    username: string
    email: string
    password: string
    verificationCode: string
  }) => {
    // Implement registration logic here
    router.push('/login')
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    register
  }
})
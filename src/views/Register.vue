<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['close', 'show-login'])
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const verificationCode = ref('')
const error = ref('')
const isVerificationSent = ref(false)
const isVerificationLoading = ref(false)

const handleSubmit = () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  authStore.register({
    username: username.value,
    email: email.value,
    password: password.value,
    verificationCode: verificationCode.value
  })

  emit('close')
  router.push('/login')
}

const handleClose = () => {
  emit('close')
}

const sendVerificationCode = async () => {
  if (!email.value) {
    error.value = 'Please enter your email first'
    return
  }

  try {
    isVerificationLoading.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    isVerificationSent.value = true
    error.value = ''
  } catch (err) {
    error.value = 'Failed to send verification code'
  } finally {
    isVerificationLoading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" @click.self="handleClose">
    <div class="max-w-md w-full mx-4">
      <div :class="[
        'rounded-lg p-8 relative',
        themeStore.isDark ? 'bg-gray-800/95' : 'bg-white/95'
      ]">
        <button
            @click="handleClose"
            class="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <h1 class="text-2xl font-bold mb-6">Create Account</h1>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Username</label>
            <input
                v-model="username"
                type="text"
                required
                :class="[
                'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
              ]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Password</label>
            <input
                v-model="password"
                type="password"
                required
                :class="[
                'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
              ]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Confirm Password</label>
            <input
                v-model="confirmPassword"
                type="password"
                required
                :class="[
                'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
              ]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <div class="flex space-x-2">
              <input
                  v-model="email"
                  type="email"
                  required
                  :class="[
                  'flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
                ]"
              />
              <button
                  type="button"
                  @click="sendVerificationCode"
                  :disabled="isVerificationLoading"
                  :class="[
                  'px-4 py-2 rounded-lg transition-colors whitespace-nowrap',
                  isVerificationSent
                    ? themeStore.isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                    : 'bg-blue-600 hover:bg-blue-700',
                  'text-white disabled:opacity-50 disabled:cursor-not-allowed'
                ]"
              >
                {{ isVerificationLoading ? 'Sending...' : isVerificationSent ? 'Resend Code' : 'Send Code' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Verification Code</label>
            <input
                v-model="verificationCode"
                type="text"
                required
                :class="[
                'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
              ]"
            />
          </div>

          <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
          <div v-if="isVerificationSent" class="text-green-500 text-sm">
            Verification code sent! Please check your email.
          </div>

          <button
              type="submit"
              class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
        </form>

        <p class="mt-4 text-sm text-center">
          Already have an account?
          <button @click="$emit('show-login')" class="text-blue-500 hover:underline">
            Login here
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
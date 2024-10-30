<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import axios from 'axios'

const router = useRouter()
const themeStore = useThemeStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const verificationCode = ref('')
const error = ref('')

// 新增状态
const isCodeSent = ref(false)
const buttonText = ref('发送验证码')
const countdown = ref(60)
const timer = ref<number | null>(null)

// 发送验证码
const sendVerificationCode = async () => {
  try {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      error.value = '请输入有效的邮箱地址'
      return
    }

    // 调用发送验证码API
    const response = await axios.post('http://localhost:8083/api/user/register', {
      userName: username.value,
      email: email.value,
      passwd: password.value
    })

    if (response.data.success) {
      isCodeSent.value = true
      startCountdown()
      error.value = ''
    } else {
      error.value = response.data.message || '验证码发送失败'
    }
  } catch (e) {
    error.value = '发送验证码时出现错误'
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  buttonText.value = `重新发送(${countdown.value}s)`

  timer.value = window.setInterval(() => {
    countdown.value--
    buttonText.value = `重新发送(${countdown.value}s)`

    if (countdown.value <= 0) {
      if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
      }
      buttonText.value = '重新发送验证码'
      isCodeSent.value = false
    }
  }, 1000)
}

// 注册提交
const handleSubmit = async () => {
  try {
    // 基础验证
    if (password.value !== confirmPassword.value) {
      error.value = '两次输入的密码不匹配'
      return
    }

    if (!isCodeSent.value) {
      // 如果验证码还未发送，则发送验证码
      await sendVerificationCode()
      return
    }

    // 验证码已发送，进行注册
    const response = await axios.post('/api/register', {
      username: username.value,
      email: email.value,
      password: password.value,
      verificationCode: verificationCode.value
    })

    if (response.data.success) {
      router.push({ name: 'login' })
    } else {
      error.value = response.data.message || '注册失败'
    }
  } catch (e) {
    error.value = '注册过程中出现错误'
  }
}

const handleClose = () => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  router.back()
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div :class="[
        'rounded-lg p-8 relative',
        themeStore.isDark ? 'bg-gray-800' : 'bg-white'
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
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
                v-model="email"
                type="email"
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

          <div class="relative">
            <label class="block text-sm font-medium mb-1">Verification Code</label>
            <div class="flex gap-2">
              <input
                  v-model="verificationCode"
                  type="text"
                  required
                  :disabled="!isCodeSent"
                  :class="[
                  'flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                  themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100',
                  !isCodeSent ? 'opacity-50' : ''
                ]"
              />
            </div>
          </div>

          <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>

          <button
              type="submit"
              :disabled="isCodeSent && !verificationCode"
              class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isCodeSent ? 'Register' : buttonText }}
          </button>
        </form>

        <p class="mt-4 text-sm text-center">
          Already have an account?
          <router-link to="/login" class="text-blue-500 hover:underline">
            Login here
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
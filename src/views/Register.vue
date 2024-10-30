<script setup lang="ts">
import { ref, watch } from 'vue'
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
const isRegistered = ref(false)
const isRegistering = ref(false)

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const validatePasswords = () => {
  if (!password.value || !confirmPassword.value) {
    error.value = '请输入密码'
    return false
  }

  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return false
  }

  return true
}

const sendVerificationCode = async () => {
  error.value = ''

  if (!email.value) {
    error.value = '请输入邮箱'
    return
  }

  if (!validateEmail(email.value)) {
    error.value = '请输入有效的邮箱地址'
    return
  }

  if (!username.value) {
    error.value = '请输入用户名'
    return
  }

  if (!validatePasswords()) {
    return
  }

  try {
    isVerificationLoading.value = true

    const encoder = new TextEncoder()
    const data = encoder.encode(password.value)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedPassword = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase()

    const response = await fetch('http://127.0.0.1:8083/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        userName: username.value,
        email: email.value,
        passwd: hashedPassword
      })
    })

    const responseData = await response.json()

    if (responseData.code === 200) {
      isVerificationSent.value = true
      error.value = ''
    } else {
      error.value = responseData.message || '验证码发送失败'
      isVerificationSent.value = false
    }
  } catch (err) {
    console.error('API调用错误:', err)
    error.value = '验证码发送失败,请稍后重试'
    isVerificationSent.value = false
  } finally {
    isVerificationLoading.value = false
  }
}

const handleSubmit = async () => {
  error.value = ''

  if (!validatePasswords()) {
    return
  }

  if (!isVerificationSent.value) {
    error.value = '请先获取验证码'
    return
  }

  if (!verificationCode.value) {
    error.value = '请输入验证码'
    return
  }

  try {
    isRegistering.value = true

    const response = await fetch('http://127.0.0.1:8083/api/user/register/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        code: verificationCode.value
      })
    })

    const responseData = await response.json()

    if (responseData.code === 200) {
      isRegistered.value = true
    } else {
      error.value = responseData.message || '注册失败,请重试'
    }
  } catch (err) {
    console.error('注册失败:', err)
    error.value = '注册失败,请稍后重试'
  } finally {
    isRegistering.value = false
  }
}

const handleClose = () => {
  emit('close')
}

const validatePasswordMatch = () => {
  if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
  } else {
    error.value = ''
  }
}

watch([password, confirmPassword], () => {
  if (password.value && confirmPassword.value) {
    validatePasswordMatch()
  }
})

const handleShowLogin = () => {
  router.push('/login')
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

        <h1 class="text-2xl font-bold mb-6">注册新账户</h1>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">用户名</label>
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
            <label class="block text-sm font-medium mb-1">密码</label>
            <input
                v-model="password"
                type="password"
                required
                @input="validatePasswordMatch"
                :class="[
                'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
              ]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">确认密码</label>
            <input
                v-model="confirmPassword"
                type="password"
                required
                @input="validatePasswordMatch"
                :class="[
                'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
              ]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">电子邮箱</label>
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
                {{ isVerificationLoading ? '发送中...' : isVerificationSent ? '重新发送' : '发送验证码' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">验证码</label>
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

          <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
          <div v-if="isVerificationSent" class="text-green-500 text-sm mt-2">
            验证码已发送,请查收邮件
          </div>

          <button
              type="submit"
              :disabled="isRegistering"
              :class="[
              'w-full py-2 px-4 rounded-lg transition-colors',
              isRegistering
                ? 'bg-blue-400 cursor-not-allowed'
                : isRegistered
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-blue-600 hover:bg-blue-700',
              'text-white'
            ]"
          >
            {{ isRegistering ? '注册中...' : isRegistered ? '注册成功' : '注册' }}
          </button>
        </form>

        <p class="mt-4 text-sm text-center">
          已有账号？
          <button @click="handleShowLogin" class="text-blue-500 hover:underline">
            点此登录
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
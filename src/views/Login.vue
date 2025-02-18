<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { useModalStore } from '../stores/modalStore'

const emit = defineEmits(['close'])
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const modalStore = useModalStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const emailInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)

const handleSubmit = async () => {
  try {
    isLoading.value = true
    const success = await authStore.login({
      email: email.value,
      password: password.value
    }, false) // 不进行重定向

    if (success) {
      modalStore.closeModal()
    }
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = () => {
  modalStore.openResetPassword()
}

const handleShowRegister = () => {
  modalStore.openRegister()
}

const handleClose = () => {
  authStore.resetState()
  modalStore.closeModal()
}

onMounted(() => {
  nextTick(() => {
    emailInput.value?.focus()
  })
})

onUnmounted(() => {
  email.value = ''
  password.value = ''
  authStore.resetState()
})
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

        <h1 class="text-2xl font-bold mb-6">登录</h1>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">邮箱</label>
            <input
                v-model="email"
                type="email"
                required
                :class="[
                'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
              ]"
                @keyup.enter="$refs.passwordInput?.focus()"
                ref="emailInput"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">密码</label>
            <input
                v-model="password"
                type="password"
                required
                :class="[
                'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
              ]"
                @keyup.enter="handleSubmit"
                ref="passwordInput"
            />
          </div>

          <div class="flex justify-end">
            <button
                type="button"
                @click="handleForgotPassword"
                class="text-sm text-blue-500 hover:underline"
            >
              忘记密码?
            </button>
          </div>

          <div v-if="authStore.error" class="text-red-500 text-sm">{{ authStore.error }}</div>

          <button
              type="button"
              @click="handleSubmit"
              :disabled="isLoading"
              class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </div>

        <p class="mt-4 text-sm text-center">
          还没有账户?
          <button
              @click="handleShowRegister"
              class="text-blue-500 hover:underline"
          >
            点击这里注册
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
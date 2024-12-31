<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div :class="[
        'rounded-lg p-8 relative',
        themeStore.isDark ? 'bg-gray-800' : 'bg-white'
      ]">
        <h2 class="text-xl font-bold mb-6">安全验证</h2>

        <div class="mb-6">
          <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center mb-4">
            <span class="text-2xl font-bold tracking-wider">{{ captcha }}</span>
          </div>

          <input
              v-model="userInput"
              type="text"
              placeholder="请输入验证码"
              class="w-full px-4 py-2 rounded-lg"
              :class="themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm mb-4">
          {{ error }}
        </div>

        <div class="flex justify-end space-x-3">
          <button
              @click="regenerateCaptcha"
              class="px-4 py-2 rounded-lg"
              :class="themeStore.isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'"
          >
            刷新
          </button>
          <button
              @click="verify"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            验证
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'verified'): void
  (e: 'error'): void
}>()

const captcha = ref(generateCaptcha())
const userInput = ref('')
const error = ref('')

function generateCaptcha(length = 4): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

function regenerateCaptcha() {
  captcha.value = generateCaptcha()
  userInput.value = ''
  error.value = ''
}

function verify() {
  if (!userInput.value) {
    error.value = '请输入验证码'
    return
  }

  if (userInput.value.toUpperCase() === captcha.value) {
    emit('verified')
  } else {
    error.value = '验证码错误'
    regenerateCaptcha()
    emit('error')
  }
}
</script>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemeStore } from '../../stores/theme'
import { useResetPasswordStore } from '../../stores/resetPassword'
import { validateEmail } from '../../utils/validators'
import CountdownButton from './CountdownButton.vue'

const themeStore = useThemeStore()
const resetPasswordStore = useResetPasswordStore()

const email = ref('')
const verificationCode = ref('')
const isEmailValid = computed(() => validateEmail(email.value))

const handleSendCode = async () => {
  if (!isEmailValid.value) return
  await resetPasswordStore.sendVerificationCode(email.value)
}

const handleVerifyCode = async () => {
  if (!verificationCode.value) return
  await resetPasswordStore.verifyCode(email.value, verificationCode.value)
}
</script>

<template>
  <form @submit.prevent="handleVerifyCode" class="space-y-4">
    <!-- Email Input -->
    <div>
      <label class="block text-sm font-medium mb-1">邮箱</label>
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
        <CountdownButton
            :disabled="!isEmailValid"
            @click="handleSendCode"
        />
      </div>
    </div>

    <!-- Verification Code Input -->
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

    <div v-if="resetPasswordStore.error" class="text-red-500 text-sm">
      {{ resetPasswordStore.error }}
    </div>

    <button
        type="submit"
        :disabled="resetPasswordStore.isLoading"
        class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ resetPasswordStore.isLoading ? '验证中...' : '下一步' }}
    </button>
  </form>
</template>
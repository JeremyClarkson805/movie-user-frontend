<script setup lang="ts">
import { ref, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useResetPasswordStore } from '@/stores/resetPassword'
import { validatePassword } from '@/utils/validators'

const emit = defineEmits(['resetSuccess'])
const themeStore = useThemeStore()
const resetPasswordStore = useResetPasswordStore()

const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')

watch([newPassword, confirmPassword], () => {
  if (newPassword.value && confirmPassword.value) {
    if (newPassword.value !== confirmPassword.value) {
      error.value = '两次输入的密码不一致'
    } else if (!validatePassword(newPassword.value)) {
      error.value = '密码必须包含至少8个字符，包括大小写字母和数字'
    } else {
      error.value = ''
    }
  }
})

const handleSubmit = async () => {
  if (error.value) return
  try {
    await resetPasswordStore.resetPassword(newPassword.value)
    emit('resetSuccess')
  } catch (err) {
    // Error handling is managed by the store
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">新密码</label>
      <input
          v-model="newPassword"
          type="password"
          required
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
          :class="[
            'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
            themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
          ]"
      />
    </div>

    <div v-if="error || resetPasswordStore.error" class="text-red-500 text-sm">
      {{ error || resetPasswordStore.error }}
    </div>

    <button
        type="submit"
        :disabled="resetPasswordStore.isLoading || !!error"
        class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ resetPasswordStore.isLoading ? '重置中...' : '重置密码' }}
    </button>
  </form>
</template>

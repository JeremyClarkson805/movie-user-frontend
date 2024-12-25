<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useModalStore } from '@/stores/modalStore'
import ResetPasswordForm from './ResetPasswordForm.vue'
import NewPasswordForm from './NewPasswordForm.vue'
import { useResetPasswordStore } from '@/stores/resetPassword'

const emit = defineEmits(['close'])
const themeStore = useThemeStore()
const modalStore = useModalStore()
const resetPasswordStore = useResetPasswordStore()

const handleClose = () => {
  resetPasswordStore.$reset()
  emit('close')
}

const handleResetSuccess = () => {
  // Success is now handled in the store
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div :class="[
        'rounded-lg p-8 relative',
        themeStore.isDark ? 'bg-gray-800/95' : 'bg-white/95'
      ]">
        <button
            @click="handleClose"
            class="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            :class="themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <h1 class="text-2xl font-bold mb-6">重置密码</h1>

        <div v-if="resetPasswordStore.successMessage" class="text-center py-8">
          <div class="text-green-500 text-6xl mb-4">✓</div>
          <h3 class="text-xl font-semibold mb-2">{{ resetPasswordStore.successMessage }}</h3>
          <p class="text-gray-500">即将为您跳转到登录页面...</p>
        </div>
        <template v-else>
          <ResetPasswordForm v-if="!resetPasswordStore.isVerified" />
          <NewPasswordForm v-else @reset-success="handleResetSuccess" />
        </template>
      </div>
    </div>
  </div>
</template>
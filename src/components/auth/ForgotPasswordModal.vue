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
        'rounded-lg p-8 relative overflow-hidden',
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

        <div v-if="resetPasswordStore.successMessage"
             class="relative py-12 text-center">
          <!-- Success Animation Background -->
          <div class="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse"></div>

          <!-- Success Icon with Animation -->
          <div class="relative">
            <div class="inline-block">
              <svg class="w-24 h-24 text-green-500 animate-bounce"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24">
                <path stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                </path>
              </svg>
            </div>
          </div>

          <!-- Success Message -->
          <div class="mt-6 space-y-4">
            <h3 class="text-2xl font-bold text-green-500">
              密码重置成功！
            </h3>
            <p class="text-lg" :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">
              {{ resetPasswordStore.successMessage }}
            </p>

            <!-- Loading Indicator -->
            <div class="mt-8 flex items-center justify-center space-x-2">
              <div class="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
              <div class="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>

        <template v-else>
          <ResetPasswordForm v-if="!resetPasswordStore.isVerified" />
          <NewPasswordForm v-else @reset-success="handleResetSuccess" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useResetPasswordStore } from '../stores/resetPassword'
import ResetPasswordForm from '../components/ResetPassword/ResetPasswordForm.vue'
import NewPasswordForm from '../components/ResetPassword/NewPasswordForm.vue'

const themeStore = useThemeStore()
const resetPasswordStore = useResetPasswordStore()
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div :class="[
        'rounded-lg p-8 relative',
        themeStore.isDark ? 'bg-gray-800/95' : 'bg-white/95'
      ]">
        <h1 class="text-2xl font-bold mb-6">重置密码</h1>

        <ResetPasswordForm v-if="!resetPasswordStore.isVerified" />
        <NewPasswordForm v-else />
      </div>
    </div>
  </div>
</template>
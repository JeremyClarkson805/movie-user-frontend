<script setup lang="ts">
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useThemeStore } from '@/stores/theme'
import ResetPasswordForm from './ResetPasswordForm.vue'
import NewPasswordForm from './NewPasswordForm.vue'
import { useResetPasswordStore } from '@/stores/resetPassword'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])

const themeStore = useThemeStore()
const resetPasswordStore = useResetPasswordStore()

const handleClose = () => {
  resetPasswordStore.$reset()
  emit('close')
}
</script>

<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="handleClose" class="relative z-50">
      <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
        >
          <DialogPanel :class="[
            'w-full max-w-md rounded-xl p-8 relative shadow-xl',
            themeStore.isDark ? 'bg-gray-800/95' : 'bg-white/95'
          ]">
            <!-- Close Button -->
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

            <ResetPasswordForm v-if="!resetPasswordStore.isVerified" />
            <NewPasswordForm v-else />
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

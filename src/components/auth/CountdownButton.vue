<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits(['click'])

const themeStore = useThemeStore()
const countdown = ref(0)
let timer: number | null = null

const startCountdown = () => {
  countdown.value = 60
  timer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      timer = null
    }
  }, 1000)
}

const handleClick = () => {
  if (countdown.value > 0 || props.disabled) return
  emit('click')
  startCountdown()
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <button
      type="button"
      @click="handleClick"
      :disabled="countdown > 0 || disabled"
      class="px-4 py-2 rounded-lg text-white transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      :class="themeStore.isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'"
  >
    {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
  </button>
</template>
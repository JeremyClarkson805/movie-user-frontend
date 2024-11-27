import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 初始化主题状态
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  // 监听主题变化并保存到 localStorage
  watch(isDark, (newValue) => {
    localStorage.setItem('theme', newValue ? 'dark' : 'light')
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // 初始化主题
  const initializeTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    }
  }

  return {
    isDark,
    toggleTheme,
    initializeTheme
  }
})
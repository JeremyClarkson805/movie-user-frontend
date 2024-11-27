<script setup lang="ts">
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center z-50"
       :class="themeStore.isDark ? 'bg-gray-900' : 'bg-white'">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent"
           :class="themeStore.isDark ? 'border-blue-500' : 'border-blue-600'"></div>
      <p class="mt-4 text-lg font-medium"
         :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-700'">
        正在加载中...
      </p>
      <p class="mt-2 text-sm"
         :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-500'">
        请稍候片刻
      </p>
    </div>
  </div>
</template>
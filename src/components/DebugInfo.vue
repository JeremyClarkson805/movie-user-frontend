<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

interface DebugItem {
  name: string
  value: string
}

defineProps<{
  title: string
  icon: string
  items?: DebugItem[]
}>()

const status = ref<HTMLElement | null>(null)

const typeWriter = (element: HTMLElement, text: string, speed = 50) => {
  return new Promise(resolve => {
    let i = 0
    element.textContent = ''

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i)
        i++
        setTimeout(type, speed)
      } else {
        resolve(true)
      }
    }

    type()
  })
}

onMounted(async () => {
  if (status.value) {
    await typeWriter(status.value, '正常运行')
  }
})
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center space-x-2">
      <span class="text-xl">{{ icon }}</span>
      <div class="text-sm font-medium" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-500'">
        {{ title }}
      </div>
    </div>
    <div ref="status" class="font-mono pl-7"></div>
    <div v-if="items" class="space-y-2 mt-4">
      <div v-for="item in items" :key="item.name" class="flex justify-between">
        <span class="text-sm text-gray-500">{{ item.name }}</span>
        <span class="text-sm font-mono">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>
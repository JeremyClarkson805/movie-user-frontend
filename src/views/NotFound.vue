<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import StatusIndicator from '../components/StatusIndicator.vue'
import DebugInfo from '../components/DebugInfo.vue'

const router = useRouter()
const themeStore = useThemeStore()
const description = ref<HTMLElement | null>(null)

const debugItems = ref([
  { name: 'Request ID', value: crypto.randomUUID() },
  { name: 'Request Time', value: new Date().toISOString() },
  { name: 'Request', value: `${window.location.pathname}${window.location.search}` },
  { name: 'Request Host', value: window.location.host },
  { name: 'Remote Address', value: '127.0.0.1' },
  { name: 'Referer', value: document.referrer || 'Direct' },
  { name: 'User Agent', value: navigator.userAgent }
])

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

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}

onMounted(async () => {
  if (description.value) {
    await new Promise(resolve => setTimeout(resolve, 900))
    await typeWriter(description.value, '很抱歉，服务器找不到请求的页面')
  }
})
</script>

<template>
  <div class="min-h-screen pt-20 px-4 md:px-6"
       :class="themeStore.isDark ? 'bg-gray-900' : 'white'">
    <div class="max-w-4xl mx-auto">
      <!-- Status Section -->
      <div :class="[
        'rounded-xl p-6 mb-8 shadow-lg transition-all duration-300',
        themeStore.isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
      ]">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusIndicator title="您的客户端" icon="💻" />
          <StatusIndicator title="网络状态" icon="🌐" />
          <StatusIndicator title="Web服务器" icon="🖥️" />
        </div>
      </div>

      <!-- Error Message -->
      <div :class="[
        'rounded-xl p-8 mb-8 text-center shadow-lg transition-all duration-300',
        themeStore.isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
      ]">
        <div class="flex justify-center mb-8">
          <div class="text-8xl animate-bounce">🤔</div>
        </div>
        <h1 class="text-8xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
          404
        </h1>
        <div class="space-y-6">
          <div>
            <h2 class="text-xl font-semibold mb-4 flex items-center justify-center space-x-2">
              <span>发生了什么?</span>
            </h2>
            <div ref="description"
                 class="font-mono text-lg max-w-2xl mx-auto"
                 :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-center space-x-4 mt-8">
            <button @click="goBack"
                    class="px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                    :class="themeStore.isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:scale-105'">
              <span>👈</span>
              <span>返回上页</span>
            </button>
            <button @click="goHome"
                    class="px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 hover:scale-105">
              <span>🏠</span>
              <span>返回首页</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Debug Information -->
      <div :class="[
        'rounded-xl p-6 shadow-lg transition-all duration-300',
        themeStore.isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
      ]">
        <h3 class="text-lg font-semibold mb-4 flex items-center space-x-2">
          <span>🔍</span>
          <span>调试信息</span>
        </h3>
        <DebugInfo :items="debugItems" />
      </div>

    </div>
  </div>
</template>

<style scoped>
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
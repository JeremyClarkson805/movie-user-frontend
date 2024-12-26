<script setup lang="ts">
import { useThemeStore } from '../stores/theme'
import { XCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

const themeStore = useThemeStore()

defineProps<{
  error: string
  statusCode?: number
  onRetry?: () => void
}>()

const getErrorMessage = (statusCode?: number) => {
  switch (statusCode) {
    case 500:
      return '服务器内部错误，请稍后再试'
    case 502:
      return '服务器暂时不可用，请稍后重试'
    case 503:
      return '服务暂时不可用，可能在维护中'
    case 504:
      return '服务器响应超时，请检查网络连接'
    default:
      return '发生了一些错误，请稍后重试'
  }
}

const getErrorSolution = (statusCode?: number) => {
  switch (statusCode) {
    case 500:
      return '您可以：\n1. 刷新页面重试\n2. 稍后再访问\n3. 联系客服寻求帮助'
    case 502:
    case 503:
      return '您可以：\n1. 等待几分钟后重试\n2. 检查网站公告了解维护信息\n3. 关注我们的社交媒体获取最新状态'
    case 504:
      return '您可以：\n1. 检查网络连接\n2. 关闭代理或VPN\n3. 切换网络后重试'
    default:
      return '您可以尝试刷新页面，如果问题持续存在，请联系客服'
  }
}

const refresh = () => {
  window.location.reload()
}
</script>

<template>
  <div :class="[
    'rounded-lg overflow-hidden shadow-xl max-w-lg w-full mx-auto transition-all duration-300 transform',
    themeStore.isDark ? 'bg-gray-800' : 'bg-white'
  ]">
    <div class="p-6">
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <XCircleIcon v-if="statusCode && statusCode >= 500"
                       class="h-8 w-8 text-red-500"
                       aria-hidden="true" />
          <ExclamationTriangleIcon v-else
                                   class="h-8 w-8 text-yellow-500"
                                   aria-hidden="true" />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-medium mb-2">
            {{ getErrorMessage(statusCode) }}
          </h3>
          <div class="text-sm whitespace-pre-line mb-4"
               :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">
            {{ getErrorSolution(statusCode) }}
          </div>
          <div class="flex space-x-3">
            <button v-if="onRetry"
                    @click="onRetry"
                    class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    :class="themeStore.isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'">
              <ArrowPathIcon class="h-4 w-4 mr-2" />
              重试
            </button>
            <button @click="refresh"
                    class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    :class="themeStore.isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">
              刷新页面
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
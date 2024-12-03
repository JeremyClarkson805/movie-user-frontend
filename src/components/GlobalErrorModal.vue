<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

defineProps<{
  show: boolean
  title: string
  message: string
  statusCode?: number
  onRetry?: () => void
  onClose: () => void
}>()

const getErrorSolution = (statusCode?: number) => {
  switch (statusCode) {
    case 503:
      return '服务器暂时不可用，可能正在维护或者负载过高。\n\n建议：\n1. 稍等片刻后重试\n2. 检查网站公告了解维护信息\n3. 如果问题持续存在，请联系客服'
    case 500:
      return '服务器内部错误。\n\n建议：\n1. 刷新页面重试\n2. 清除浏览器缓存\n3. 联系客服报告问题'
    case 404:
      return '请求的资源不存在。\n\n建议：\n1. 检查URL是否正确\n2. 返回首页\n3. 联系客服报告问题'
    case 401:
      return '登录已过期或未授权。\n\n建议：\n1. 重新登录\n2. 检查账号状态\n3. 联系客服寻求帮助'
    case 423:
      return '您已被暂时禁止访问。\n\n建议：\n1.稍后重试\n2. 检查账号状态\n3. 联系客服寻求帮助'
    default:
      return '发生了意外错误。\n\n建议：\n1. 刷新页面重试\n2. 检查网络连接\n3. 如果问题持续存在，请联系客服'
  }
}
</script>

<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="onClose" class="relative z-50">
      <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
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
            'w-full max-w-md rounded-2xl p-6 shadow-xl',
            themeStore.isDark ? 'bg-gray-800' : 'bg-white'
          ]">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="rounded-full p-2" :class="themeStore.isDark ? 'bg-red-900' : 'bg-red-100'">
                  <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
              </div>
              <div class="flex-1">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 mb-2">
                  {{ title }}
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm" :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-500'">
                    {{ message }}
                  </p>
                  <div class="mt-4 text-sm whitespace-pre-line" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                    {{ getErrorSolution(statusCode) }}
                  </div>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                      @click="onClose"
                      :class="[
                      'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      themeStore.isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    ]"
                  >
                    关闭
                  </button>
                  <button
                      v-if="onRetry"
                      @click="onRetry"
                      class="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    重试
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
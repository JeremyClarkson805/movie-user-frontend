<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'

const themeStore = useThemeStore()
const authStore = useAuthStore()

interface DownloadLink {
  id: number
  movieId: number
  linkName: string
  downloadUrl: string
  fileType: string
  size: number
  passwd: string | null
  isBlocked: number // 0-不需要积分 1-需要积分
  points: number // 需要的积分数量
  createdAt: string
  updatedAt: string
}

const props = defineProps<{
  links: Array<DownloadLink>
}>()

const copyStatus = ref<{ [key: number]: boolean }>({})
const unlockingStatus = ref<{ [key: number]: boolean }>({})
const error = ref<string | null>(null)
const showConfirmDialog = ref(false)
const selectedLink = ref<DownloadLink | null>(null)
const isUnlocking = ref(false)
const showSuccessAnimation = ref(false)

const getFileTypeLabel = (type: string) => {
  switch (type) {
    case 'magnet':
      return { label: '磁力链接', color: 'bg-emerald-600' }
    case 'aliyun':
      return { label: '阿里云盘', color: 'bg-blue-500' }
    case 'baidu':
      return { label: '百度云盘', color: 'bg-teal-500' }
    case 'quark':
      return { label: '夸克云盘', color: 'bg-purple-500' }
    default:
      return { label: '其他', color: 'bg-gray-500' }
  }
}

// 添加设备检测函数
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const handleUnlockConfirm = async (link: DownloadLink) => {
  if (!authStore.isAuthenticated) {
    error.value = '请先登录后再兑换下载链接'
    return
  }

  if (link.points > (authStore.userInfo?.balance || 0)) {
    error.value = '积分不足，无法兑换此下载链接'
    return
  }

  selectedLink.value = link
  showConfirmDialog.value = true
}

const getRemainingPoints = () => {
  if (!selectedLink.value || !authStore.userInfo) return 0
  return authStore.userInfo.balance - selectedLink.value.points
}

const handleConfirm = async () => {
  if (!selectedLink.value) return

  try {
    isUnlocking.value = true
    error.value = null

    const formData = new FormData()
    formData.append('movieId', selectedLink.value.movieId.toString())

    const response = await fetch('/api/movie/payToGetDownloadLink', {
      method: 'POST',
      headers: {
        'Authorization': localStorage.getItem('userToken') || ''
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 400) {
        throw new Error(errorData.message || '请求参数错误，请检查输入')
      } else if (response.status === 401) {
        throw new Error('登录已过期，请重新登录')
      } else if (response.status === 403) {
        throw new Error('没有权限执行此操作')
      } else if (response.status === 404) {
        throw new Error('资源不存在')
      } else if (response.status >= 500) {
        throw new Error('服务器错误，请稍后重试')
      } else {
        throw new Error(errorData.message || '兑换失败，请稍后重试')
      }
    }

    const data = await response.json()
    if (data.code === 200) {
      showSuccessAnimation.value = true
      selectedLink.value.isBlocked = 0
      if (authStore.userInfo) {
        authStore.userInfo.balance -= selectedLink.value.points
      }
      showConfirmDialog.value = false

      const timer = setTimeout(async () => {
        try {
          const formData = new FormData()
          formData.append('movieId', selectedLink.value?.movieId.toString() || '')
          const linksResponse = await fetch('/api/movie/downloadLink', {
            method: 'POST',
            headers: {
              'Authorization': localStorage.getItem('userToken') || ''
            },
            body: formData
          })
          const linksData = await linksResponse.json()
          if (linksData.code === 200) {
            props.links.splice(0, props.links.length, ...linksData.data)
          }
        } catch (err) {
          console.error('Failed to refresh links:', err)
        } finally {
          showSuccessAnimation.value = false
          selectedLink.value = null
        }
      }, 2000)

      onBeforeUnmount(() => {
        if (timer) clearTimeout(timer)
      })
    } else {
      throw new Error(data.message || '兑换失败')
    }
  } catch (err) {
    console.error('Unlock error:', err)
    error.value = err instanceof Error ? err.message : '兑换失败，请稍后重试'
  } finally {
    isUnlocking.value = false
  }
}

const handleLinkClick = async (link: DownloadLink) => {
  if (link.isBlocked === 1) {
    return
  }

  // 网盘类型的链接直接打开新窗口
  if (['aliyun', 'baidu', 'quark'].includes(link.fileType)) {
    window.open(link.downloadUrl, '_blank')
    return
  }

  // 磁力链接处理
  if (link.fileType === 'magnet') {
    try {
      // 在桌面端才尝试调用下载器
      if (!isMobileDevice()) {
        const a = document.createElement('a')
        a.href = link.downloadUrl
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }

      // 无论是移动端还是桌面端都复制到剪贴板
      await navigator.clipboard.writeText(link.downloadUrl)
      copyStatus.value[link.id] = true
      setTimeout(() => {
        copyStatus.value[link.id] = false
      }, 2000)
    } catch (err) {
      console.error('Failed to handle magnet link:', err)
    }
    return
  }

  // 其他类型的链接复制到剪贴板
  try {
    await navigator.clipboard.writeText(link.downloadUrl)
    copyStatus.value[link.id] = true
    setTimeout(() => {
      copyStatus.value[link.id] = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">下载链接</h2>

    <!-- Error Message -->
    <div v-if="error"
         class="mb-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-200 relative">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">{{ error }}</p>
          <p class="mt-1 text-xs opacity-75">如果问题持续存在，请刷新页面或联系客服</p>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <div v-for="link in links"
           :key="link.id"
           class="relative overflow-hidden rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <!-- 未锁定状态 -->
        <template v-if="link.isBlocked === 0">
          <button
              class="w-full text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="handleLinkClick(link)"
          >
            <!-- Desktop Layout -->
            <div class="hidden sm:flex items-center p-4 space-x-4">
              <span :class="[
                'px-2 py-1 rounded text-sm font-medium text-white shrink-0',
                getFileTypeLabel(link.fileType).color
              ]">
                {{ getFileTypeLabel(link.fileType).label }}
              </span>
              <span class="font-medium flex-1 truncate">{{ link.linkName }}</span>
              <span v-if="link.passwd" class="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded shrink-0">
                密码: {{ link.passwd }}
              </span>
              <span class="text-sm opacity-75 shrink-0">
                {{ link.size > 0 ? `${link.size.toFixed(1)}GB` : '未知大小' }}
              </span>
            </div>

            <!-- Mobile Layout -->
            <div class="sm:hidden p-2">
              <div class="flex flex-col gap-2">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-0">
                  <span :class="[
                    'px-2 py-0.5 rounded text-xs font-medium text-white',
                    getFileTypeLabel(link.fileType).color
                  ]">
                    {{ getFileTypeLabel(link.fileType).label }}
                  </span>
                  <span class="font-medium text-sm truncate">{{ link.linkName }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span v-if="link.passwd" class="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    密码: {{ link.passwd }}
                  </span>
                  <span class="text-xs opacity-75">
                    {{ link.size > 0 ? `${link.size.toFixed(1)}GB` : '未知大小' }}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </template>

        <!-- 锁定状态 -->
        <template v-else>
          <!-- Desktop Layout -->
          <div class="hidden sm:flex items-center p-4 space-x-4">
            <span :class="[
              'px-2 py-1 rounded text-sm font-medium text-white shrink-0',
              getFileTypeLabel(link.fileType).color
            ]">
              {{ getFileTypeLabel(link.fileType).label }}
            </span>
            <span class="font-medium flex-1 truncate">{{ link.linkName }}</span>
            <div class="flex items-center space-x-3 shrink-0">
              <div class="flex items-center space-x-1">
                <span class="text-base">🔒</span>
                <span class="text-sm font-medium text-blue-500">{{ link.points }} 积分</span>
              </div>
              <button
                  @click="handleUnlockConfirm(link)"
                  :disabled="unlockingStatus[link.id]"
                  class="px-4 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <span v-if="unlockingStatus[link.id]" class="animate-spin text-sm">⚡️</span>
                <span>{{ unlockingStatus[link.id] ? '解锁中' : '解锁' }}</span>
              </button>
            </div>
            <span class="text-sm opacity-75 shrink-0">
              {{ link.size > 0 ? `${link.size.toFixed(1)}GB` : '未知大小' }}
            </span>
          </div>

          <!-- Mobile Layout -->
          <div class="sm:hidden p-2">
            <div class="flex flex-col gap-2">
              <!-- 上半部分：链接信息 -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-0">
                <span :class="[
                  'px-2 py-0.5 rounded text-xs font-medium text-white',
                  getFileTypeLabel(link.fileType).color
                ]">
                  {{ getFileTypeLabel(link.fileType).label }}
                </span>
                <span class="font-medium text-sm truncate">{{ link.linkName }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span v-if="link.passwd" class="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  密码: {{ link.passwd }}
                </span>
                <span class="text-xs opacity-75">
                  {{ link.size > 0 ? `${link.size.toFixed(1)}GB` : '未知大小' }}
                </span>
              </div>

              <!-- 下半部分：解锁按钮 -->
              <div class="flex items-center justify-between border-t dark:border-gray-700 pt-2 mt-1">
                <div class="flex items-center gap-1">
                  <span class="text-base">🔒</span>
                  <span class="text-xs font-medium text-blue-500">{{ link.points }} 积分</span>
                </div>
                <button
                    @click="handleUnlockConfirm(link)"
                    :disabled="unlockingStatus[link.id]"
                    class="px-3 py-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span v-if="unlockingStatus[link.id]" class="animate-spin text-xs">⚡️</span>
                  <span>{{ unlockingStatus[link.id] ? '解锁中' : '解锁' }}</span>
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- 复制成功提示 -->
        <div
            :class="[
              'absolute inset-0 flex items-center justify-center bg-green-500 text-white transition-all duration-200',
              copyStatus[link.id]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-full pointer-events-none'
            ]"
        >
          已复制到剪贴板！
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <TransitionRoot appear :show="showConfirmDialog" as="template">
      <Dialog as="div" @close="showConfirmDialog = false" class="relative z-50">
        <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
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
                'w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all',
                themeStore.isDark ? 'bg-gray-800' : 'bg-white'
              ]">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium leading-6">
                    确认兑换下载链接
                  </h3>
                  <button
                      @click="showConfirmDialog = false"
                      class="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div class="mt-4 space-y-4">
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <span :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                        当前积分
                      </span>
                      <span class="font-medium">{{ authStore.userInfo?.balance || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                        所需积分
                      </span>
                      <span class="font-medium text-blue-500">
                        {{ selectedLink?.points || 0 }}
                      </span>
                    </div>
                    <div class="border-t dark:border-gray-700 my-2"></div>
                    <div class="flex justify-between items-center">
                      <span :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                        剩余积分
                      </span>
                      <span class="font-medium">{{ getRemainingPoints() }}</span>
                    </div>
                  </div>

                  <div class="mt-6 flex justify-end space-x-3">
                    <button
                        @click="showConfirmDialog = false"
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        :class="themeStore.isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'"
                    >
                      取消
                    </button>
                    <button
                        @click="handleConfirm"
                        :disabled="isUnlocking"
                        class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ isUnlocking ? '处理中...' : '确认兑换' }}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Success Animation Overlay -->
    <TransitionRoot appear :show="showSuccessAnimation" as="template">
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <TransitionChild
            as="template"
            enter="duration-500 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
        >
          <div class="relative transform overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 p-6 text-center shadow-xl transition-all">
            <div class="relative z-10 text-white">
              <!-- Success Icon -->
              <div class="mb-4 flex justify-center">
                <svg class="h-16 w-16 animate-bounce text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <!-- Success Message -->
              <h3 class="mb-2 text-2xl font-bold">兑换成功！</h3>
              <p class="text-lg">下载链接已解锁</p>

              <!-- Animated Particles -->
              <div class="absolute inset-0 -z-10">
                <div class="particle-1"></div>
                <div class="particle-2"></div>
                <div class="particle-3"></div>
              </div>
            </div>
          </div>
        </TransitionChild>
      </div>
    </TransitionRoot>
  </div>
</template>

<style scoped>
@keyframes float-up {
  0% {
    transform: translateY(100%) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100%) rotate(360deg);
    opacity: 0;
  }
}

.particle-1,
.particle-2,
.particle-3 {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  animation: float-up 2s infinite;
}

.particle-1 {
  left: 25%;
  animation-delay: 0s;
}

.particle-2 {
  left: 50%;
  animation-delay: 0.5s;
}

.particle-3 {
  left: 75%;
  animation-delay: 1s;
}
</style>
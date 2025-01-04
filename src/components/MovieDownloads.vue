<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  links: Array<{
    id: number
    linkName: string
    downloadUrl: string
    fileType: string
    size: number
    passwd: string | null
  }>
}>()

const copyStatus = ref<{ [key: number]: boolean }>({})

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

const handleLinkClick = async (link: typeof props.links[0]) => {
  // 网盘类型的链接直接打开新窗口
  if (['aliyun', 'baidu', 'quark'].includes(link.fileType)) {
    window.open(link.downloadUrl, '_blank')
    return
  }
  
  // 磁力链接尝试调用下载器
  if (link.fileType === 'magnet') {
    try {
      // 创建一个隐藏的 a 标签
      const a = document.createElement('a')
      a.href = link.downloadUrl
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      // 同时也复制到剪贴板作为备份
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
    <div class="space-y-3">
      <div v-for="link in links"
           :key="link.id"
           class="relative overflow-hidden rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
            class="w-full text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="handleLinkClick(link)"
        >
          <div class="flex items-center p-4">
            <span :class="[
              'px-2 py-1 rounded text-xs font-medium text-white mr-3',
              getFileTypeLabel(link.fileType).color
            ]">
              {{ getFileTypeLabel(link.fileType).label }}
            </span>

            <div class="flex-1 flex items-center justify-between">
              <span class="font-medium text-base truncate pr-4">{{ link.linkName }}</span>
              <div class="flex items-center space-x-3">
                <span v-if="link.passwd"
                      class="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  密码: {{ link.passwd }}
                </span>
                <span class="font-medium text-sm opacity-75 whitespace-nowrap">
                  {{ link.size > 0 ? `${link.size.toFixed(1)}GB` : '未知大小' }}
                </span>
              </div>
            </div>
          </div>
        </button>

        <!-- Copy Success Indicator -->
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
  </div>
</template>
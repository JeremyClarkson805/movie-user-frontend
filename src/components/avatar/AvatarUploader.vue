<script setup lang="ts">
import { ref, watch } from 'vue'
import { useThemeStore } from '../../stores/theme'

const props = defineProps<{
  show: boolean
  currentAvatar?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'crop', data: string): void
}>()

const themeStore = useThemeStore()
const imageInput = ref<HTMLInputElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const image = ref<HTMLImageElement | null>(null)
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const position = ref({ x: 0, y: 0 })
const scale = ref(1)
const cropSize = 200
const error = ref('')

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      error.value = '请选择图片文件'
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = '图片大小不能超过5MB'
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        image.value = img
        initializeCanvas()
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
    error.value = ''
  }
}

const initializeCanvas = () => {
  if (!canvas.value || !image.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  // 重置位置和缩放
  position.value = { x: 0, y: 0 }
  scale.value = 1

  // 计算初始缩放以适应裁剪区域
  const ratio = cropSize / Math.min(image.value.width, image.value.height)
  scale.value = ratio

  // 居中图片
  position.value.x = (cropSize - image.value.width * scale.value) / 2
  position.value.y = (cropSize - image.value.height * scale.value) / 2

  drawImage()
}

const drawImage = () => {
  if (!canvas.value || !image.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  // 清除画布
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // 绘制图片
  ctx.save()
  ctx.translate(position.value.x, position.value.y)
  ctx.scale(scale.value, scale.value)
  ctx.drawImage(image.value, 0, 0)
  ctx.restore()

  updatePreview()
}

const updatePreview = () => {
  if (!canvas.value || !previewCanvas.value) return

  const ctx = previewCanvas.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, cropSize, cropSize)
  ctx.drawImage(canvas.value, 0, 0)
}

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  startPos.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return

  position.value = {
    x: e.clientX - startPos.value.x,
    y: e.clientY - startPos.value.y
  }

  drawImage()
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()

  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(0.1, Math.min(3, scale.value + delta))

  // 计算缩放中心点
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return

  const mouseX = e.clientX - rect.left - position.value.x
  const mouseY = e.clientY - rect.top - position.value.y

  // 调整位置以保持鼠标位置不变
  position.value = {
    x: position.value.x - (mouseX * (newScale - scale.value)) / scale.value,
    y: position.value.y - (mouseY * (newScale - scale.value)) / scale.value
  }

  scale.value = newScale
  drawImage()
}

const handleCrop = () => {
  if (!previewCanvas.value) return
  const dataUrl = previewCanvas.value.toDataURL('image/jpeg', 0.8)
  emit('crop', dataUrl)
}

watch(() => props.show, (newVal) => {
  if (newVal && props.currentAvatar) {
    const img = new Image()
    img.onload = () => {
      image.value = img
      initializeCanvas()
    }
    img.src = props.currentAvatar
  }
})
</script>

<template>
  <div v-if="show"
       class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
       @click.self="$emit('close')">
    <div :class="[
      'max-w-xl w-full mx-4 rounded-lg p-6',
      themeStore.isDark ? 'bg-gray-800' : 'bg-white'
    ]">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">编辑头像</h2>
        <button @click="$emit('close')"
                class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 图片上传区域 -->
      <div v-if="!image"
           class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
           :class="themeStore.isDark ? 'border-gray-600' : 'border-gray-300'"
           @click="imageInput?.click()">
        <input
            ref="imageInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
        >
        <div class="text-4xl mb-4">📷</div>
        <p class="mb-2">点击或拖拽图片到此处</p>
        <p class="text-sm" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-500'">
          支持 JPG、PNG 格式，最大 5MB
        </p>
      </div>

      <!-- 错误提示 -->
      <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>

      <!-- 图片裁剪区域 -->
      <div v-if="image" class="space-y-4">
        <div class="relative">
          <!-- 主画布 -->
          <canvas
              ref="canvas"
              :width="cropSize"
              :height="cropSize"
              class="border rounded-lg cursor-move"
              :class="themeStore.isDark ? 'border-gray-600' : 'border-gray-300'"
              @mousedown="handleMouseDown"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
              @wheel="handleWheel"
          ></canvas>

          <!-- 裁剪预览 -->
          <canvas
              ref="previewCanvas"
              :width="cropSize"
              :height="cropSize"
              class="hidden"
          ></canvas>

          <!-- 圆形遮罩 -->
          <div class="absolute inset-0 rounded-lg"
               :style="{
                 boxShadow: `0 0 0 ${cropSize}px rgba(0, 0, 0, 0.5)`,
                 borderRadius: '50%'
               }">
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-3">
          <button
              @click="imageInput?.click()"
              class="px-4 py-2 rounded-lg font-medium"
              :class="themeStore.isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'"
          >
            重新选择
          </button>
          <button
              @click="handleCrop"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            确认裁剪
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

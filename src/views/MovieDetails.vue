<script lang="ts" setup>
import {ref, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {useThemeStore} from '../stores/theme'
import {apiService} from '../services/api'

const route = useRoute()
const themeStore = useThemeStore()

interface Writer {
  id: number
  name: string
}

interface Actor {
  id: number
  name: string
}

interface DownloadLink {
  id: number
  movieId: number
  linkName: string
  downloadUrl: string
  fileType: string
  size: number
  passwd: string | null
  createdAt: string | null
  updatedAt: string | null
}

interface MovieDetail {
  movieId: number
  title: string
  releaseYear: number
  duration: string
  rating: number
  director: string
  writers: Writer[]
  actors: Actor[]
  categories: string[]
  posterUrl: string
  country: string
  createTime: string
  intro: string
}

const movie = ref<MovieDetail>({
  movieId: 0,
  title: '',
  releaseYear: 0,
  duration: '',
  rating: 0,
  director: '',
  writers: [],
  actors: [],
  categories: [],
  posterUrl: '',
  country: '',
  createTime: '',
  intro: ''
})

const downloadLinks = ref<DownloadLink[]>([])
const copyStatus = ref<{ [key: number]: boolean }>({})
const error = ref('')

const getFileTypeLabel = (type: string) => {
  switch (type) {
    case 'magnet':
      return {label: '磁力链接', color: 'bg-emerald-600'}
    case 'aliyun':
      return {label: '阿里云盘', color: 'bg-blue-500'}
    default:
      return {label: '其他', color: 'bg-gray-500'}
  }
}

const fetchMovieDetail = async (id: string | string[]) => {
  try {
    const response = await apiService.movies.getDetail(id)
    movie.value = response.data
    await fetchDownloadLinks(id)
  } catch (error) {
    console.error('Failed to fetch movie details:', error)
  }
}

const fetchDownloadLinks = async (movieId: string | string[]) => {
  try {
    const formData = new FormData()
    formData.append('id', movieId.toString())

    const response = await fetch('/api/movie/downloadLink', {
      method: 'POST',
      headers: {
        'Authorization': localStorage.getItem('userToken') || localStorage.getItem('guestToken') || ''
      },
      body: formData
    })

    const data = await response.json()
    if (data.code === 200) {
      downloadLinks.value = data.data
    } else {
      error.value = data.message || '获取下载链接失败'
    }
  } catch (err) {
    console.error('Failed to fetch download links:', err)
    error.value = '获取下载链接失败'
  }
}

const copyToClipboard = async (link: DownloadLink) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(link.downloadUrl);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = link.downloadUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (!successful) {
        throw new Error('复制命令执行失败');
      }
    }

    copyStatus.value[link.id] = true;
    setTimeout(() => {
      copyStatus.value[link.id] = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    error.value = '复制失败，请尝试手动选择并复制链接';
  }
}

onMounted(() => {
  if (route.params.id) {
    fetchMovieDetail(route.params.id)
  } else {
    console.error('No movie ID provided in route params')
  }
})
</script>

<template>
  <div class="pt-20">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-1">
        <img :alt="movie.title" :src="movie.posterUrl"
             class="w-full rounded-lg shadow-xl"/>
      </div>

      <div class="md:col-span-2">
        <h1 class="text-4xl font-bold mb-4">{{ movie.title }}</h1>
        <div class="space-y-6">
          <div>
            <h2 class="text-xl font-semibold mb-2">导演</h2>
            <p class="font-medium">{{ movie.director }}</p>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-2">编剧</h2>
            <p v-for="writer in movie.writers" :key="writer.id" class="pl-2 font-medium">
              {{ writer.name }}
            </p>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-3">演员</h2>
            <div class="space-y-2">
              <p v-for="actor in movie.actors" :key="actor.id" class="pl-2 font-medium">
                {{ actor.name }}
              </p>
            </div>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-2">分类</h2>
            <div class="flex flex-wrap gap-2">
              <span v-for="category in movie.categories"
                    :key="category"
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium',
                      themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
                    ]">
                {{ category }}
              </span>
            </div>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-2">简介</h2>
            <p
                :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'"
                class="font-medium whitespace-pre-wrap indent-8"
            >
              {{ movie.intro }}
            </p>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-2">相关信息</h2>
            <p :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'" class="font-medium">
              {{ movie.releaseYear }} | {{ movie.duration }}分钟 | {{ movie.country }} | 评分: {{ movie.rating }}
            </p>
          </div>


          <div>
            <h2 class="text-xl font-semibold mb-4">下载链接</h2>
            <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
            <div class="grid gap-4">
              <div
                  v-for="link in downloadLinks"
                  :key="link.id"
                  :class="themeStore.isDark ?
        'border-gray-700 bg-gray-800' :
        'border-gray-200 bg-gray-100'"
                  class="relative overflow-hidden rounded-lg border"
              >
                <button
                    :class="themeStore.isDark ?
          'hover:bg-gray-700' :
          'hover:bg-gray-200'"
                    class="w-full text-left transition-colors"
                    @click="copyToClipboard(link)"
                >
                  <div class="flex items-center p-4">
                    <!-- 文件类型标签 -->
                    <span
                        :class="[
              'px-2 py-1 rounded text-xs font-medium text-white mr-3',
              getFileTypeLabel(link.fileType).color
            ]"
                    >
            {{ getFileTypeLabel(link.fileType).label }}
          </span>

                    <!-- 链接名称和大小 -->
                    <div class="flex-1 flex items-center justify-between">
                      <span class="font-medium text-base truncate pr-4">{{ link.linkName }}</span>
                      <span class="font-medium text-sm opacity-75 whitespace-nowrap">
              {{ link.size > 0 ? `${link.size.toFixed(1)}GB` : '未知大小' }}
            </span>
                    </div>
                  </div>
                </button>

                <!-- 复制成功提示 -->
                <div
                    :class="[
          copyStatus[link.id]
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-full pointer-events-none'
        ]"
                    class="absolute inset-0 flex items-center justify-center bg-green-500 text-white transition-all duration-200"
                >
                  已复制到剪贴板！
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  </div>
</template>
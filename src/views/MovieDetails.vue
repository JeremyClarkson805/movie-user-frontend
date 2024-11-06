<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { apiService } from '../services/api'

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
  id: string
  type: string
  name: string
  data: string
  passwd: string | null
}

interface MovieDetail {
  movieId: number
  title: string
  releaseYear: number
  rating: number
  director: string
  writers: Writer[]
  actors: Actor[]
  posterUrl: string
  country: string
  intro: string
}

const movie = ref<MovieDetail>({
  movieId: 0,
  title: '',
  releaseYear: 0,
  rating: 0,
  director: '',
  writers: [],
  actors: [],
  posterUrl: '',
  country: '',
  intro: ''
})

const downloadLinks = ref<DownloadLink[]>([])
const copyStatus = ref<{ [key: string]: boolean }>({})
const error = ref('')

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
    await navigator.clipboard.writeText(link.data)
    copyStatus.value[link.id] = true
    setTimeout(() => {
      copyStatus.value[link.id] = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    error.value = '复制失败'
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
        <img :src="movie.posterUrl" :alt="movie.title"
             class="w-full rounded-lg shadow-xl" />
      </div>

      <div class="md:col-span-2">
        <h1 class="text-4xl font-bold mb-4">{{ movie.title }}</h1>
        <div class="space-y-6">
          <div>
            <h2 class="text-xl font-semibold mb-2">导演</h2>
            <p class="font-medium">{{ movie.director }}</p>
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
            <h2 class="text-xl font-semibold mb-2">编剧</h2>
            <p v-for="writer in movie.writers" :key="writer.id" class="pl-2 font-medium">
              {{ writer.name }}
            </p>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-2">简介</h2>
            <p class="font-medium" :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">
              {{ movie.intro }}
            </p>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-2">相关信息</h2>
            <p class="font-medium" :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">
              {{ movie.releaseYear }}  |  {{ movie.country }}  |  评分: {{ movie.rating }}
            </p>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-4">下载链接</h2>
            <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
            <div class="grid gap-4">
              <button
                  v-for="link in downloadLinks"
                  :key="link.id"
                  @click="copyToClipboard(link)"
                  :class="[
                  'flex items-center justify-between p-4 rounded-lg transition-colors relative overflow-hidden',
                  themeStore.isDark
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                ]"
              >
                <span class="font-semibold truncate pr-4">{{ link.name }}</span>
                <span
                    class="absolute inset-0 flex items-center justify-center bg-green-500 text-white transition-transform duration-200"
                    :class="copyStatus[link.id] ? 'translate-y-0' : 'translate-y-full'"
                >
                  已复制到剪贴板！
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
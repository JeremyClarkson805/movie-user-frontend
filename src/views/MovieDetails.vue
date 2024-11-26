<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { apiService } from '../services/api'
import MovieDownloads from '../components/MovieDownloads.vue'

const route = useRoute()
const themeStore = useThemeStore()

interface MovieDetail {
  movieId: number
  title: string
  releaseYear: number
  duration: string
  rating: number
  director: string
  writers: Array<{ id: number; name: string }>
  actors: Array<{ id: number; name: string }>
  categories: string[]
  posterUrl: string
  country: string
  createTime: string
  intro: string
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
const error = ref('')
const isLoading = ref(true)

const fetchMovieDetail = async (id: string | string[]) => {
  try {
    isLoading.value = true
    const response = await apiService.movies.getDetail(id)
    movie.value = response.data
    document.title = `${movie.value.title} - 电影详情`
    await fetchDownloadLinks(id)
  } catch (error) {
    console.error('Failed to fetch movie details:', error)
    document.title = '电影详情'
  } finally {
    isLoading.value = false
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

onMounted(() => {
  if (route.params.id) {
    fetchMovieDetail(route.params.id)
  }
})

onUnmounted(() => {
  document.title = '电影网站'
})
</script>

<template>
  <div class="pt-20 px-4 md:px-6 lg:px-8">
    <!-- Loading State -->
    <div v-if="isLoading"
         class="min-h-[60vh] flex items-center justify-center">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error"
         class="min-h-[60vh] flex items-center justify-center">
      <div class="text-center">
        <p class="text-red-500 text-xl mb-4">{{ error }}</p>
        <button
            @click="fetchMovieDetail(route.params.id)"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="max-w-6xl mx-auto">
      <div :class="[
        'rounded-2xl overflow-hidden shadow-xl',
        themeStore.isDark ? 'bg-gray-800' : 'bg-white'
      ]">
        <!-- Movie Header with Poster and Basic Info -->
        <div class="relative overflow-hidden">
          <!-- Background Image (Blurred) -->
          <div class="absolute inset-0 z-0">
            <img
                :src="movie.posterUrl"
                :alt="movie.title"
                class="w-full h-full object-cover filter blur-xl opacity-30 transform scale-110"
            />
          </div>

          <!-- Content -->
          <div class="relative z-10 p-8">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <!-- Poster -->
              <div class="lg:col-span-4">
                <img
                    :src="movie.posterUrl"
                    :alt="movie.title"
                    class="w-full rounded-lg shadow-2xl"
                    @error="$event.target.src = 'https://placehold.co/400x600/1f2937/ffffff?text=Movie+Poster'"
                />
              </div>

              <!-- Basic Info -->
              <div class="lg:col-span-8 flex flex-col justify-center">
                <h1 class="text-4xl font-bold mb-4 line-clamp-4">{{ movie.title }}</h1>
                <div class="flex flex-wrap items-center gap-4 mb-6">
                  <div class="flex items-center">
                    <span class="text-yellow-400 mr-2 text-2xl">⭐</span>
                    <span class="text-2xl font-bold">{{ movie.rating ? movie.rating.toFixed(1) : 'N/A' }}</span>
                  </div>
                  <span class="text-lg">{{ movie.releaseYear }}</span>
                  <span class="text-lg">{{ movie.duration }}分钟</span>
                  <span class="text-lg">{{ movie.country }}</span>
                </div>

                <!-- Categories -->
                <div class="flex flex-wrap gap-2">
                  <span v-for="category in movie.categories"
                        :key="category"
                        :class="[
                          'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                          themeStore.isDark
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                        ]">
                    {{ category }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Movie Details -->
        <div class="p-8 space-y-8">
          <!-- Synopsis -->
          <div>
            <h2 class="text-xl font-semibold mb-3">剧情简介</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {{ movie.intro }}
            </p>
          </div>

          <!-- Cast & Crew -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Director -->
            <div>
              <h2 class="text-xl font-semibold mb-3">导演</h2>
              <p class="text-gray-600 dark:text-gray-300">{{ movie.director }}</p>
            </div>

            <!-- Writers -->
            <div>
              <h2 class="text-xl font-semibold mb-3">编剧</h2>
              <div class="space-y-2">
                <p v-for="writer in movie.writers"
                   :key="writer.id"
                   class="text-gray-600 dark:text-gray-300">
                  {{ writer.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actors -->
          <div>
            <h2 class="text-xl font-semibold mb-3">演员表</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="actor in movie.actors"
                   :key="actor.id"
                   class="text-gray-600 dark:text-gray-300">
                {{ actor.name }}
              </div>
            </div>
          </div>

          <!-- Download Links -->
          <MovieDownloads
              v-if="downloadLinks.length > 0"
              :links="downloadLinks"
          />
        </div>
      </div>
    </div>
  </div>
</template>
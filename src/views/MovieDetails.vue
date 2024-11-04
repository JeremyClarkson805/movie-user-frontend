<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import axios from 'axios'

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
  downloads: {
    quality: string
    size: string
    link: string
  }[]
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
  intro: '',
  downloads: [
    { quality: '4K HDR', size: '58.2 GB', link: '#4k' },
    { quality: '1080p BluRay', size: '18.4 GB', link: '#1080p' },
    { quality: '720p WEB-DL', size: '4.2 GB', link: '#720p' },
    { quality: '480p WEB-DL', size: '1.8 GB', link: '#480p' }
  ]
})

const getAuthHeader = () => {
  const token = localStorage.getItem('authorization')
  return token ? { 'Authorization': token } : {}
}

const fetchMovieDetail = async (id: string | string[]) => {
  try {
    console.log('Fetching movie details for ID:', id)
    const response = await axios.get(`/api/movie/detail?id=${id}`, {
      headers: {
        ...getAuthHeader()
      }
    })
    console.log('API response:', response.data)
    if (response.data.code === 200) {
      movie.value = {
        ...response.data.data,
        downloads: movie.value.downloads
      }
    }
  } catch (error) {
    console.error('Failed to fetch movie details:', error)
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
            <p class=" font-medium">{{ movie.director }}</p>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold mb-3">演员</h2>
            <div class="space-y-2">  <!-- 为演员列表添加独立的间距容器 -->
              <p v-for="actor in movie.actors" :key="actor.id" class="pl-2 font-medium">
                {{ actor.name }}
              </p>
            </div>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold mb-2">编剧</h2>
            <!-- <p class=" font-medium">{{ movie.writers.map(writer => writer.name).join(', ') }}</p> -->
            <p v-for="writer in movie.writers" :key="writer.id" class="pl-2 font-medium">
                {{ writer.name }}
              </p>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold mb-2">简介</h2>
            <p class=" font-medium":class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">
              {{ movie.intro }}
            </p>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-2">相关信息</h2>
            <p class=" font-medium" :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">
              {{ movie.releaseYear }}  |  {{ movie.country }}  |  评分: {{ movie.rating }}
            </p>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold mb-4">下载链接</h2>
            <div class="grid gap-4">
              <a v-for="download in movie.downloads"
                :key="download.quality"
                :href="download.link"
                :class="[
                  'flex items-center justify-between p-4 rounded-lg transition-colors',
                  themeStore.isDark
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                ]">
                <span class="font-semibold">{{ download.quality }}</span>
                <span :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                  {{ download.size }}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
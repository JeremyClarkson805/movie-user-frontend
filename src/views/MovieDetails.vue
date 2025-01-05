<script setup lang="ts">
import {ref, onMounted, onUnmounted, watch} from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { apiService } from '../services/api'
import MovieDownloads from '../components/MovieDownloads.vue'
import { useAntiDebug } from '../utils/anti-debug'
import { useContentProtection } from '../utils/content-protection'
import { shuffleArray } from '../utils/shuffle'
import { useVisitTrackerStore } from '../stores/visitTracker'
import CaptchaModal from '../components/CaptchaModal.vue'

const route = useRoute()
const themeStore = useThemeStore()
const { obfuscate, deobfuscate, loadWithProtection } = useContentProtection()
const visitTracker = useVisitTrackerStore()
const showCaptcha = ref(visitTracker.needsCaptcha())
const isContentLocked = ref(visitTracker.needsCaptcha())

// Enable anti-debugging
useAntiDebug()

const handleCaptchaVerified = async () => {
  showCaptcha.value = false
  isContentLocked.value = false
  visitTracker.incrementVisit()

  if (route.params.id) {
    try {
      isLoading.value = true
      await fetchMovieDetail(route.params.id)
    } catch (err) {
      console.error('Failed to load movie details:', err)
      error.value = err instanceof Error ? err.message : '加载失败'
    } finally {
      isLoading.value = false
    }
  }
}

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

interface MovieResponse {
  data: MovieDetail | null;
  code: number;
  message: string;
}

interface LinksResponse {
  data: DownloadLink[];
  code: number;
  message: string;
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
const isContentProtected = ref(true)

// 更新页面元数据
const updateMetadata = () => {
  // 基础标题和描述
  const title = `${movie.value.title} (${movie.value.releaseYear}) - MovieHub`
  const description = movie.value.intro || '暂无简介'

  document.title = title

  // 更新meta标签
  const updateMetaTag = (name: string, content: string, property = false) => {
    let meta = document.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(property ? 'property' : 'name', name)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  // 基础SEO meta标签
  updateMetaTag('description', description)
  updateMetaTag('keywords', `${movie.value.title},${movie.value.categories.join(',')},电影下载,在线观看`)

  // Open Graph meta标签
  updateMetaTag('og:title', title, true)
  updateMetaTag('og:description', description, true)
  updateMetaTag('og:type', 'video.movie', true)
  updateMetaTag('og:image', movie.value.posterUrl, true)
  updateMetaTag('og:url', window.location.href, true)
  updateMetaTag('og:site_name', 'MovieHub', true)

  // Twitter Card meta标签
  updateMetaTag('twitter:card', 'summary_large_image')
  updateMetaTag('twitter:title', title)
  updateMetaTag('twitter:description', description)
  updateMetaTag('twitter:image', movie.value.posterUrl)

  // 添加结构化数据
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    'name': movie.value.title,
    'description': movie.value.intro,
    'image': movie.value.posterUrl,
    'datePublished': movie.value.createTime,
    'director': {
      '@type': 'Person',
      'name': movie.value.director
    },
    'actor': movie.value.actors.map(actor => ({
      '@type': 'Person',
      'name': actor.name
    })),
    'genre': movie.value.categories,
    'duration': `PT${movie.value.duration}M`,
    'countryOfOrigin': movie.value.country,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': movie.value.rating,
      'bestRating': '10',
      'worstRating': '0'
    }
  }

  let scriptTag = document.querySelector('script[type="application/ld+json"]')
  if (!scriptTag) {
    scriptTag = document.createElement('script')
    scriptTag.setAttribute('type', 'application/ld+json')
    document.head.appendChild(scriptTag)
  }
  scriptTag.textContent = JSON.stringify(schema)
}

const fetchMovieDetail = async (id: string | string[]) => {
  try {
    isLoading.value = true
    error.value = ''
    isContentProtected.value = true

    const movieId = Array.isArray(id) ? id[0] : id

    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('请求超时')), 10000)
    )

    const [movieResponse, linksResponse] = await Promise.race<[MovieResponse, LinksResponse]>([
      Promise.all([
        loadWithProtection<MovieResponse>(
            () => apiService.movies.getDetail(movieId),
            { minDelay: 300, maxDelay: 1000 }
        ),
        loadWithProtection<LinksResponse>(
            () => fetchDownloadLinks(movieId),
            { minDelay: 300, maxDelay: 1000 }
        )
      ]),
      timeout
    ])

    if (!movieResponse?.data) {
      throw new Error('未获取到电影数据')
    }

    movie.value = {
      ...movieResponse.data,
      intro: movieResponse.data.intro ? deobfuscate(movieResponse.data.intro) : '',
      director: movieResponse.data.director ? deobfuscate(movieResponse.data.director) : '',
      writers: (movieResponse.data.writers || []).map(w => ({
        ...w,
        name: deobfuscate(w.name)
      })),
      actors: (movieResponse.data.actors || []).map(a => ({
        ...a,
        name: deobfuscate(a.name)
      }))
    }

    // 更新页面元数据
    updateMetadata()
    isContentProtected.value = false

  } catch (err) {
    console.error('Failed to fetch movie details:', err)
    error.value = err instanceof Error ? err.message : '获取电影详情失败'
    isContentProtected.value = false
  } finally {
    isLoading.value = false
  }
}

const fetchDownloadLinks = async (movieId: string | string[]): Promise<LinksResponse> => {
  try {
    const formData = new FormData()
    formData.append('id', movieId.toString())

    const response = await fetch('/api/movie/downloadLink', {
      method: 'POST',
      headers: {
        'Authorization': localStorage.getItem('userToken') || localStorage.getItem('guestToken') || ''
      },
      body: formData,
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.code === 200) {
      downloadLinks.value = data.data || []
      return { data: data.data, code: data.code, message: data.message }
    } else {
      throw new Error(data.message || '获取下载链接失败')
    }
  } catch (err) {
    console.error('Failed to fetch download links:', err)
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = '获取下载链接失败'
    }
    downloadLinks.value = []
    return { data: [], code: 500, message: error.value }
  }
}

// 添加路由监听，处理路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchMovieDetail(newId)
  }
})

onMounted(async () => {
  if (route.params.id) {
    if (!isContentLocked.value) {
      try {
        isLoading.value = true
        await fetchMovieDetail(route.params.id)
        visitTracker.incrementVisit()
      } catch (err) {
        console.error('Failed to load movie details:', err)
        error.value = err instanceof Error ? err.message : '加载失败'
      } finally {
        isLoading.value = false
      }
    }
  } else {
    error.value = '未找到电影ID'
    isLoading.value = false
  }
})

onUnmounted(() => {
  // 清理结构化数据
  const scriptTag = document.querySelector('script[type="application/ld+json"]')
  if (scriptTag) {
    scriptTag.remove()
  }
})
</script>

<template>
  <div class="pt-20 px-4 md:px-6 lg:px-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-[60vh] flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="min-h-[60vh] flex items-center justify-center">
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
    <article v-else-if="!isLoading && !isContentLocked" class="max-w-6xl mx-auto">
      <div :class="[
        'rounded-2xl overflow-hidden shadow-xl',
        themeStore.isDark ? 'bg-gray-800' : 'bg-white'
      ]">
        <!-- Movie Header with Poster and Basic Info -->
        <header class="relative overflow-hidden">
          <!-- Background Image (Blurred) -->
          <div class="absolute inset-0 z-0">
            <img
                :src="movie.posterUrl"
                :alt="`${movie.title} 背景图片`"
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
                    :alt="`${movie.title} 电影海报`"
                    class="w-full rounded-lg shadow-2xl"
                    @error="($event.target as HTMLImageElement).src = 'https://placehold.co/400x600/1f2937/ffffff?text=Movie+Poster'"
                />
              </div>

              <!-- Basic Info -->
              <div class="lg:col-span-8 flex flex-col justify-center">
                <h1 class="text-4xl font-bold mb-4 line-clamp-4">{{ movie.title }}</h1>
                <div class="flex flex-wrap items-center gap-4 mb-6">
                  <div class="flex items-center">
                    <span class="text-yellow-400 mr-2 text-2xl" aria-label="评分">⭐</span>
                    <span class="text-2xl font-bold">{{ movie.rating ? movie.rating.toFixed(1) : 'N/A' }}</span>
                  </div>
                  <time :datetime="movie.releaseYear.toString()" class="text-lg">{{ movie.releaseYear }}</time>
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
        </header>

        <!-- Movie Details -->
        <div class="p-8 space-y-8">
          <!-- Synopsis -->
          <section>
            <h2 class="text-xl font-semibold mb-3">剧情简介</h2>
            <div class="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {{ movie.intro }}
            </div>
          </section>

          <!-- Cast & Crew -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Director -->
            <section>
              <h2 class="text-xl font-semibold mb-3">导演</h2>
              <p class="text-gray-600 dark:text-gray-300">{{ movie.director }}</p>
            </section>

            <!-- Writers -->
            <section>
              <h2 class="text-xl font-semibold mb-3">编剧</h2>
              <div class="space-y-2">
                <p v-for="writer in movie.writers"
                   :key="writer.id"
                   class="text-gray-600 dark:text-gray-300">
                  {{ writer.name }}
                </p>
              </div>
            </section>
          </div>

          <!-- Actors -->
          <section>
            <h2 class="text-xl font-semibold mb-3">演员表</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="actor in movie.actors"
                   :key="actor.id"
                   class="text-gray-600 dark:text-gray-300">
                {{ actor.name }}
              </div>
            </div>
          </section>

          <!-- Download Links -->
          <section v-if="downloadLinks.length > 0">
            <MovieDownloads :links="downloadLinks" />
          </section>
        </div>
      </div>
    </article>
  </div>
  <CaptchaModal
      v-if="showCaptcha"
      :show="showCaptcha"
      @verified="handleCaptchaVerified"
      @error="error = '验证失败，请重试'"
  />
</template>

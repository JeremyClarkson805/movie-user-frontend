<script setup lang="ts">
import MovieCard from '../components/MovieCard.vue'
import PageErrorHandler from '../components/PageErrorHandler.vue'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

interface Movie {
  movieId: number
  title: string
  posterUrl: string
  releaseYear: number
  rating: number
}

interface MovieResponse {
  list: Movie[]
  total: number
  pages: number
  pageNum: number
  pageSize: number
}

const route = useRoute()
const router = useRouter()
const page = ref(parseInt(route.query.page as string) || 1)
const pageSize = ref(20)
const movies = ref<Movie[]>([])
const totalPages = ref(0)
const loading = ref(false)
const error = ref<Error | null>(null)

const getAuthHeader = () => {
  const userToken = localStorage.getItem('userToken')
  const guestToken = localStorage.getItem('guestToken')
  return userToken || guestToken
      ? { 'Authorization': `${userToken || guestToken}` }
      : {}
}

const paginationArray = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l: number

  range.push(1)

  for (let i = page.value - delta; i <= page.value + delta; i++) {
    if (i < totalPages.value && i > 1) {
      range.push(i)
    }
  }

  range.push(totalPages.value)

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

const fetchMovies = async () => {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams({
      page: page.value.toString()/*,
      pageSize: pageSize.value.toString()*/
    })

    if (route.params.category) {
      params.append('categoryNameEn', route.params.category as string)
    }

    const response = await axios.get(`/api/movie/list?${params}`,
        {
          headers: {
            ...getAuthHeader()
          }
        }
    )

    if (response.data.code === 200) {
      const responseData = response.data.data as MovieResponse
      movies.value = responseData.list
      totalPages.value = responseData.pages
      pageSize.value = responseData.pageSize

      if (page.value > totalPages.value) {
        page.value = totalPages.value
        await fetchMovies()
      }
    } else {
      throw new Error(response.data.message || '获取电影数据失败')
    }
  } catch (err) {
    console.error('请求出错:', err)
    error.value = err instanceof Error ? err : new Error('未知错误')
    movies.value = []
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
    router.push({
      query: { ...route.query, page: newPage.toString() }
    })
    fetchMovies()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const jumpPage = ref('')
const handleJumpPage = () => {
  const pageNum = parseInt(jumpPage.value)
  if (pageNum && pageNum >= 1 && pageNum <= totalPages.value) {
    handlePageChange(pageNum)
    jumpPage.value = ''
  }
}

watch(
    () => route.params.category,
    () => {
      page.value = 1
      fetchMovies()
    }
)

onMounted(() => {
  const urlPage = parseInt(route.query.page as string)
  if (urlPage && urlPage !== page.value) {
    page.value = urlPage
  }
  fetchMovies()
})
</script>

<template>
  <div class="pt-20 px-4 md:px-6 lg:px-8">
    <PageErrorHandler
        :error="error"
        :loading="loading"
        @retry="fetchMovies"
    />

    <!-- Movie Grid -->
    <div v-if="!loading && !error" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <MovieCard
          v-for="movie in movies"
          :key="movie.movieId"
          :movie="movie"
      />
    </div>

    <!-- Pagination -->
    <div v-if="!loading && !error && movies.length > 0" class="mt-8 flex flex-wrap justify-center items-center gap-2 pb-8">
      <button
          @click="handlePageChange(1)"
          :disabled="page === 1"
          class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
          :class="page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
      >
        首页
      </button>

      <button
          @click="handlePageChange(page - 1)"
          :disabled="page === 1"
          class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
          :class="page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
      >
        上一页
      </button>

      <div class="flex flex-wrap gap-1">
        <template v-for="(p, index) in paginationArray" :key="index">
          <button
              v-if="p !== '...'"
              @click="handlePageChange(p)"
              class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
              :class="page === p ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
          >
            {{ p }}
          </button>
          <span v-else class="px-2 py-1 text-gray-500">{{ p }}</span>
        </template>
      </div>

      <button
          @click="handlePageChange(page + 1)"
          :disabled="page === totalPages"
          class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
          :class="page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
      >
        下一页
      </button>

      <button
          @click="handlePageChange(totalPages)"
          :disabled="page === totalPages"
          class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
          :class="page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'"
      >
        末页
      </button>

      <!-- 页码跳转输入框 -->
      <div class="flex items-center gap-2 ml-4">
        <span class="text-sm text-gray-500">跳转至</span>
        <input
            v-model="jumpPage"
            type="number"
            min="1"
            :max="totalPages"
            class="w-16 px-2 py-1 text-sm border rounded-md focus:outline-none focus:border-blue-500"
            @keyup.enter="handleJumpPage"
        />
        <span class="text-sm text-gray-500">页</span>
      </div>

      <span class="text-sm text-gray-500 ml-2">
        共 {{ totalPages }} 页
      </span>
    </div>
  </div>
</template>
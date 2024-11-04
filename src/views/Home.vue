<script setup lang="ts">
import MovieCard from '../components/MovieCard.vue'
import { ref, onMounted, computed } from 'vue'
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

const getAuthHeader = () => {
  const token = localStorage.getItem('authorization')
  return token ? { 'Authorization': token } : {}
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
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.value.toString()
    })
    
    const response = await axios.get(`/api/movie/list?${params}`,
        {
          headers: {
            ...getAuthHeader()
          }
        }
    )
    console.log('API Response:', response.data)
    
    if (response.data.code === 200) {
      const responseData = response.data.data as MovieResponse
      movies.value = responseData.list
      totalPages.value = responseData.pages
      pageSize.value = responseData.pageSize
      // 如果当前页超出总页数，自动跳转到最后一页
      if (page.value > totalPages.value) {
        page.value = totalPages.value
        await fetchMovies()
      }
    } else {
      console.error('获取电影数据失败:', response.data.message)
    }
  } catch (error) {
    console.error('请求出错:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
    // 更新 URL 查询参数
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

// 监听路由变化，确保从其他页面返回时能正确加载当前页
onMounted(() => {
  // 如果 URL 中有页码参数，使用该页码
  const urlPage = parseInt(route.query.page as string)
  if (urlPage && urlPage !== page.value) {
    page.value = urlPage
  }
  fetchMovies()
})

onMounted(() => {
  fetchMovies()
})
</script>

<template>
  <div class="pt-20 px-4 md:px-6 lg:px-8">
    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div v-for="i in pageSize" :key="i" class="animate-pulse">
        <div class="bg-gray-200 rounded-lg h-72"></div>
      </div>
    </div>

    <!-- Movie Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <MovieCard
        v-for="movie in movies"
        :key="movie.movieId"
        :movie="movie"
      />
    </div>

    <!-- Pagination -->
    <div class="mt-8 flex flex-wrap justify-center items-center gap-2 pb-8">
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
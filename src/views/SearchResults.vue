<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MovieCard from '../components/MovieCard.vue'
import { useThemeStore } from '../stores/theme'
import { apiService } from '../services/api'

interface Movie {
  movieId: number
  title: string
  posterUrl: string
  releaseYear: number
  rating: number
}

interface SearchResponse {
  code: number
  message: string
  data: {
    list: Movie[]
    total: number
    pages: number
    pageNum: number
    pageSize: number
  }
}

const route = useRoute()
const themeStore = useThemeStore()
const searchResults = ref<Movie[]>([])
const isLoading = ref(true)
const error = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const searchMovies = async (query: string, page: number = 1) => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await apiService.movies.getList({
      title: query,
      page,
      pageSize: pageSize.value
    })

    searchResults.value = response.data.list.map(movie => ({
      ...movie,
      rating: movie.rating || 0
    }))
    total.value = response.data.total
    currentPage.value = response.data.pageNum
  } catch (err) {
    console.error('Search error:', err)
    error.value = err instanceof Error
        ? `Failed to search movies: ${err.message}`
        : 'Network error - Please check your connection and try again'
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

const handlePageChange = (page: number) => {
  const query = route.query.q as string
  if (query) {
    currentPage.value = page
    searchMovies(query, page)
  }
}

watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    currentPage.value = 1
    searchMovies(newQuery as string)
  }
}, { immediate: true })
</script>

<!-- Template remains unchanged -->
<template>
  <div class="pt-20">
    <div class="container mx-auto px-4">
      <h1 class="text-2xl font-bold mb-6">
        关于"{{ route.query.q }}"的搜索结果：
      </h1>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-[300px]">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error"
           :class="[
          'text-center py-12 rounded-lg',
          themeStore.isDark ? 'bg-red-900/50' : 'bg-red-100'
        ]">
        <p :class="themeStore.isDark ? 'text-red-200' : 'text-red-600'">{{ error }}</p>
        <button
            @click="searchMovies(route.query.q as string, currentPage)"
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- No Results -->
      <div v-else-if="searchResults.length === 0"
           :class="[
          'text-center py-12 rounded-lg',
          themeStore.isDark ? 'bg-gray-800' : 'bg-gray-100'
        ]">
        <p class="text-xl">No movies found matching your search.</p>
        <p class="mt-2" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
          Try different keywords or check the spelling.
        </p>
      </div>

      <!-- Results Grid -->
      <div v-else>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <MovieCard v-for="movie in searchResults"
                     :key="movie.movieId"
                     :movie="movie" />
        </div>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="flex justify-center space-x-2 mt-6">
          <button
              v-for="page in Math.ceil(total / pageSize)"
              :key="page"
              @click="handlePageChange(page)"
              :class="[
              'px-4 py-2 rounded-lg transition-colors',
              page === currentPage
                ? 'bg-blue-500 text-white'
                : themeStore.isDark
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
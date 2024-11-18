<script setup lang="ts">
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

defineProps<{
  movie: {
    movieId: number
    title: string
    posterUrl: string
    releaseYear: number
    rating: number
  }
}>()

const openMovieDetails = (movieId: number) => {
  window.open(`/movie/${movieId}`, '_blank')
}
</script>

<template>
  <div
      @click="openMovieDetails(movie.movieId)"
      class="block relative rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-md hover:shadow-xl group cursor-pointer"
      :class="themeStore.isDark ? 'shadow-gray-900/50' : 'shadow-gray-350'"
  >
    <!-- Movie Poster -->
    <div
        class="aspect-[2/3.3] relative "
        :class="themeStore.isDark ? 'bg-gray-800' : 'bg-gray-200'"
    >
      <img
          :src="movie.posterUrl"
          :alt="movie.title"
          class="w-full h-full object-cover"
          @error="$event.target.src = 'https://placehold.co/400x600/1f2937/ffffff?text=Movie+Poster'"
      />

      <!-- Default Title (Visible when not hovering) -->
      <div class="absolute bottom-0 w-full group-hover:opacity-0 transition-opacity duration-300 -translate-y-0">
        <div
            class="h-16"
            :class="themeStore.isDark ? 'bg-gray-800' : 'bg-white'"
        >
          <div class="h-full flex items-center">
            <h3
                class="px-4 text-lg font-bold line-clamp-2 text-left overflow-hidden"
                :class="themeStore.isDark ? 'text-white' : 'text-gray-900'"
                style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;"
            >
              {{ movie.title }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Hover Overlay -->
      <div
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"
          :class="themeStore.isDark ? 'bg-gray-900/90' : 'bg-black/85'"
      >
        <div class="p-5 h-full flex flex-col justify-end text-white space-y-6">
          <!-- 电影信息 -->
          <div>
            <h3
                class="text-lg font-bold leading-tight mb-2 overflow-hidden"
                style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4;"
            >
              {{ movie.title }}
            </h3>

            <div class="flex items-center space-x-3 text-sm">
              <div class="flex items-center space-x-1">
                <span class="text-yellow-400">⭐</span>
                <span class="font-medium">{{ movie.rating }}/10</span>
              </div>
              <div class="text-gray-300 font-medium">
                {{ movie.releaseYear }}
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <button class="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 backdrop-blur-sm">
            查看详情
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
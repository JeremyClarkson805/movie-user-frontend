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
</script>

<template>
  <router-link 
    :to="'/movie/' + movie.movieId"
    class="group relative rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105"
  >
    <div 
      class="aspect-[2/3]" 
      :class="themeStore.isDark ? 'bg-gray-800' : 'bg-gray-200'"
    >
      <img 
        :src="movie.posterUrl" 
        :alt="movie.title"
        class="w-full h-full object-cover"
        @error="$event.target.src = 'https://placehold.co/400x600/1f2937/ffffff?text=Movie+Poster'" 
      />
      
      <div 
        :class="[
          'absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100',
          themeStore.isDark
            ? 'bg-gradient-to-t from-black/90 via-black/50 to-transparent'
            : 'bg-gradient-to-t from-black/95 via-black/60 to-transparent'
        ]"
      >
        <div class="absolute bottom-0 p-4 w-full text-white">
          <h3 class="text-lg font-bold leading-tight line-clamp-2 mb-1">
            {{ movie.title }}
          </h3>
          <div class="flex items-center mt-2 space-x-2 text-sm">
            <span>{{ movie.releaseYear }}</span>
            <span class="w-1 h-1 bg-white rounded-full"></span>
            <span class="flex items-center">
              <span class="text-yellow-400 mr-1">⭐</span>
              {{ movie.rating }}/10
            </span>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>
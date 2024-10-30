<script setup lang="ts">
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

const user = {
  username: 'MovieFan123',
  avatar: 'https://placehold.co/200x200/1f2937/ffffff?text=Avatar',
  joinDate: '2023-01-15',
  watchlist: 42,
  reviews: 15
}
</script>

<template>
  <div class="pt-20">
    <div :class="[
      'max-w-2xl mx-auto rounded-lg p-8 transition-colors duration-200',
      themeStore.isDark ? 'bg-gray-800' : 'bg-white shadow-lg'
    ]">
      <div class="flex items-center space-x-6">
        <img :src="user.avatar" :alt="user.username" 
          class="w-24 h-24 rounded-full shadow-lg" />
        
        <div>
          <h1 class="text-2xl font-bold">{{ user.username }}</h1>
          <p :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
            Member since {{ new Date(user.joinDate).toLocaleDateString() }}
          </p>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-8">
        <div :class="[
          'p-4 rounded-lg text-center transition-colors duration-200',
          themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
        ]">
          <div class="text-2xl font-bold">{{ user.watchlist }}</div>
          <div :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
            Watchlist
          </div>
        </div>
        
        <div :class="[
          'p-4 rounded-lg text-center transition-colors duration-200',
          themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
        ]">
          <div class="text-2xl font-bold">{{ user.reviews }}</div>
          <div :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
            Reviews
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
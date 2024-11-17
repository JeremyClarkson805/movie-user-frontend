<!--
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
</template>-->




<!--   第二代 -->
<!--<script setup lang="ts">
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
      class="block relative rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
  >
    &lt;!&ndash; Movie Poster &ndash;&gt;
    <div
        class="aspect-[2/3] relative"
        :class="themeStore.isDark ? 'bg-gray-800' : 'bg-gray-200'"
    >
      <img
          :src="movie.posterUrl"
          :alt="movie.title"
          class="w-full h-full object-cover"
          @error="$event.target.src = 'https://placehold.co/400x600/1f2937/ffffff?text=Movie+Poster'"
      />

      &lt;!&ndash; Default Title (Always Visible) &ndash;&gt;
      <div class="absolute bottom-0 w-full">
        &lt;!&ndash; White background &ndash;&gt;
        <div class="bg-white dark:bg-gray-800 h-[62px]"></div>
        &lt;!&ndash; Title text &ndash;&gt;
        <div class="absolute bottom-0 w-full p-3">
          <h3 class="text-gray-900 dark:text-white text-base font-semibold line-clamp-2">
            {{ movie.title }}
          </h3>
        </div>
      </div>

      &lt;!&ndash; Hover Overlay &ndash;&gt;
      <div
          class="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          :class="themeStore.isDark
          ? 'bg-gray-900/90'
          : 'bg-black/85'"
      >
        <div class="p-4 h-full flex flex-col justify-end text-white">
          <h3 class="text-lg font-bold leading-tight mb-4">
            {{ movie.title }}
          </h3>

          <div class="space-y-2">
            <div class="flex items-center space-x-1">
              <span class="text-yellow-400">⭐</span>
              <span class="text-sm">{{ movie.rating }}/10</span>
            </div>
            <div class="text-sm text-gray-300">
              {{ movie.releaseYear }}
            </div>
            <button class="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-md text-sm transition-colors">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>-->

<!--第三版-->
<!--<script setup lang="ts">
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
      class="block relative rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
  >
    &lt;!&ndash; Movie Poster &ndash;&gt;
    <div
        class="aspect-[2/3.3] relative"
        :class="themeStore.isDark ? 'bg-gray-800' : 'bg-gray-200'"
    >
      <img
          :src="movie.posterUrl"
          :alt="movie.title"
          class="w-full h-full object-cover"
          @error="$event.target.src = 'https://placehold.co/400x600/1f2937/ffffff?text=Movie+Poster'"
      />

      &lt;!&ndash; Default Title (Visible when not hovering) &ndash;&gt;
      <div class="absolute bottom-0 w-full group-hover:opacity-0 transition-opacity duration-300">
        <div
            class="h-24"
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

      &lt;!&ndash; Hover Overlay &ndash;&gt;
      <div
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"
          :class="themeStore.isDark ? 'bg-gray-900/90' : 'bg-black/85'"
      >
        <div class="p-6 h-full flex flex-col justify-end text-white">
          <h3
              class="text-2xl font-bold leading-tight mb-6 transition-transform duration-300 ease-out overflow-hidden"
              style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;"
          >
            {{ movie.title }}
          </h3>

          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <span class="text-yellow-400">⭐</span>
              <span class="text-base font-medium">{{ movie.rating }}/10</span>
            </div>
            <div class="text-base text-gray-300 font-medium">
              {{ movie.releaseYear }}
            </div>
            <button class="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-md text-base font-medium transition-colors duration-300 backdrop-blur-sm">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>-->



<!--第四版-->
<!--
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
      class="block relative rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
  >
    &lt;!&ndash; Movie Poster &ndash;&gt;
    <div
        class="aspect-[2/3.3] relative"
        :class="themeStore.isDark ? 'bg-gray-800' : 'bg-gray-200'"
    >
      <img
          :src="movie.posterUrl"
          :alt="movie.title"
          class="w-full h-full object-cover"
          @error="$event.target.src = 'https://placehold.co/400x600/1f2937/ffffff?text=Movie+Poster'"
      />

      &lt;!&ndash; Default Title (Visible when not hovering) &ndash;&gt;
      <div class="absolute bottom-0 w-full group-hover:opacity-0 transition-opacity duration-300">
        <div
            class="h-24"
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

      &lt;!&ndash; Hover Overlay &ndash;&gt;
      <div
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"
          :class="themeStore.isDark ? 'bg-gray-900/90' : 'bg-black/85'"
      >
        <div class="p-5 h-full flex flex-col text-white">
          &lt;!&ndash; 标题和基本信息 &ndash;&gt;
          <div class="mb-2">
            <h3
                class="text-lg font-bold leading-tight mb-2 overflow-hidden"
                style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;"
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

          &lt;!&ndash; 底部按钮 &ndash;&gt;
          <button class="w-full mt-auto bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 backdrop-blur-sm">
            查看详情
          </button>
        </div>
      </div>
    </div>
  </router-link>
</template>-->






<!--
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
      class="block relative rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
  >
    &lt;!&ndash; Movie Poster &ndash;&gt;
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

      &lt;!&ndash;
        Default Title (Visible when not hovering)
        1. h-16 控制白色区域的高度，可以通过调整这个值来改变高度
        2. -translate-y-4 控制白色区域往上移动的距离，数值越大移动越多
        3. 如果想要遮住更多海报，可以增加 -translate-y-4 的数值
      &ndash;&gt;
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

      &lt;!&ndash;
        Hover Overlay
        1. justify-end 使内容靠底部对齐
        2. space-y-4 控制电影信息和按钮之间的间距
        3. 如果需要调整整体位置，可以修改 p-5 的内边距值
      &ndash;&gt;
      <div
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"
          :class="themeStore.isDark ? 'bg-gray-900/90' : 'bg-black/85'"
      >
        <div class="p-5 h-full flex flex-col justify-end text-white space-y-6">
          &lt;!&ndash; 电影信息 &ndash;&gt;
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

          &lt;!&ndash; 底部按钮 &ndash;&gt;
          <button class="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 backdrop-blur-sm">
            查看详情
          </button>
        </div>
      </div>
    </div>
  </router-link>
</template>-->



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
      class="block relative rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-md hover:shadow-xl group"
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
  </router-link>
</template>
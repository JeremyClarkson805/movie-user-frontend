<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['show-login', 'show-register'])

const categories = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror']
const searchQuery = ref('')
const showUserMenu = ref(false)
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const handleSearch = () => {
  router.push(`/search?q=${searchQuery.value}`)
}

const handleClickOutside = (event: MouseEvent) => {
  const userMenu = document.getElementById('user-menu')
  const userButton = document.getElementById('user-button')

  if (userMenu && userButton &&
      !userMenu.contains(event.target as Node) &&
      !userButton.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <nav :class="[
    'fixed w-full top-0 z-40 transition-colors duration-200',
    themeStore.isDark ? 'bg-gray-800' : 'bg-white shadow-md'
  ]">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-8">
          <router-link to="/" class="text-xl font-bold">MovieHub</router-link>
          <div class="hidden md:flex space-x-4">
            <router-link v-for="category in categories"
                         :key="category"
                         :to="'/category/' + category.toLowerCase()"
                         :class="[
                'transition-colors',
                themeStore.isDark ? 'hover:text-gray-300' : 'hover:text-gray-600'
              ]">
              {{ category }}
            </router-link>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <button
              @click="themeStore.toggleTheme"
              class="p-2 rounded-lg"
              :class="themeStore.isDark ? 'bg-gray-700' : 'bg-gray-200'"
          >
            <span v-if="themeStore.isDark">🌞</span>
            <span v-else>🌙</span>
          </button>

          <div class="relative">
            <input
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                type="text"
                placeholder="搜索关键词..."
                :class="[
                'px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
              ]"
            />
          </div>

          <div class="relative">
            <button
                id="user-button"
                @click="showUserMenu = !showUserMenu"
                :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                themeStore.isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              ]"
            >
              <span class="text-xl">👤</span>
            </button>

            <div v-if="showUserMenu"
                 id="user-menu"
                 :class="[
                'absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2',
                themeStore.isDark ? 'bg-gray-800' : 'bg-white'
              ]">
              <!-- Guest Menu -->
              <template v-if="!authStore.isAuthenticated">
                <button
                    @click="emit('show-register')"
                    :class="[
                    'block w-full text-left px-4 py-2',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">Register</button>
                <button
                    @click="emit('show-login')"
                    :class="[
                    'block w-full text-left px-4 py-2',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">Login</button>
              </template>

              <!-- Authenticated User Menu -->
              <template v-else>
                <router-link to="/profile"
                             :class="[
                    'block px-4 py-2',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">Profile</router-link>
                <router-link to="/settings"
                             :class="[
                    'block px-4 py-2',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">Settings</router-link>
                <button
                    @click="authStore.logout"
                    :class="[
                    'block w-full text-left px-4 py-2',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">
                  Logout
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
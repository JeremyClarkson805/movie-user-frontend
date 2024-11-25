<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['show-login', 'show-register'])

const categories = [
  { name: '首页', nameEn: 'home', isHome: true },
  { name: '动作', nameEn: 'Action' },
  { name: '犯罪', nameEn: 'Crime' },
  { name: '喜剧', nameEn: 'Comedy' },
  { name: '科幻', nameEn: 'Sci-Fi' },
  { name: '恐怖', nameEn: 'Horror' },
  { name: '爱情', nameEn: 'Romantic' },
  { name: '动画', nameEn: 'Cartoon' }
]

const searchQuery = ref('')
const showUserMenu = ref(false)
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const isNavVisible = ref(true)
const lastScrollPosition = ref(0)

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

const handleScroll = () => {
  const currentScrollPosition = window.scrollY
  const scrollDelta = currentScrollPosition - lastScrollPosition.value

  if (Math.abs(scrollDelta) < 50) {
    return
  }

  isNavVisible.value = scrollDelta < 0 || currentScrollPosition < 50
  lastScrollPosition.value = currentScrollPosition
}

const handleCategoryClick = (category: { nameEn: string, isHome?: boolean }) => {
  if (category.isHome) {
    router.push('/')
  } else {
    router.push(`/category/${category.nameEn}`)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav :class="[
    'fixed w-full top-0 z-40 transition-all duration-300',
    themeStore.isDark ? 'bg-gray-800' : 'bg-white shadow-md',
    isNavVisible ? 'translate-y-0' : '-translate-y-full'
  ]">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-8">
          <router-link to="/" class="text-xl font-bold whitespace-nowrap">MovieHub</router-link>
          <div class="hidden md:flex space-x-4 overflow-x-auto no-scrollbar">
            <button
                v-for="category in categories"
                :key="category.nameEn"
                @click="handleCategoryClick(category)"
                :class="[
                'transition-colors px-3 py-1 rounded-md font-medium text-sm whitespace-nowrap',
                (category.isHome ? route.path === '/' : route.params.category === category.nameEn)
                  ? (themeStore.isDark ? 'bg-gray-700 text-white font-semibold' : 'bg-gray-200 text-gray-900 font-semibold')
                  : (themeStore.isDark ? 'hover:text-gray-300' : 'hover:text-gray-600')
              ]"
            >
              {{ category.name }}
            </button>
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
                placeholder="搜索电影..."
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
                  ]">注册</button>
                <button
                    @click="emit('show-login')"
                    :class="[
                    'block w-full text-left px-4 py-2',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">登录</button>
                <router-link
                    to="/membership"
                    :class="[
                    'block w-full text-left px-4 py-2',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">会员服务</router-link>
              </template>

              <!-- Authenticated User Menu -->
              <template v-else>
                <router-link to="/profile"
                             :class="[
                    'block px-4 py-2',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">个人档案</router-link>
                <router-link to="/membership"
                             :class="[
                    'block px-4 py-2',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">会员服务</router-link>
                <button
                    @click="authStore.logout"
                    :class="[
                    'block w-full text-left px-4 py-2',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">
                  退出登录
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
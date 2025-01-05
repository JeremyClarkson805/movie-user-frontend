<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { useModalStore } from '../stores/modalStore'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const modalStore = useModalStore()

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
const showMobileMenu = ref(false)
const isNavVisible = ref(true)
const lastScrollPosition = ref(0)

const handleSearch = () => {
  router.push(`/search?q=${searchQuery.value}`)
  // 搜索后收起移动端菜单
  showMobileMenu.value = false
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
  showMobileMenu.value = false
}

// 处理用户菜单的点击事件
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 处理点击其他区域关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  const userMenu = document.getElementById('user-menu')
  const userButton = document.getElementById('user-menu-button')

  if (userMenu && userButton &&
      !userMenu.contains(event.target as Node) &&
      !userButton.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

const handleShowLogin = () => {
  modalStore.openLogin()
}

const handleShowRegister = () => {
  modalStore.openRegister()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
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
        <!-- Logo and Categories -->
        <div class="flex items-center space-x-8">
          <router-link to="/" class="text-xl font-bold whitespace-nowrap">MovieHub</router-link>

          <!-- Desktop Categories -->
          <div class="hidden lg:flex space-x-4 overflow-x-auto no-scrollbar">
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

        <!-- Right Side Actions -->
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button
              @click="themeStore.toggleTheme"
              class="p-2 rounded-lg"
              :class="themeStore.isDark ? 'bg-gray-700' : 'bg-gray-200'"
          >
            <span v-if="themeStore.isDark">🌞</span>
            <span v-else>🌙</span>
          </button>

          <!-- Search Bar -->
          <div class="relative hidden sm:block">
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

          <!-- Mobile Menu Button -->
          <button
              @click="showMobileMenu = !showMobileMenu"
              class="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          <!-- User Menu -->
          <div class="relative">
            <button
                id="user-menu-button"
                @click="toggleUserMenu"
                class="w-10 h-10 rounded-full flex items-center justify-center transition-colors overflow-hidden"
                :class="themeStore.isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'"
            >
              <img
                  v-if="authStore.userInfo?.avatarUrl"
                  :src="authStore.userInfo.avatarUrl"
                  :alt="authStore.userInfo?.username"
                  class="w-full h-full object-cover"
              />
              <span v-else class="text-xl">👤</span>
            </button>

            <!-- Dropdown Menu -->
            <div
                id="user-menu"
                v-show="showUserMenu"
                class="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 transition-all duration-200 origin-top-right"
                :class="themeStore.isDark ? 'bg-gray-800' : 'bg-white'"
            >
              <!-- Guest Menu -->
              <template v-if="!authStore.isAuthenticated">
                <button
                    @click="handleShowRegister"
                    :class="[
        'block w-full text-left px-4 py-2 transition-colors',
        themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
      ]"
                >
                  注册
                </button>
                <button
                    @click="handleShowLogin"
                    :class="[
        'block w-full text-left px-4 py-2 transition-colors',
        themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
      ]"
                >
                  登录
                </button>
                <router-link
                    to="/membership"
                    :class="[
                    'block w-full text-left px-4 py-2 transition-colors',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">会员服务</router-link>
              </template>

              <!-- Authenticated User Menu -->
              <template v-else>
                <router-link to="/profile"
                             :class="[
                    'block px-4 py-2 transition-colors',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">个人档案</router-link>
                <router-link to="/membership"
                             :class="[
                    'block px-4 py-2 transition-colors',
                    themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  ]">会员服务</router-link>
                <button
                    @click="authStore.logout"
                    :class="[
                    'block w-full text-left px-4 py-2 transition-colors',
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

    <!-- Mobile Menu -->
    <div
        v-show="showMobileMenu"
        class="lg:hidden"
        :class="themeStore.isDark ? 'bg-gray-800' : 'bg-white'"
    >
      <!-- Mobile Search -->
      <div class="px-4 py-3">
        <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索电影..."
            class="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'"
        />
      </div>

      <!-- Mobile Categories -->
      <div class="px-4 py-2 space-y-2">
        <button
            v-for="category in categories"
            :key="category.nameEn"
            @click="handleCategoryClick(category)"
            class="block w-full text-left px-4 py-2 rounded-lg transition-colors"
            :class="[
              (category.isHome ? route.path === '/' : route.params.category === category.nameEn)
                ? (themeStore.isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900')
                : (themeStore.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
            ]"
        >
          {{ category.name }}
        </button>
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
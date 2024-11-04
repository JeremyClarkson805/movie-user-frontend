<template>
  <div :class="[
    'min-h-screen transition-colors duration-200',
    themeStore.isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
  ]">
    <Navbar @show-login="handleShowLogin" @show-register="handleShowRegister" />
    <main class="container mx-auto px-4 py-8">
      <router-view></router-view>
    </main>

    <Login v-if="showLogin" @close="handleCloseLogin" @show-register="handleShowRegister" />
    <Register v-if="showRegister" @close="handleCloseRegister" @show-login="handleShowLogin" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import { useThemeStore } from './stores/theme'
import { useGuestStore } from "./stores/guest"

const themeStore = useThemeStore()
const guestStore = useGuestStore()
const showLogin = ref(false)
const showRegister = ref(false)

onMounted(async () => {
  if (themeStore.isDark) {
    document.documentElement.classList.add('dark')
  }

  // 检查本地存储中是否存在Authorization token
  const localAuth = localStorage.getItem('userToken')

  // 只在没有Authorization token时初始化游客功能
  if (!localAuth) {
    await guestStore.initializeGuest()
  }
})

const handleShowLogin = () => {
  showLogin.value = true
  showRegister.value = false
}

const handleCloseLogin = () => {
  showLogin.value = false
}

const handleShowRegister = () => {
  showRegister.value = true
  showLogin.value = false
}

const handleCloseRegister = () => {
  showRegister.value = false
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
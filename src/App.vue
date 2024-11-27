<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import GlobalLoading from './components/GlobalLoading.vue'
import ErrorNotification from './components/ErrorNotification.vue'
import { useThemeStore } from './stores/theme'
import { useAppStore } from './stores/app'

const themeStore = useThemeStore()
const appStore = useAppStore()
const showLogin = ref(false)
const showRegister = ref(false)

onMounted(async () => {
  if (themeStore.isDark) {
    document.documentElement.classList.add('dark')
  }

  // Initialize the app
  await appStore.initialize()
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

<template>
  <!-- Global Loading -->
  <GlobalLoading v-if="appStore.isInitializing" />

  <!-- Main App Content -->
  <div v-else :class="[
    'min-h-screen transition-colors duration-200',
    themeStore.isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
  ]">
    <Navbar @show-login="handleShowLogin" @show-register="handleShowRegister" />
    <main class="container mx-auto px-4 py-8">
      <router-view v-if="appStore.isReady"></router-view>

      <!-- Error State -->
      <div v-else-if="appStore.error"
           class="flex items-center justify-center min-h-[60vh]">
        <ErrorNotification
            :error="appStore.error"
            :status-code="appStore.errorCode"
            :on-retry="appStore.initialize"
        />
      </div>
    </main>

    <Login v-if="showLogin" @close="handleCloseLogin" @show-register="handleShowRegister" />
    <Register v-if="showRegister" @close="handleCloseRegister" @show-login="handleShowLogin" />
  </div>
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
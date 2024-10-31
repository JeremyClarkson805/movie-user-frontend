<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import { useThemeStore } from './stores/theme'
import { ref } from 'vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import { onMounted } from 'vue'

const themeStore = useThemeStore()
const showLogin = ref(false)
const showRegister = ref(false)

onMounted(() => {
  if (themeStore.isDark) {
    document.documentElement.classList.add('dark')
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
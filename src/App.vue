<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import GlobalLoading from './components/GlobalLoading.vue'
import GlobalErrorModal from './components/GlobalErrorModal.vue'
import { useThemeStore } from './stores/theme'
import { useAppStore } from './stores/app'

const themeStore = useThemeStore()
const appStore = useAppStore()
const showLogin = ref(false)
const showRegister = ref(false)
const showErrorModal = ref(false)

onMounted(async () => {
  // 初始化主题
  themeStore.initializeTheme()

  try {
    // 初始化应用
    await appStore.initialize()
  } catch (err) {
    showErrorModal.value = true
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

const handleRetryInitialization = async () => {
  try {
    await appStore.initialize()
    showErrorModal.value = false
  } catch (err) {
    // 如果重试失败，保持错误模态框显示
    console.error('Retry initialization failed:', err)
  }
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
    </main>

    <Login v-if="showLogin" @close="handleCloseLogin" @show-register="handleShowRegister" />
    <Register v-if="showRegister" @close="handleCloseRegister" @show-login="handleShowLogin" />

    <!-- Global Error Modal -->
    <GlobalErrorModal
        :show="showErrorModal || (!!appStore.error && !appStore.isReady)"
        :title="appStore.errorCode ? `错误 ${appStore.errorCode}` : '发生错误'"
        :message="appStore.error || '无法连接到服务器'"
        :status-code="appStore.errorCode"
        :on-retry="handleRetryInitialization"
        @close="showErrorModal = false"
    />
  </div>
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
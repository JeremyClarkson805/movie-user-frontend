<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import ForgotPasswordModal from './components/auth/ForgotPasswordModal.vue'
import GlobalLoading from './components/GlobalLoading.vue'
import GlobalErrorModal from './components/GlobalErrorModal.vue'
import { useThemeStore } from './stores/theme'
import { useAppStore } from './stores/app'
import { useModalStore } from './stores/modalStore'

const themeStore = useThemeStore()
const appStore = useAppStore()
const modalStore = useModalStore()
const showErrorModal = ref(false)

onMounted(async () => {
  themeStore.initializeTheme()

  try {
    await appStore.initialize()
  } catch (err) {
    showErrorModal.value = true
  }
})

const handleRetryInitialization = async () => {
  try {
    await appStore.initialize()
    showErrorModal.value = false
  } catch (err) {
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
    <Navbar />
    <main class="container mx-auto px-4 py-8">
      <router-view v-if="appStore.isReady"></router-view>
    </main>

    <!-- Auth Modals -->
    <Login
        v-if="modalStore.activeModal === 'login'"
        @close="modalStore.closeModal"
    />
    <Register
        v-if="modalStore.activeModal === 'register'"
        @close="modalStore.closeModal"
    />
    <ForgotPasswordModal
        v-if="modalStore.activeModal === 'resetPassword'"
        @close="modalStore.closeModal"
    />

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
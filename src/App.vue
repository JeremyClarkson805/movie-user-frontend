<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import { useThemeStore } from './stores/theme'
import { onMounted, watch } from 'vue'

const themeStore = useThemeStore()

// 处理主题变化的函数
const handleThemeChange = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 监听主题变化
watch(
  () => themeStore.isDark,
  (newValue) => handleThemeChange(newValue)
)

// 组件挂载时初始化主题
onMounted(() => {
  handleThemeChange(themeStore.isDark)
})
</script>

<template>
  <div
    :class="[
      'min-h-screen transition-colors duration-200',
      themeStore.isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    ]"
  >
    <Navbar />
    
    <!-- 主要内容区域 -->
    <main class="container mx-auto px-4 py-8">
      <router-view></router-view>
    </main>

    <!-- 模态框视图 - 放在主内容区域之外 -->
    <router-view 
      name="modal" 
      v-slot="{ Component }"
    >
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="transform opacity-0"
      >
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
/* 确保模态框可以正确地覆盖在内容上面 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
}
</style>
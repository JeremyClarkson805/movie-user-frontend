<script setup lang="ts">
import { onMounted } from 'vue'
import { useModalStore } from '@/stores/modalStore'

const modalStore = useModalStore()
const props = defineProps<{
  onClose: () => void
}>()

onMounted(() => {
  setTimeout(() => {
    props.onClose()
    modalStore.openLogin()
  }, 2000)
})
</script>

<template>
  <div class="text-center py-8">
    <div class="text-green-500 text-6xl mb-4">✓</div>
    <h3 class="text-xl font-semibold mb-2">密码重置成功</h3>
    <p class="text-gray-500">请使用新密码登录</p>
  </div>
</template>
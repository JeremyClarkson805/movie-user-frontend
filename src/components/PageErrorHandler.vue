<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import GlobalErrorModal from './GlobalErrorModal.vue'
import { handleApiError, type ApiError } from '../utils/error-handler'

const props = defineProps<{
  error: Error | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const showErrorModal = ref(false)
const errorDetails = ref<ApiError>({
  message: '',
  statusCode: undefined
})

watch(() => props.error, (newError) => {
  if (newError) {
    errorDetails.value = handleApiError(newError)
    showErrorModal.value = true
  } else {
    showErrorModal.value = false
  }
})

const handleRetry = () => {
  showErrorModal.value = false
  emit('retry')
}
</script>

<template>
  <div v-if="loading" class="min-h-[60vh] flex items-center justify-center">
    <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
  </div>

  <GlobalErrorModal
      :show="showErrorModal"
      :title="errorDetails.statusCode ? `错误 ${errorDetails.statusCode}` : '发生错误'"
      :message="errorDetails.message"
      :status-code="errorDetails.statusCode"
      :on-retry="handleRetry"
      @close="showErrorModal = false"
  />
</template>
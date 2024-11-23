<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/vue/24/outline'

defineProps<{
  show: boolean
  type: 'success' | 'warning' | 'error'
  message: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="$emit('close')" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="mx-auto w-full max-w-lg bg-white rounded-xl shadow-xl">
            <div class="p-8">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div :class="[
                    'rounded-full p-3',
                    {
                      'bg-green-100': type === 'success',
                      'bg-yellow-100': type === 'warning',
                      'bg-red-100': type === 'error'
                    }
                  ]">
                    <CheckCircleIcon v-if="type === 'success'" 
                                   class="h-8 w-8 text-green-600" 
                                   aria-hidden="true" />
                    <ExclamationTriangleIcon v-else-if="type === 'warning'" 
                                           class="h-8 w-8 text-yellow-600" 
                                           aria-hidden="true" />
                    <XCircleIcon v-else
                                class="h-8 w-8 text-red-600" 
                                aria-hidden="true" />
                  </div>
                </div>
                <div class="ml-4 flex-1">
                  <DialogTitle as="h3" :class="[
                    'text-xl font-semibold',
                    {
                      'text-green-600': type === 'success',
                      'text-yellow-600': type === 'warning',
                      'text-red-600': type === 'error'
                    }
                  ]">
                    {{ type === 'success' ? '签到成功' : 
                       type === 'warning' ? '温馨提示' : '签到失败' }}
                  </DialogTitle>
                  <div class="mt-3">
                    <p class="text-gray-600 text-base leading-relaxed">
                      {{ message }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-lg px-6 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  @click="$emit('close')"
                >
                  关闭
                </button>
                <button
                  type="button"
                  :class="[
                    'inline-flex justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
                    {
                      'bg-green-600 hover:bg-green-700 focus:ring-green-500': type === 'success',
                      'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500': type === 'warning',
                      'bg-red-600 hover:bg-red-700 focus:ring-red-500': type === 'error'
                    }
                  ]"
                  @click="$emit('close')"
                >
                  知道了
                </button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template> 
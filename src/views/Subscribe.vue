<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()

const planDetails = {
  monthly: {
    name: '月度会员',
    price: '29.99',
    duration: '每月'
  },
  yearly: {
    name: '年度会员',
    price: '299.99',
    duration: '每年'
  },
  lifetime: {
    name: '终身会员',
    price: '1999.99',
    duration: '一次性付费'
  }
}

const selectedPlan = ref(planDetails[route.params.plan as keyof typeof planDetails])
const paymentMethod = ref('alipay')
const isProcessing = ref(false)
const error = ref('')

const handlePayment = async () => {
  if (!selectedPlan.value) {
    error.value = '请选择会员计划'
    return
  }

  try {
    isProcessing.value = true
    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 这里应该调用实际的支付API
    console.log('Processing payment for:', selectedPlan.value.name)

    // 支付成功后跳转
    router.push('/profile')
  } catch (err) {
    error.value = '支付处理失败，请重试'
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  if (!selectedPlan.value) {
    router.push('/membership')
  }
})
</script>

<template>
  <div class="pt-20 px-4 pb-16">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold mb-4">完成订购</h1>
        <p :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">
          请选择支付方式完成订购
        </p>
      </div>

      <!-- Main Content -->
      <div :class="[
        'rounded-2xl overflow-hidden',
        themeStore.isDark ? 'bg-gray-800' : 'bg-white',
        'shadow-xl'
      ]">
        <!-- Order Summary -->
        <div class="p-8 border-b" :class="themeStore.isDark ? 'border-gray-700' : 'border-gray-200'">
          <h2 class="text-xl font-semibold mb-6">订单摘要</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">会员类型</span>
              <span class="font-semibold">{{ selectedPlan?.name }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">付费周期</span>
              <span class="font-semibold">{{ selectedPlan?.duration }}</span>
            </div>
            <div class="flex justify-between items-center text-xl font-bold">
              <span>总计</span>
              <span>¥{{ selectedPlan?.price }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="p-8">
          <h2 class="text-xl font-semibold mb-6">选择支付方式</h2>
          <div class="space-y-4">
            <label :class="[
              'block p-4 rounded-lg cursor-pointer transition-colors',
              paymentMethod === 'alipay'
                ? (themeStore.isDark ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'bg-blue-50 ring-2 ring-blue-500')
                : (themeStore.isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100')
            ]">
              <div class="flex items-center">
                <input
                    type="radio"
                    name="payment"
                    value="alipay"
                    v-model="paymentMethod"
                    class="hidden"
                />
                <span class="text-2xl mr-3">💳</span>
                <div class="flex-1">
                  <div class="font-semibold">支付宝</div>
                  <div class="text-sm" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-500'">
                    使用支付宝安全支付
                  </div>
                </div>
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                     :class="paymentMethod === 'alipay' ? 'border-blue-500' : 'border-gray-300'">
                  <div v-if="paymentMethod === 'alipay'"
                       class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </label>

            <label :class="[
              'block p-4 rounded-lg cursor-pointer transition-colors',
              paymentMethod === 'wechat'
                ? (themeStore.isDark ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'bg-blue-50 ring-2 ring-blue-500')
                : (themeStore.isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100')
            ]">
              <div class="flex items-center">
                <input
                    type="radio"
                    name="payment"
                    value="wechat"
                    v-model="paymentMethod"
                    class="hidden"
                />
                <span class="text-2xl mr-3">📱</span>
                <div class="flex-1">
                  <div class="font-semibold">微信支付</div>
                  <div class="text-sm" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-500'">
                    使用微信扫码支付
                  </div>
                </div>
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                     :class="paymentMethod === 'wechat' ? 'border-blue-500' : 'border-gray-300'">
                  <div v-if="paymentMethod === 'wechat'"
                       class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mt-4 text-red-500 text-sm">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button
              @click="handlePayment"
              :disabled="isProcessing"
              class="w-full mt-8 py-4 px-6 rounded-lg text-white font-semibold transition-colors duration-200 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isProcessing">处理中...</span>
            <span v-else>确认支付</span>
          </button>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="mt-8 text-center">
        <div class="flex items-center justify-center space-x-2 text-sm"
             :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-500'">
          <span>🔒</span>
          <span>所有支付信息经过加密处理，确保您的支付安全</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const router = useRouter()

const plans = [
  {
    id: 'monthly',
    name: '月度会员',
    price: '4.99',
    duration: '每月',
    features: [
      '无限观看所有影片',
      '4K高清画质',
      '优先客服支持',
      '无广告观影体验',
      '支持多端同步观看'
    ],
    popular: false
  },
  {
    id: 'yearly',
    name: '年度会员',
    price: '49.99',
    duration: '每年',
    features: [
      '无限观看所有影片',
      '4K超清画质',
      '24/7专属客服支持',
      '无广告观影体验',
      '支持多端同步观看',
      '支持无限下载',
      '享受会员专属活动',
      '每月获得观影券'
    ],
    popular: true
  },
  {
    id: 'lifetime',
    name: '终身会员',
    price: '199.99',
    duration: '一次性付费',
    features: [
      '永久无限观看所有影片',
      '4K超清画质',
      '24/7 VIP专属客服',
      '无广告观影体验',
      '支持多端同步观看',
      '无限离线下载',
      'VIP专属活动优先参与',
      '每月双倍积分',
      '独家放映会邀请'
    ],
    popular: false
  }
]

const handleSubscribe = (planId: string) => {
  router.push(`/subscribe/${planId}`)
}
</script>

<template>
  <div class="pt-20 px-4 pb-16">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-16">
        <h1 class="text-4xl font-bold mb-4">选择您的会员计划</h1>
        <p class="text-xl" :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">
          解锁优质观影体验，尽享精彩影视世界
        </p>
      </div>

      <!-- Plans Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="plan in plans"
             :key="plan.id"
             :class="[
               'relative rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 flex flex-col',
               themeStore.isDark ? 'bg-gray-800' : 'bg-white',
               plan.popular ? 'ring-2 ring-blue-500 shadow-xl' : 'shadow-lg'
             ]"
        >
          <!-- Popular Badge -->
          <div v-if="plan.popular"
               class="absolute top-0 right-0 mt-4 mr-4">
            <span class="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-full">
              最受欢迎
            </span>
          </div>

          <!-- Plan Content -->
          <div class="p-8 flex-1 flex flex-col">
            <div>
              <h3 class="text-2xl font-bold mb-2">{{ plan.name }}</h3>
              <div class="flex items-baseline mb-8">
                <span class="text-4xl font-bold">¥{{ plan.price }}</span>
                <span class="ml-2 text-sm" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-500'">
                  {{ plan.duration }}
                </span>
              </div>
            </div>

            <!-- Features List -->
            <div class="flex-1">
              <ul class="space-y-4 mb-8">
                <li v-for="feature in plan.features"
                    :key="feature"
                    class="flex items-start">
                  <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span :class="themeStore.isDark ? 'text-gray-300' : 'text-gray-600'">
                    {{ feature }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- Subscribe Button -->
            <button @click="handleSubscribe(plan.id)"
                    :class="[
                      'w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors duration-200 mt-auto',
                      plan.popular
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : themeStore.isDark
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                    ]">
              立即订购
            </button>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mt-16 text-center">
        <h2 class="text-2xl font-bold mb-6">为什么选择我们的会员服务？</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="p-6 rounded-xl" :class="themeStore.isDark ? 'bg-gray-800' : 'bg-gray-50'">
            <div class="text-3xl mb-4">🎬</div>
            <h3 class="text-xl font-semibold mb-2">海量影片库</h3>
            <p :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
              数万部精选影片，持续更新，满足您的观影需求
            </p>
          </div>
          <div class="p-6 rounded-xl" :class="themeStore.isDark ? 'bg-gray-800' : 'bg-gray-50'">
            <div class="text-3xl mb-4">⚡️</div>
            <h3 class="text-xl font-semibold mb-2">极速观影体验</h3>
            <p :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
              全球CDN加速，超清画质，流畅不卡顿
            </p>
          </div>
          <div class="p-6 rounded-xl" :class="themeStore.isDark ? 'bg-gray-800' : 'bg-gray-50'">
            <div class="text-3xl mb-4">🎯</div>
            <h3 class="text-xl font-semibold mb-2">个性化推荐</h3>
            <p :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
              智能算法推荐，发现更多您喜爱的内容
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
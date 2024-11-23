<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'

const themeStore = useThemeStore()
const authStore = useAuthStore()

interface UserInfo {
  userId: string
  userName: string
  email: string
  balance: number
  status: number
  avatarUrl: string | null
  nickName: string | null
  gender: number | null
  birthday: string | null
  lastLoginTime: string
}

const userInfo = ref<UserInfo | null>(null)
const loading = ref(true)
const error = ref('')

const getMembershipStatus = (status: number) => {
  switch (status) {
    case 0:
      return { label: '管理员', color: 'text-red-500' }
    case 1:
      return { label: '普通用户', color: 'text-gray-500' }
    case 4:
      return { label: '游客', color: 'text-blue-500' }
    case 5:
      return { label: '会员', color: 'text-yellow-500' }
    default:
      return { label: '未知状态', color: 'text-gray-500' }
  }
}

const getGenderLabel = (gender: number | null) => {
  switch (gender) {
    case 0:
      return '未设置'
    case 1:
      return '男'
    case 2:
      return '女'
    default:
      return '未设置'
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '未设置'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchUserInfo = async () => {
  try {
    loading.value = true
    error.value = ''

    const token = localStorage.getItem('userToken')
    if (!token) {
      error.value = '请先登录'
      return
    }

    const userInfoStr = localStorage.getItem("userInfo")
    if (!userInfoStr) {
      error.value = '用户信息不存在'
      return
    }

    const userInfoObj = JSON.parse(userInfoStr)
    const userId = userInfoObj.userId

    const formData = new FormData()
    formData.append('userId', userId)

    const response = await fetch('/api/user/userinfo', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    userInfo.value = await response.json()
    
  } catch (err) {
    console.error('获取用户信息失败:', err)
    error.value = '获取用户信息失败，请检查网络连接'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div class="pt-20 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error"
           class="text-center py-8 rounded-lg"
           :class="themeStore.isDark ? 'bg-red-900/50' : 'bg-red-100'">
        <p :class="themeStore.isDark ? 'text-red-200' : 'text-red-600'">{{ error }}</p>
      </div>

      <!-- User Profile -->
      <div v-else-if="userInfo" :class="[
        'rounded-lg overflow-hidden shadow-lg',
        themeStore.isDark ? 'bg-gray-800' : 'bg-white'
      ]">
        <!-- Header Section -->
        <div :class="[
          'px-8 py-6 border-b',
          themeStore.isDark ? 'border-gray-700' : 'border-gray-200'
        ]">
          <div class="flex items-center space-x-6">
            <div class="relative">
              <img
                  :src="userInfo.avatarUrl || 'https://placehold.co/200x200/1f2937/ffffff?text=Avatar'"
                  :alt="userInfo.userName"
                  class="w-24 h-24 rounded-full object-cover border-4"
                  :class="themeStore.isDark ? 'border-gray-700' : 'border-white'"
              />
              <div :class="[
                'absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium',
                getMembershipStatus(userInfo.status).color,
                themeStore.isDark ? 'bg-gray-900' : 'bg-gray-100'
              ]">
                {{ getMembershipStatus(userInfo.status).label }}
              </div>
            </div>

            <div>
              <h1 class="text-2xl font-bold mb-1">{{ userInfo.userName }}</h1>
              <p :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                {{ userInfo.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Points/Balance -->
            <div :class="[
              'p-4 rounded-lg',
              themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
            ]">
              <div class="text-sm font-medium mb-1" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                积分余额
              </div>
              <div class="text-2xl font-bold">{{ userInfo.balance }}</div>
            </div>

            <!-- Gender -->
            <div :class="[
              'p-4 rounded-lg',
              themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
            ]">
              <div class="text-sm font-medium mb-1" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                性别
              </div>
              <div class="text-base font-medium">{{ getGenderLabel(userInfo.gender) }}</div>
            </div>

            <!-- Birthday -->
            <div :class="[
              'p-4 rounded-lg',
              themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
            ]">
              <div class="text-sm font-medium mb-1" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                生日
              </div>
              <div class="text-base font-medium">{{ formatDate(userInfo.birthday) }}</div>
            </div>

            <!-- Last Login -->
            <div :class="[
              'p-4 rounded-lg',
              themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
            ]">
              <div class="text-sm font-medium mb-1" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                最后登录时间
              </div>
              <div class="text-base font-medium">{{ formatDateTime(userInfo.lastLoginTime) }}</div>
            </div>

            <!-- Nickname -->
            <div :class="[
              'p-4 rounded-lg',
              themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
            ]">
              <div class="text-sm font-medium mb-1" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                昵称
              </div>
              <div class="text-base font-medium">{{ userInfo.nickName || '未设置' }}</div>
            </div>

            <!-- User ID -->
            <div :class="[
              'p-4 rounded-lg',
              themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
            ]">
              <div class="text-sm font-medium mb-1" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                用户 ID
              </div>
              <div class="text-sm font-medium truncate">{{ userInfo.userId }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
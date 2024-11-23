<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'

const themeStore = useThemeStore()
const authStore = useAuthStore()

interface UserInfo {
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
const showEditModal = ref(false)
const isCheckinLoading = ref(false)
const checkinSuccess = ref(false)

const editForm = ref({
  nickName: '',
  gender: null as number | null,
  birthday: null as string | null,
  avatarUrl: ''
})

const getMembershipStatus = (status: number) => {
  switch (status) {
    case 0:
      return { label: '会员', color: 'text-yellow-500' }
    case 1:
      return { label: '普通用户', color: 'text-gray-500' }
    case 4:
      return { label: '游客', color: 'text-blue-500' }
    case 5:
      return { label: '会员', color: 'text-yellow-500' }
    default:
      return { label: '普通用户', color: 'text-gray-500' }
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

    const response = await fetch('/api/user/personProfile', {
      method: 'POST',
      headers: {
        'Authorization': token
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.code === 200) {
      userInfo.value = data.data
      // 初始化编辑表单
      editForm.value = {
        nickName: userInfo.value.nickName || '',
        gender: userInfo.value.gender,
        birthday: userInfo.value.birthday,
        avatarUrl: userInfo.value.avatarUrl || ''
      }
    } else {
      throw new Error(data.message || '获取用户信息失败')
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    error.value = '获取用户信息失败，请检查网络连接'
  } finally {
    loading.value = false
  }
}

const handleSignIn = async () => {
  try {
    isCheckinLoading.value = true
    error.value = ''
    const token = localStorage.getItem('userToken')

    const response = await fetch('/api/user/signIn', {
      method: 'GET',
      headers: {
        'Authorization': token || ''
      }
    })

    const data = await response.json()
    
    if (data.code === 200) {
      checkinSuccess.value = true
      // 直接用返回的数据更新用户信息
      userInfo.value = data.data
      setTimeout(() => {
        checkinSuccess.value = false
      }, 3000)
    } else if (data.code === 403) {
      // 直接显示接口返回的消息
      error.value = data.message
    } else {
      throw new Error(data.message || '签到失败')
    }
  } catch (err) {
    console.error('签到失败:', err)
    error.value = '签到失败，请稍后重试'
  } finally {
    isCheckinLoading.value = false
  }
}

const handleEditSubmit = async () => {
  try {
    const token = localStorage.getItem('userToken')
    const response = await fetch('/api/user/update', {
      method: 'POST',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm.value)
    })

    const data = await response.json()
    if (data.code === 200) {
      await fetchUserInfo()
      showEditModal.value = false
    } else {
      throw new Error(data.message || '更新失败')
    }
  } catch (err) {
    console.error('更新失败:', err)
    error.value = '更新失败，请稍后重试'
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
          'px-8 py-6 border-b relative',
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
            </div>

            <div class="flex-1">
              <div class="flex items-center space-x-4">
                <h1 class="text-2xl font-bold">{{ userInfo.userName }}</h1>
                <span :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  getMembershipStatus(userInfo.status).color,
                  themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
                ]">
                  {{ getMembershipStatus(userInfo.status).label }}
                </span>
              </div>
              <p :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'" class="mt-1">
                {{ userInfo.email }}
              </p>
            </div>

            <div class="flex space-x-3">
              <button
                  @click="handleSignIn"
                  :disabled="isCheckinLoading"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="[
                    checkinSuccess
                      ? 'bg-green-500 text-white'
                      : themeStore.isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  ]"
              >
                {{ isCheckinLoading ? '签到中...' : checkinSuccess ? '签到成功！' : '每日签到' }}
              </button>
              <button
                  @click="showEditModal = true"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="themeStore.isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'"
              >
                编辑资料
              </button>
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

            <div :class="[
              'p-4 rounded-lg',
              themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
            ]">
              <div class="text-sm font-medium mb-1" :class="themeStore.isDark ? 'text-gray-400' : 'text-gray-600'">
                注册时间
              </div>
              <div class="text-base font-medium">{{ formatDateTime(userInfo.registerTime) }}</div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="max-w-md w-full mx-4">
        <div :class="[
          'rounded-lg p-8 relative',
          themeStore.isDark ? 'bg-gray-800' : 'bg-white'
        ]">
          <button
              @click="showEditModal = false"
              class="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 class="text-xl font-bold mb-6">编辑个人资料</h2>

          <form @submit.prevent="handleEditSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">昵称</label>
              <input
                  v-model="editForm.nickName"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                    themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
                  ]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">头像URL</label>
              <input
                  v-model="editForm.avatarUrl"
                  type="url"
                  :class="[
                    'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                    themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
                  ]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">性别</label>
              <select
                  v-model="editForm.gender"
                  :class="[
                    'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                    themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
                  ]"
              >
                <option :value="null">未设置</option>
                <option :value="1">男</option>
                <option :value="2">女</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">生日</label>
              <input
                  v-model="editForm.birthday"
                  type="date"
                  :class="[
                    'w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                    themeStore.isDark ? 'bg-gray-700' : 'bg-gray-100'
                  ]"
              />
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                  type="button"
                  @click="showEditModal = false"
                  class="px-4 py-2 rounded-lg font-medium"
                  :class="themeStore.isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'"
              >
                取消
              </button>
              <button
                  type="submit"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
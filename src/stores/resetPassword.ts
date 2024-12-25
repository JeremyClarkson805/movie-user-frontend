import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '../services/api'

export const useResetPasswordStore = defineStore('resetPassword', () => {
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const isVerified = ref(false)
    const verifiedEmail = ref('')

    const sendVerificationCode = async (email: string) => {
        try {
            isLoading.value = true
            error.value = null

            const response = await apiService.resetPassword.sendResetCode(email)
            if (response.code === 200) {
                return true
            } else {
                throw new Error(response.message || '发送验证码失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '发送验证码失败'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const verifyCode = async (email: string, code: string) => {
        try {
            isLoading.value = true
            error.value = null

            const response = await apiService.resetPassword.verifyCode(email, code)
            if (response.code === 200) {
                isVerified.value = true
                verifiedEmail.value = email
                return true
            } else {
                throw new Error(response.message || '验证码验证失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '验证码验证失败'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const resetPassword = async (newPassword: string) => {
        try {
            isLoading.value = true
            error.value = null

            const response = await apiService.resetPassword.resetPassword(verifiedEmail.value, newPassword)
            if (response.code === 200) {
                // 重置成功后清空状态
                isVerified.value = false
                verifiedEmail.value = ''
                return true
            } else {
                throw new Error(response.message || '重置密码失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '重置密码失败'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        isVerified,
        sendVerificationCode,
        verifyCode,
        resetPassword
    }
})
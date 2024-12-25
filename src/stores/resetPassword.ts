import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '../services/api'
import { useModalStore } from './modalStore'

export const useResetPasswordStore = defineStore('resetPassword', () => {
    const modalStore = useModalStore()
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const isVerified = ref(false)
    const verifiedEmail = ref('')
    const successMessage = ref('')

    const sendVerificationCode = async (email: string) => {
        try {
            isLoading.value = true
            error.value = null
            await apiService.resetPassword.sendResetCode(email)
            return true
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
            await apiService.resetPassword.verifyCode(email, code)
            isVerified.value = true
            verifiedEmail.value = email
            localStorage.setItem('resetCode', code)
            return true
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
            const code = localStorage.getItem('resetCode')

            if (!code || !verifiedEmail.value) {
                throw new Error('验证信息已过期，请重新验证')
            }

            await apiService.resetPassword.setNewPassword(
                verifiedEmail.value,
                newPassword,
                code
            )

            // Set success message
            successMessage.value = '密码重置成功！请使用新密码登录。'

            // Clear state after a delay
            setTimeout(() => {
                $reset()
                localStorage.removeItem('resetCode')
                modalStore.openLogin()
            }, 5000)

            return true
        } catch (err) {
            error.value = err instanceof Error ? err.message : '重置密码失败'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const $reset = () => {
        isLoading.value = false
        error.value = null
        isVerified.value = false
        verifiedEmail.value = ''
        successMessage.value = ''
    }

    return {
        isLoading,
        error,
        isVerified,
        successMessage,
        sendVerificationCode,
        verifyCode,
        resetPassword,
        $reset
    }
})
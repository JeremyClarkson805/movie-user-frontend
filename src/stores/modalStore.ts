import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
    const activeModal = ref<'login' | 'resetPassword' | 'register' | null>(null)

    const openLogin = () => {
        activeModal.value = 'login'
    }

    const openResetPassword = () => {
        activeModal.value = 'resetPassword'
    }

    const openRegister = () => {
        activeModal.value = 'register'
    }

    const closeModal = () => {
        activeModal.value = null
    }

    return {
        activeModal,
        openLogin,
        openResetPassword,
        openRegister,
        closeModal
    }
})
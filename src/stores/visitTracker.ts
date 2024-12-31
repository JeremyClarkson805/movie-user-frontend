import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVisitTrackerStore = defineStore('visitTracker', () => {
    // 使用 Object.defineProperty 来保护访问计数
    const state = {
        _dailyVisits: parseInt(localStorage.getItem('dailyVisits') || '0'),
        _lastVisitDate: localStorage.getItem('lastVisitDate') || ''
    }

    // 创建受保护的访问计数属性
    Object.defineProperty(state, 'dailyVisits', {
        get: () => state._dailyVisits,
        set: (value) => {
            state._dailyVisits = value
            localStorage.setItem('dailyVisits', value.toString())
        },
        enumerable: true,
        configurable: false
    })

    const checkAndResetDaily = () => {
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const lastDate = state._lastVisitDate

        // 检查是否过了午夜(00:00)
        if (lastDate !== today) {
            state.dailyVisits = 0
            state._lastVisitDate = today
            localStorage.setItem('lastVisitDate', today)
        }
    }

    const incrementVisit = () => {
        checkAndResetDaily()
        state.dailyVisits++
    }

    const needsCaptcha = () => {
        checkAndResetDaily()
        return state.dailyVisits >= 25
    }

    const getDailyVisits = () => {
        checkAndResetDaily()
        return state.dailyVisits
    }

    return {
        getDailyVisits,
        incrementVisit,
        needsCaptcha
    }
})
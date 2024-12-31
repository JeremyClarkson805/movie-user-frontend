import { defineStore } from 'pinia'
import { encrypt, decrypt, generateHash } from '../utils/crypto'

const STORAGE_KEY = 'movieVisits'
const HASH_KEY = 'visitHash'

export const useVisitTrackerStore = defineStore('visitTracker', () => {
    // 私有状态
    const state = {
        _initialized: false
    }

    // 从加密存储中获取访问数据
    const getStoredData = (): { visits: number; date: string } => {
        try {
            const encryptedData = localStorage.getItem(STORAGE_KEY)
            const storedHash = localStorage.getItem(HASH_KEY)

            if (!encryptedData || !storedHash) {
                return { visits: 0, date: new Date().toISOString().split('T')[0] }
            }

            const decryptedData = decrypt(encryptedData)
            const calculatedHash = generateHash(decryptedData)

            // 验证数据完整性
            if (calculatedHash !== storedHash) {
                console.warn('Data tampering detected')
                return { visits: 0, date: new Date().toISOString().split('T')[0] }
            }

            const data = JSON.parse(decryptedData)
            return data
        } catch {
            return { visits: 0, date: new Date().toISOString().split('T')[0] }
        }
    }

    // 安全地保存数据
    const saveData = (visits: number, date: string) => {
        const data = JSON.stringify({ visits, date })
        const encryptedData = encrypt(data)
        const hash = generateHash(data)

        localStorage.setItem(STORAGE_KEY, encryptedData)
        localStorage.setItem(HASH_KEY, hash)
    }

    // 检查并重置每日访问
    const checkAndResetDaily = () => {
        const data = getStoredData()
        const today = new Date().toISOString().split('T')[0]

        if (data.date !== today) {
            saveData(0, today)
            return { visits: 0, date: today }
        }

        return data
    }

    const incrementVisit = () => {
        const data = checkAndResetDaily()
        saveData(data.visits + 1, data.date)
    }

    const needsCaptcha = () => {
        const data = checkAndResetDaily()
        return data.visits >= 20
    }

    const getDailyVisits = () => {
        const data = checkAndResetDaily()
        return data.visits
    }

    // 初始化时进行完整性检查
    if (!state._initialized) {
        checkAndResetDaily()
        state._initialized = true

        // 添加存储事件监听器以检测篡改
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY || e.key === HASH_KEY) {
                checkAndResetDaily()
            }
        })
    }

    return {
        getDailyVisits,
        incrementVisit,
        needsCaptcha
    }
})
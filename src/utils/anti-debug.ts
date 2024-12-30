import { onMounted, onUnmounted } from 'vue'

// Advanced debugger detection
const createDebuggerTrap = () => {
    let count = 0
    const maxAttempts = 3

    return () => {
        const start = performance.now()
        debugger
        const end = performance.now()

        if (end - start > 100) {
            count++
            if (count >= maxAttempts) {
                window.location.href = '/'
            }
        }
    }
}

// DevTools detection
const createDevToolsDetector = () => {
    return () => {
        const widthThreshold = window.outerWidth - window.innerWidth > 160
        const heightThreshold = window.outerHeight - window.innerHeight > 160
        const isDevToolsOpen = widthThreshold || heightThreshold

        if (isDevToolsOpen) {
            window.location.href = '/'
        }
    }
}

// 检测是否为移动设备
const isMobileDevice = () => {
    return /Mobi|Android/i.test(navigator.userAgent)
}

export const useAntiDebug = () => {
    let debuggerTimer: number
    let devToolsTimer: number
    const debuggerTrap = createDebuggerTrap()
    const detectDevTools = createDevToolsDetector()

    onMounted(() => {
        // 如果是移动设备，则不启用反爬措施
        if (isMobileDevice()) return

        // Set up continuous monitoring
        debuggerTimer = window.setInterval(debuggerTrap, 500)
        devToolsTimer = window.setInterval(detectDevTools, 500)

        // Block developer tools shortcuts
        document.addEventListener('keydown', (e) => {
            const blockedKeys = ['F12', 'I', 'J', 'C', 'U']
            if (
                (e.ctrlKey && e.shiftKey && blockedKeys.includes(e.key)) ||
                e.key === 'F12'
            ) {
                e.preventDefault()
                window.location.href = '/'
            }
        })

        // Disable right-click
        document.addEventListener('contextmenu', e => e.preventDefault())
    })

    onUnmounted(() => {
        clearInterval(debuggerTimer)
        clearInterval(devToolsTimer)
    })
}
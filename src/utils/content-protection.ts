// Dynamic content loading with obfuscation
export const useContentProtection = () => {
    const obfuscate = (text: string): string => {
        return text
            .split('')
            .map(char => `&#${char.charCodeAt(0)};`)
            .join('')
    }

    const deobfuscate = (text: string): string => {
        return text.replace(/&#(\d+);/g, (_, code) =>
            String.fromCharCode(parseInt(code, 10)))
    }

    const addRandomDelay = async (min = 200, max = 500): Promise<void> => {
        const delay = Math.random() * (max - min) + min
        await new Promise(resolve => setTimeout(resolve, delay))
    }

    const loadWithProtection = async <T>(
        loadFn: () => Promise<T>,
        options = { minDelay: 200, maxDelay: 500 }
    ): Promise<T> => {
        await addRandomDelay(options.minDelay, options.maxDelay)
        return loadFn()
    }

    return {
        obfuscate,
        deobfuscate,
        loadWithProtection
    }
}
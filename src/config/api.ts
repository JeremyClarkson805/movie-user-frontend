// API configuration
export const API_CONFIG = {
    // Using relative URL to leverage Vite's proxy
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}

// Helper function to get auth header
export const getAuthHeader = () => {
    const userToken = localStorage.getItem('userToken')
    const guestToken = localStorage.getItem('guestToken')
    return userToken || guestToken
        ? { 'Authorization': `${userToken || guestToken}` }
        : {}
}

// API request helper
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_CONFIG.baseURL}${endpoint}`

    const headers = {
        ...API_CONFIG.headers,
        ...getAuthHeader(),
        ...options.headers
    }

    const config: RequestInit = {
        ...options,
        headers
    }

    const response = await fetch(url, config)

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'API request failed')
    }

    return response.json()
}
import CryptoJS from 'crypto-js'

const SECRET_KEY = 'your-secret-key-here'

export const encrypt = (data: string): string => {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString()
}

export const decrypt = (encryptedData: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
        return bytes.toString(CryptoJS.enc.Utf8)
    } catch {
        return '0'
    }
}

export const generateHash = (data: string): string => {
    return CryptoJS.SHA256(data + SECRET_KEY).toString()
}
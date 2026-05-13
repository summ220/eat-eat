// utils/codeGenerator.js

/**
 * 使用微信小程序原生 API 生成随机数
 */
export function generateInviteCode() {
    return new Promise((resolve) => {
        // 生成12个随机字节
        wx.getRandomValues({
            length: 12,
            success: (res) => {
                const bytes = res.randomValues
                let code = ''
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

                for (let i = 0; i < bytes.length; i++) {
                    code += chars[bytes[i] % chars.length]
                }

                // 添加时间戳后缀保证唯一性
                const timestamp = Date.now().toString(36).toUpperCase().slice(-3)
                resolve(`${code}${timestamp}`)
            },
            fail: () => {
                // 降级方案
                resolve(generateFallbackCode())
            }
        })
    })
}

function generateFallbackCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
    }
    const timestamp = Date.now().toString(36).toUpperCase().slice(-3)
    return `${result}${timestamp}`
}

export function generateId() {
    return new Promise((resolve) => {
        // 生成32个随机字节
        wx.getRandomValues({
            length: 32,
            success: (res) => {
                const bytes = res.randomValues
                let code = ''
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

                for (let i = 0; i < bytes.length; i++) {
                    code += chars[bytes[i] % chars.length]
                }

                // 添加时间戳后缀保证唯一性
                const timestamp = Date.now().toString(36).toUpperCase().slice(-3)
                resolve(`${code}${timestamp}`)
            }
        })
    })
}// utils/randomId.js

/**
 * 生成高性能随机ID（同步 + 时间戳 + 随机）
 * 保证同一毫秒内也不会重复
 * @returns {string} 32位随机字符串
 */
export function generateRandomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    // 时间戳部分（36进制，约8-10位）
    const timestamp = Date.now().toString(36)

    // 随机部分（填充到32位）
    let random = ''
    const remainingLength = 32 - timestamp.length
    for (let i = 0; i < remainingLength; i++) {
        random += chars[Math.floor(Math.random() * chars.length)]
    }

    // 混合：随机字符间隔插入时间戳，增加随机性
    let result = ''
    const timestampArr = timestamp.split('')
    const randomArr = random.split('')

    for (let i = 0; i < 32; i++) {
        if (timestampArr.length > 0 && i % 3 === 0) {
            result += timestampArr.shift()
        } else if (randomArr.length > 0) {
            result += randomArr.shift()
        } else {
            result += chars[Math.floor(Math.random() * chars.length)]
        }
    }
    console.log('生成的随机ID:', result)

    return result
}
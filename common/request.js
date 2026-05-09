import config from './config.js'

// 存储进行中的请求，实现并发控制（防抖/节流）
const pendingRequests = new Map()

export default function request(url, method = 'GET', data = {}) {
    // 1. 判断缓存时长规则
    let cacheTime = 0
    if (url.includes('/weather/now') || url.includes('/weather/24h') || url.includes('/indices/1d')) {
        cacheTime = 30 * 60 * 1000 // 实时天气与指数：缓存 30 分钟
    } else if (url.includes('/weather/7d')) {
        cacheTime = 2 * 60 * 60 * 1000 // 天气预报：缓存 2 小时
    } else if (url.includes('weather')) {
        cacheTime = 30 * 60 * 1000 // 其他天气接口默认 30 分钟
    }

    // 缓存 Key (使用 url 与 location 生成唯一键)
    const cacheKey = `weather_cache_${url}_${data.location || ''}`

    // 2. 检查本地存储缓存是否有效
    if (cacheTime > 0) {
        try {
            const cached = uni.getStorageSync(cacheKey)
            if (cached && cached.expireTime > Date.now()) {
                console.log(`[Cache Hit] 命中缓存, 剩余有效时间: ${Math.round((cached.expireTime - Date.now()) / 1000)}s - ${url}`)
                return Promise.resolve(cached.data)
            }
        } catch (e) {
            console.error('读取缓存失败', e)
        }
    }

    // 3. 避免正在请求中的接口被重复调用（并发控制）
    const requestKey = `${method}_${url}_${JSON.stringify(data)}`
    if (pendingRequests.has(requestKey)) {
        console.log(`[Request Merged] 正在请求中，跳过重复调用 - ${url}`)
        return pendingRequests.get(requestKey)
    }

    // 4. 发起真实的网络请求
    const reqPromise = new Promise((resolve, reject) => {
        const finalUrl = url.startsWith('http') ? url : config.baseUrl + url
        uni.request({
            url: finalUrl,
            method: method,
            timeout: 10000,
            data: { ...data, key: config.weatherKey },
            success: (res) => {
                if (res.statusCode === 200 && res.data && res.data.code === '200') {
                    // 请求成功，写入缓存
                    if (cacheTime > 0) {
                        try {
                            uni.setStorageSync(cacheKey, {
                                data: res.data,
                                expireTime: Date.now() + cacheTime
                            })
                        } catch (e) {
                            console.error('写入缓存失败', e)
                        }
                    }
                    resolve(res.data)
                } else {
                    reject(res.data || '请求失败')
                }
            },
            fail: (err) => {
                reject(err)
            },
            complete: () => {
                // 请求结束，从 Map 中移除
                pendingRequests.delete(requestKey)
            }
        })
    })

    // 将当前请求 Promise 存入 Map
    pendingRequests.set(requestKey, reqPromise)
    return reqPromise
}
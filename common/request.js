import config from './config.js'

export default function request(url, method = 'GET', data = {}) {
    return new Promise((resolve, reject) => {
        const finalUrl = url.startsWith('http') ? url : config.baseUrl + url
        uni.request({
            url: finalUrl,
            method: method,
            timeout: 10000,
            data: { ...data, key: config.weatherKey },
            success: (res) => {
                if (res.statusCode === 200 && res.data && res.data.code === '200') {
                    resolve(res.data)
                } else {
                    reject(res.data || '请求失败')
                }
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}
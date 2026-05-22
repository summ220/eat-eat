import config from '../config.js'

/**
 * 统一的业务后台接口请求封装
 * @param {string} url 请求路径后缀
 * @param {string} method HTTP 请求方法
 * @param {object} data 请求数据
 * @returns {Promise<any>}
 */
const request = (url, method = 'POST', data = {}) => {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : (config.apiBaseUrl || 'http://lw.feiyuf.top/api') + url
    const deviceId = uni.getStorageSync('device_id') || ''
    const deviceSecret = uni.getStorageSync('device_secret') || ''

    uni.request({
      url: fullUrl,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
        'X-Device-Secret': deviceSecret
      },
      data: data,
      success: (res) => {
        // 如果接口返回错误码，也应该 reject
        if (res.data && res.data.code && res.data.code !== 0) {
          reject(new Error(res.data.message || '请求失败'))
        } else {
          resolve(res.data)
        }
      },
      fail: (err) => {
        console.error(`[API Error] ${url} :`, err)
        reject(err)
      }
    })
  })
}

export default request

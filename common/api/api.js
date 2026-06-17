import config from '../config.js'

/**
 * 统一的业务后台接口请求封装
 * @param {string} url 请求路径后缀
 * @param {string} method HTTP 请求方法
 * @param {object} data 请求数据
 * @returns {Promise<any>}
 */
const request = (url, method = 'POST', data = {}, headers = {}) => {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : (config.apiBaseUrl || 'http://lw.feiyuf.top/api') + url
    const deviceId = uni.getStorageSync('device_id') || ''
    const deviceSecret = uni.getStorageSync('device_secret') || ''

    uni.request({
      url: fullUrl,
      method: method,
      header: Object.assign({
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
        'X-Device-Secret': deviceSecret,
        'X-User-Id': deviceId
      }, headers),
      data: data,
      success: (res) => {
        // 如果接口返回错误码，且既不是 0 也不是 200，则判定为失败并 reject
        if (res.data && res.data.code !== undefined && res.data.code !== null && res.data.code !== 0 && res.data.code !== 200) {
          reject(new Error(res.data.message || res.data.msg || '请求失败'))
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

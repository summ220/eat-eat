import config from './config.js'
import eatCo from './localDB.js'

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

export default {
  /**
   * 注册设备
   */
  registerDevice() {
    return request('/registerDevice', 'POST', {})
  },
  /**
   * 创建家庭
   * @param {string} familyName 
   * @param {string} familyCode 
   */
  createFamily(familyName) {
    return request('/createFamily', 'POST', {
      familyName
    })
  },

  /**
   * 获取家庭邀请验证码
   * @param {string} familyCode 家庭码/ID
   * @param {number} ttlMinutes 有效期时长
   */
  createFamilyInvite(familyCode, ttlMinutes = 60) {
    return request('/createFamilyInvite', 'POST', {
      familyCode,
      ttlMinutes
    })
  },
  /**
   * 加入家庭
   * @param {string} inviteCode 邀请码
   */
  joinFamily(inviteCode) {
    return request('/joinFamily', 'POST', {
      inviteCode
    })
  },
  /**
   * 获取家庭成员
   * @param {string} familyCode 家庭码/ID
   */
  getFamilyMembers(familyCode) {
    return request('/getFamilyMembers', 'POST', {
      familyCode
    })
  },
  /**
   * 获取家庭信息
   * @param {string} familyCode 家庭码/ID
   */
  getFamily(familyCode) {
    return request('/getFamily', 'POST', {
      familyCode
    })
  },
  /**
   * 更新家庭名称
   * @param {string} familyCode 家庭码/ID
   * @param {string} familyName 家庭名称
   */
  updateFamily(familyCode, familyName) {
    return request('/updateFamily', 'POST', {
      familyCode,
      familyName
    })
  }
}

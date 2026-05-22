import request from './api.js'

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
    return request('/getFamilyMembers', 'GET', {
      familyCode
    })
  },
  /**
   * 更新成员信息
   */
  updateMyFamilyMemberProfile(familyCode, name, title, avatarUrl) {
    return request('/updateMyFamilyMemberProfile', 'POST', {
      familyCode,
      name,
      title,
      avatarUrl
    })
  },

  /**
   * 退出家庭
   * @param {string} familyCode 家庭码/ID
   */
  leaveFamily(familyCode) {
    return request('/leaveFamily', 'POST', {
      familyCode
    })
  },

  /**
   * 获取家庭信息
   * @param {string} familyCode 家庭码/ID
   */
  getFamily(familyCode) {
    return request('/getFamily', 'GET', {
      familyCode
    })
  },
  /**
   * 更新家庭名称
   * @param {string} familyCode 家庭码/ID
   * @param {string} familyName 家庭名称
   */
  updateFamily(familyCode, familyName, avatarUrl) {
    return request('/updateFamily', 'POST', {
      familyCode,
      familyName,
      avatarUrl
    })
  },

  /**
   * 获取家庭抽菜池中的所有抽菜项
   * @param {string} familyCode 家庭码/ID
   */
  getFamilyRecipePoolItems(familyCode) {
    return request('/getFamilyRecipePoolItems', 'GET', {
      familyCode
    })
  },

  /**
   * 保存家庭抽菜池中的抽菜项
   * @param {string} familyCode 家庭码/ID
   * @param {string} dishJson 抽菜项JSON
   */
  saveFamilyRecipePoolItem(familyCode, dishJson) {
    return request('/saveFamilyRecipePoolItem', 'POST', {
      familyCode,
      dishJson
    })
  },

  /**
   * 删除家庭抽菜池中的抽菜项
   * @param {string} id 抽菜项ID
   */
  deleteFamilyRecipePoolItem(id) {
    return request('/deleteFamilyRecipePoolItem', 'POST', {
      id
    })
  }
}

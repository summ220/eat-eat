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
   * 解散家庭
   * @param {string} familyCode 家庭码/ID
   */
  deleteFamily(familyCode) {
    return request('/deleteFamily', 'POST', {
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
  },

  /**
   * 获取我的家庭列表
   */
  getMyFamilies() {
    return request('/getMyFamilies', 'GET', {})
  },

  /**
   * 设置家庭密保
   * @param {string} familyCode 家庭码
   * @param {string} question 密保问题
   * @param {string} answer 密保答案
   */
  setFamilySecurityQuestion(familyCode, question, answer) {
    return request('/setFamilySecurityQuestion', 'POST', {
      familyCode,
      question,
      answer
    })
  },

  /**
   * 密保找回家庭数据
   * @param {string} familyCode 家庭码
   * @param {string} question 密保问题
   * @param {string} answer 密保答案
   */
  recoverFamilyBySecurity(familyCode, question, answer) {
    return request('/recoverFamilyBySecurity', 'POST', {
      familyCode,
      question,
      answer
    })
  },


  // 饮食偏好
  /**
   * 保存家庭饮食偏好
   * @param {string} familyCode 家庭码/ID
   * @param {string} dietPreferenceJson 饮食偏好JSON
   */
  // title、type（family_taste=全家口味，avoid_food=忌口不吃）
  saveFamilyDietPreference(familyCode, dietPreferenceJson) {
    return request('/saveFamilyDietPreference', 'POST', {
      familyCode,
      dietPreferenceJson
    })
  },

  /**
   * 获取家庭饮食偏好
   * @param {string} familyCode 家庭码/ID
   * @param {string} type 饮食偏好类型
   */
  // type:family_taste=全家口味，avoid_food=忌口不吃
  getFamilyDietPreferences(familyCode, type) {
    return request('/getFamilyDietPreferences', 'GET', {
      familyCode,
      type
    })
  },

  /**
   * 更新家庭饮食偏好
   * @param {string} familyCode 家庭码/ID
   * @param {string} dietPreferenceJson 饮食偏好JSON
   */
  // id、title、preferenceType(family_taste=全家口味，avoid_food=忌口不吃)
  updateFamilyDietPreference(familyCode, dietPreferenceJson) {
    return request('/updateFamilyDietPreference', 'POST', {
      familyCode,
      dietPreferenceJson
    })
  },

  /**
   * 删除家庭饮食偏好
   * @param {string} familyCode 家庭码/ID
   * @param {string} id 饮食偏好ID
   */
  deleteFamilyDietPreference(familyCode, id) {
    return request('/deleteFamilyDietPreference', 'POST', {
      familyCode,
      id
    })
  },

  // 家庭备忘录

  /**
   * 创建备忘录
   * @param {string} familyCode 家庭码/ID
   * @param {string} memoJson 备忘录JSON
   */
  // content
  saveFamilyMemo(familyCode, memoJson) {
    return request('/saveFamilyMemo', 'POST', {
      familyCode,
      memoJson
    })
  },

  /**
   * 获取本家庭备忘录列表
   * @param {string} familyCode 家庭码/ID
   */
  getFamilyMemos(familyCode) {
    return request('/getFamilyMemos', 'GET', {
      familyCode
    })
  },

  /**
   * 更新备忘录
   * @param {string} familyCode 家庭码/ID
   * @param {string} memoJson 备忘录JSON
   */
  // id、 content
  updateFamilyMemo(familyCode, memoJson) {
    return request('/updateFamilyMemo', 'POST', {
      familyCode,
      memoJson
    })
  },

  /**
   * 删除备忘录
   * @param {string} familyCode 家庭码/ID
   * @param {string} id 备忘录ID
   */
  deleteFamilyMemo(familyCode, id) {
    return request('/deleteFamilyMemo', 'POST', {
      familyCode,
      id
    })
  },

  /**
   * 获取本家庭备忘录详情
   * @param {string} familyCode 家庭码
   * @param {string} id 备忘录ID
   */
  getFamilyMemo(familyCode, id) {
    return request('/getFamilyMemo', 'GET', {
      familyCode,
      id
    })
  },

  // 个人随手记

  /**
   * 创建备忘录
   * @param {string} noteJson 备忘录JSON
   */
  // content
  savePersonalNote(noteJson) {
    return request('/savePersonalNote', 'POST', {
      noteJson
    })
  },

  /**
   * 获取本家庭备忘录列表
   * @param {string} id 备忘录ID
   */
  getPersonalNotes(id) {
    return request('/getPersonalNotes', 'GET', {
      id
    })
  },

  /**
   * 更新备忘录
   * @param {string} noteJson 备忘录JSON
   */
  // id、 content
  updatePersonalNote(noteJson) {
    return request('/updatePersonalNote', 'POST', {
      noteJson
    })
  },

  /**
   * 删除备忘录
   * @param {string} id 备忘录ID
   */
  deletePersonalNote(id) {
    return request('/deletePersonalNote', 'POST', {
      id
    })
  },
  /**
   * 获取本家庭备忘录详情
   * @param {string} id 备忘录ID
   */
  getPersonalNote(id) {
    return request('/getPersonalNote', 'GET', {
      id
    })
  },
}
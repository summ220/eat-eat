import request from './api.js'

export default {
  /**
   * 获取家庭购物列表
   * @param {string} familyCode 家庭码/ID
   * @param {string} categoryId 分类ID
   */
  getFamilyShoppingItems(familyCode, categoryId) {
    return request('/getFamilyShoppingItems', 'GET', {
      familyCode,
      categoryId
    })
  },

  /**
   * 获取家庭购物详情
   * @param {string} id 购物ID
   */
  getFamilyShoppingItem(id) {
    return request('/getFamilyShoppingItem', 'GET', {
      id
    })
  },

  /**
   * 保存家庭购物
   * @param {string} familyCode 家庭码/ID
   * @param {object} shoppingItemJson 购物JSON串
   */
  saveFamilyShoppingItem(familyCode, shoppingItemJson) {
    return request('/saveFamilyShoppingItem', 'POST', {
      familyCode,
      shoppingItemJson
    })
  },
  /**
   * 更新家庭购物
   * @param {string} familyCode 家庭码/ID
   * @param {object} shoppingItemJson 购物JSON串
   */
  updateFamilyShoppingItem(familyCode, shoppingItemJson) {
    return request('/updateFamilyShoppingItem', 'POST', {
      familyCode,
      shoppingItemJson
    })
  },

  /**
   * 删除家庭购物
   * @param {string} familyCode 家庭码/ID
   * @param {string} id 购物ID
   */
  deleteFamilyShoppingItem(familyCode, id) {
    return request('/deleteFamilyShoppingItem', 'POST', {
      familyCode,
      id
    })
  },

  /**
   * 清空已购买的家庭购物
   * @param {string} familyCode 家庭码/ID
   */
  clearPurchasedFamilyShoppingItems(familyCode) {
    return request('/clearPurchasedFamilyShoppingItems', 'POST', {
      familyCode
    })
  },

  /**
   * 获取家庭购物分类
   * @param {string} familyCode 家庭码/ID
   */
  getFamilyShoppingCategories(familyCode) {
    return request('/getFamilyShoppingCategories', 'GET', {
      familyCode
    })
  },

  /**
   * 保存家庭购物分类
   * @param {string} familyCode 家庭码/ID
   * @param {object} shoppingCategoryJson 分类JSON串
   */
  saveFamilyShoppingCategory(familyCode, shoppingCategoryJson) {
    return request('/saveFamilyShoppingCategory', 'POST', {
      familyCode,
      shoppingCategoryJson
    })
  },

  /**
   * 删除家庭购物分类
   * @param {string} id 分类ID
   */
  deleteFamilyShoppingCategory(id) {
    return request('/deleteFamilyShoppingCategory', 'POST', {
      id
    })
  }
}
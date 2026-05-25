import request from './api.js'

export default {
  /**
   * 获取家庭食材
   * @param {string} familyCode 家庭码/ID
   * @param {string} categoryId 分类ID
   */
  getFamilyIngredientItems(familyCode, categoryId) {
    return request('/getFamilyIngredientItems', 'GET', {
      familyCode,
      categoryId
    })
  },

  /**
   * 获取家庭食材详情
   * @param {string} id 食材ID
   */
  getFamilyIngredientItem(id) {
    return request('/getFamilyIngredientItem', 'GET', {
      id
    })
  },

  /**
   * 保存家庭食材
   * @param {string} familyCode 家庭码/ID
   * @param {object} ingredientItemJson 食材JSON串
   */
  saveFamilyIngredientItem(familyCode, ingredientItemJson) {
    return request('/saveFamilyIngredientItem', 'POST', {
      familyCode,
      ingredientItemJson
    })
  },
  /**
   * 更新家庭食材
   * @param {string} familyCode 家庭码/ID
   * @param {object} ingredientItemJson 食材JSON串
   */
  updateFamilyIngredientItem(familyCode, ingredientItemJson) {
    return request('/updateFamilyIngredientItem', 'POST', {
      familyCode,
      ingredientItemJson
    })
  },

  /**
   * 删除家庭食材
   * @param {string} id 食材ID
   */
  deleteFamilyIngredientItem(id) {
    return request('/deleteFamilyIngredientItem', 'POST', {
      id
    })
  },

  /**
   * 批量删除家庭食材
   * @param {string} familyCode 家庭码/ID
   * @param {string} ids 食材ID列表
   */
  deleteFamilyIngredientItems(familyCode, ids) {
    return request('/deleteFamilyIngredientItems', 'POST', {
      familyCode,
      ids
    })
  },

  /**
   * 获取家庭食材分类
   * @param {string} familyCode 家庭码/ID
   */
  getFamilyIngredientCategories(familyCode) {
    return request('/getFamilyIngredientCategories', 'GET', {
      familyCode
    })
  },

  /**
   * 保存家庭食材分类
   * @param {string} familyCode 家庭码/ID
   * @param {object} recipeCategoryJson 分类JSON串
   */
  saveFamilyIngredientCategory(familyCode, ingredientCategoryJson) {
    return request('/saveFamilyIngredientCategory', 'POST', {
      familyCode,
      ingredientCategoryJson
    })
  },

  /**
   * 删除家庭食材分类
   * @param {string} familyCode 家庭码/ID
   * @param {string} categoryId 分类ID
   */
  deleteFamilyIngredientCategory(id) {
    return request('/deleteFamilyIngredientCategory', 'POST', {
      id
    })
  }
}
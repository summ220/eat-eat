import request from './api.js'

export default {
  /**
   * 获取家庭菜谱
   * @param {string} familyCode 家庭码/ID
   * @param {string} category 分类名称
   */
  getFamilyRecipeByMember(familyCode, category) {
    return request('/getFamilyRecipeByMember', 'GET', { familyCode, category })
  },

  /**
   * 获取家庭菜谱详情
   * @param {string} familyCode 家庭码/ID
   * @param {string} id 菜谱谱ID
   */
  getFamilyRecipeItem(familyCode, id) {
    return request('/getFamilyRecipeItem', 'GET', {
      familyCode,
      id
    })
  },

  /**
   * 上传家庭谱谱封面
   * @param {string} familyCode 家庭码/ID
   * @param {string} coverUrl 封面URL
   */
  uploadFamilyRecipeCover(familyCode, imageData) {
    return request('/uploadFamilyRecipeCover', 'POST', {
      familyCode,
      imageData
    })
  },

  /**
   * 保存家庭菜谱
   * @param {string} familyCode 家庭码/ID
   * @param {object} recipeJson 菜谱JSON串
   * @param {string} coverUrl 封面URL
   */
  saveFamilyRecipe(familyCode, recipeJson, coverUrl) {
    return request('/saveFamilyRecipe', 'POST', {
      familyCode,
      recipeJson,
      coverUrl
    })
  },
  /**
   * 更新家庭食材
   * @param {string} familyCode 家庭码/ID
   * @param {object} ingredientItemJson 食材JSON串
   */
  updateFamilyRecipe(familyCode, recipeJson, coverUrl) {
    return request('/updateFamilyRecipeItem', 'POST', {
      familyCode,
      recipeJson,
      coverUrl
    })
  },

  /**
   * 删除家庭食材
   * @param {string} id 食材ID
   */
  deleteFamilyRecipe(id) {
    return request('/deleteFamilyRecipeltem', 'POST', {
      id
    })
  },

  /**
   * 获取家庭菜谱分类
   * @param {string} familyCode 家庭码/ID
   */
  getFamilyRecipeCategories(familyCode) {
    return request('/getFamilyRecipeCategories', 'GET', {
      familyCode
    })
  },

  /**
   * 保存家庭菜谱分类
   * @param {string} familyCode 家庭码/ID
   * @param {object} recipeCategoryJson 分类JSON串
   */
  saveFamilyRecipeCategory(familyCode, recipeCategoryJson) {
    return request('/saveFamilyRecipeCategory', 'POST', {
      familyCode,
      recipeCategoryJson
    })
  },

  /**
   * 删除家庭菜谱分类
   * @param {string} id 分类ID
   */
  deleteFamilyRecipeCategory(id) {
    return request('/deleteFamilyRecipeCategory', 'POST', {
      id
    })
  }
}
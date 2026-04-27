const db = uniCloud.database();
module.exports = {
  _before: function () {
    // 可以在这里做拦截器、权限校验等
  },
  
  // ============ 食材库存 (eat-stock) ============
  async getStockList(familyId = 'default_family') {
    const res = await db.collection('eat-stock')
      .where({ family_id: familyId })
      .orderBy('create_time', 'desc')
      .get();
    return res.data;
  },
  async addStock(data) {
    data.create_time = Date.now();
    if(data.has === undefined) data.has = true;
    if(!data.family_id) data.family_id = 'default_family';
    return await db.collection('eat-stock').add(data);
  },
  async updateStock(id, data) {
    return await db.collection('eat-stock').doc(id).update(data);
  },
  async deleteStock(id) {
    return await db.collection('eat-stock').doc(id).remove();
  },

  // ============ 购物清单 (eat-shop) ============
  async getShopList(familyId = 'default_family') {
    const res = await db.collection('eat-shop')
      .where({ family_id: familyId })
      .orderBy('create_time', 'desc')
      .get();
    return res.data;
  },
  async addShop(data) {
    data.create_time = Date.now();
    if(data.done === undefined) data.done = false;
    if(!data.family_id) data.family_id = 'default_family';
    return await db.collection('eat-shop').add(data);
  },
  async updateShop(id, data) {
    return await db.collection('eat-shop').doc(id).update(data);
  },
  async deleteShop(id) {
    return await db.collection('eat-shop').doc(id).remove();
  },
  async clearDoneShop() {
    return await db.collection('eat-shop').where({ done: true }).remove();
  },

  // ============ 私房菜谱 (eat-recipe) ============
  async getRecipeList(familyId = 'default_family') {
    const res = await db.collection('eat-recipe')
      .where({ family_id: familyId })
      .orderBy('create_time', 'desc')
      .get();
    return res.data;
  },
  async addRecipe(data) {
    data.create_time = Date.now();
    if(!data.family_id) data.family_id = 'default_family';
    return await db.collection('eat-recipe').add(data);
  },
  async updateRecipe(id, data) {
    return await db.collection('eat-recipe').doc(id).update(data);
  },
  async deleteRecipe(id) {
    return await db.collection('eat-recipe').doc(id).remove();
  },

  // ============ 花费账本 (eat-cost) ============
  async getCostList(familyId = 'default_family') {
    const res = await db.collection('eat-cost')
      .where({ family_id: familyId })
      .orderBy('date', 'desc')
      .orderBy('create_time', 'desc')
      .get();
    return res.data;
  },
  async addCost(data) {
    data.create_time = Date.now();
    if(!data.family_id) data.family_id = 'default_family';
    return await db.collection('eat-cost').add(data);
  },
  async updateCost(id, data) {
    return await db.collection('eat-cost').doc(id).update(data);
  },
  async deleteCost(id) {
    return await db.collection('eat-cost').doc(id).remove();
  },

  // ============ 家庭管理 (eat-family) ============
  async getFamilyMembers(familyId) {
    // 模拟从数据库获取成员，实际应查询关联表
    const res = await db.collection('eat-family-members').where({ family_id: familyId }).get();
    return res.data;
  },
  async joinFamily(inviteCode, userInfo) {
    // 1. 验证邀请码
    const family = await db.collection('eat-family').where({ invite_code: inviteCode }).get();
    if (family.data.length === 0) throw new Error('邀请码无效');
    
    const fId = family.data[0]._id;
    // 2. 将用户加入成员表
    await db.collection('eat-family-members').add({
      family_id: fId,
      uid: userInfo.uid,
      nick: userInfo.nick,
      avatar: userInfo.avatar,
      role: '干饭人',
      join_time: Date.now()
    });
    return { familyId: fId, familyName: family.data[0].name };
  }
}

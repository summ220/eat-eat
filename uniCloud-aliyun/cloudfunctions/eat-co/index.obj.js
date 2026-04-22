const db = uniCloud.database();
module.exports = {
  _before: function () {
    // 可以在这里做拦截器、权限校验等
  },
  
  // ============ 食材库存 (eat-stock) ============
  async getStockList() {
    const res = await db.collection('eat-stock').orderBy('create_time', 'desc').get();
    return res.data;
  },
  async addStock(data) {
    data.create_time = Date.now();
    if(data.has === undefined) data.has = true;
    return await db.collection('eat-stock').add(data);
  },
  async updateStock(id, data) {
    return await db.collection('eat-stock').doc(id).update(data);
  },
  async deleteStock(id) {
    return await db.collection('eat-stock').doc(id).remove();
  },

  // ============ 购物清单 (eat-shop) ============
  async getShopList() {
    const res = await db.collection('eat-shop').orderBy('create_time', 'desc').get();
    return res.data;
  },
  async addShop(data) {
    data.create_time = Date.now();
    if(data.done === undefined) data.done = false;
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
  async getRecipeList() {
    const res = await db.collection('eat-recipe').orderBy('create_time', 'desc').get();
    return res.data;
  },
  async addRecipe(data) {
    data.create_time = Date.now();
    return await db.collection('eat-recipe').add(data);
  },
  async updateRecipe(id, data) {
    return await db.collection('eat-recipe').doc(id).update(data);
  },
  async deleteRecipe(id) {
    return await db.collection('eat-recipe').doc(id).remove();
  }
}

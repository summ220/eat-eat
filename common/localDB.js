
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const getCollection = (key) => uni.getStorageSync(key) || [];
const setCollection = (key, data) => uni.setStorageSync(key, data);

const localDB = {
  // ============ 食材库存 (eat-stock) ============
  async getStockList(familyCode = 'default_family') {
    const list = getCollection('eat-stock');
    return list.filter(item => item.family_code === familyCode).sort((a, b) => b.create_time - a.create_time);
  },
  async addStock(data) {
    const list = getCollection('eat-stock');
    const newItem = {
      ...data,
      _id: generateId(),
      create_time: Date.now(),
      has: data.has !== undefined ? data.has : true,
      family_code: data.family_code || 'default_family'
    };
    list.push(newItem);
    setCollection('eat-stock', list);
    return { id: newItem._id };
  },
  async updateStock(id, data) {
    let list = getCollection('eat-stock');
    list = list.map(item => item._id === id ? { ...item, ...data } : item);
    setCollection('eat-stock', list);
    return { updated: 1 };
  },
  async deleteStock(id) {
    let list = getCollection('eat-stock');
    list = list.filter(item => item._id !== id);
    setCollection('eat-stock', list);
    return { deleted: 1 };
  },

  // ============ 购物清单 (eat-shop) ============
  async getShopList(familyCode = 'default_family') {
    const list = getCollection('eat-shop');
    return list.filter(item => item.family_code === familyCode).sort((a, b) => b.create_time - a.create_time);
  },
  async addShop(data) {
    const list = getCollection('eat-shop');
    const newItem = {
      ...data,
      _id: generateId(),
      create_time: Date.now(),
      done: data.done !== undefined ? data.done : false,
      family_code: data.family_code || 'default_family'
    };
    list.push(newItem);
    setCollection('eat-shop', list);
    return { id: newItem._id };
  },
  async updateShop(id, data) {
    let list = getCollection('eat-shop');
    list = list.map(item => item._id === id ? { ...item, ...data } : item);
    setCollection('eat-shop', list);
    return { updated: 1 };
  },
  async deleteShop(id) {
    let list = getCollection('eat-shop');
    list = list.filter(item => item._id !== id);
    setCollection('eat-shop', list);
    return { deleted: 1 };
  },
  async clearDoneShop() {
    let list = getCollection('eat-shop');
    list = list.filter(item => !item.done);
    setCollection('eat-shop', list);
    return { deleted: list.length };
  },

  // ============ 私房菜谱 (eat-recipe) ============
  async getRecipeList(familyCode = 'default_family') {
    const list = getCollection('eat-recipe');
    return list.filter(item => item.family_code === familyCode).sort((a, b) => b.create_time - a.create_time);
  },
  async addRecipe(data) {
    const list = getCollection('eat-recipe');
    const newItem = {
      ...data,
      _id: generateId(),
      create_time: Date.now(),
      family_code: data.family_code || 'default_family'
    };
    list.push(newItem);
    setCollection('eat-recipe', list);
    return { id: newItem._id };
  },
  async updateRecipe(id, data) {
    let list = getCollection('eat-recipe');
    list = list.map(item => item._id === id ? { ...item, ...data } : item);
    setCollection('eat-recipe', list);
    return { updated: 1 };
  },
  async deleteRecipe(id) {
    let list = getCollection('eat-recipe');
    list = list.filter(item => item._id !== id);
    setCollection('eat-recipe', list);
    return { deleted: 1 };
  },

  // ============ 菜谱分类 (eat-recipe-category) ============
  async getRecipeCategoryList(familyCode = 'default_family') {
    const list = getCollection('eat-recipe-category');
    // 先筛选当前家庭的分类
    const familyCategories = list.filter(item => item.family_code === familyCode);
    
    // 如果当前家庭没有分类，尝试从 default_family 迁移
    if (familyCategories.length === 0 && familyCode !== 'default_family') {
      const defaultCategories = list.filter(item => item.family_code === 'default_family');
      if (defaultCategories.length > 0) {
        // 复制 default_family 的分类到当前家庭
        const newCategories = defaultCategories.map(cat => ({
          ...cat,
          _id: generateId(),
          family_code: familyCode,
          create_time: Date.now()
        }));
        setCollection('eat-recipe-category', [...list, ...newCategories]);
        return newCategories;
      }
    }
    
    // 如果还是没有分类，初始化默认分类
    if (familyCategories.length === 0) {
      const defaultCategories = ['家常菜', '减脂', '增肌', '健康', '儿童', '汤品'].map(name => ({
        _id: generateId(),
        name,
        family_code: familyCode,
        create_time: Date.now()
      }));
      setCollection('eat-recipe-category', [...list, ...defaultCategories]);
      return defaultCategories;
    }
    
    return familyCategories.sort((a, b) => a.create_time - b.create_time);
  },
  async addRecipeCategory(data) {
    const list = getCollection('eat-recipe-category');
    const newItem = {
      ...data,
      _id: generateId(),
      create_time: Date.now(),
      family_code: data.family_code || 'default_family'
    };
    list.push(newItem);
    setCollection('eat-recipe-category', list);
    return { id: newItem._id };
  },
  async deleteRecipeCategory(id) {
    let list = getCollection('eat-recipe-category');
    list = list.filter(item => item._id !== id);
    setCollection('eat-recipe-category', list);
    return { deleted: 1 };
  },

  // ============ 花费账本 (eat-cost) ============
  async getCostList(familyCode = 'default_family') {
    const list = getCollection('eat-cost');
    return list.filter(item => item.family_code === familyCode).sort((a, b) => {
      if (b.date !== a.date) {
        return b.date > a.date ? 1 : -1;
      }
      return b.create_time - a.create_time;
    });
  },
  async addCost(data) {
    const list = getCollection('eat-cost');
    const newItem = {
      ...data,
      _id: generateId(),
      create_time: Date.now(),
      family_code: data.family_code || 'default_family'
    };
    list.push(newItem);
    setCollection('eat-cost', list);
    return { id: newItem._id };
  },
  async updateCost(id, data) {
    let list = getCollection('eat-cost');
    list = list.map(item => item._id === id ? { ...item, ...data } : item);
    setCollection('eat-cost', list);
    return { updated: 1 };
  },
  async deleteCost(id) {
    let list = getCollection('eat-cost');
    list = list.filter(item => item._id !== id);
    setCollection('eat-cost', list);
    return { deleted: 1 };
  },

  // ============ 家庭管理 (eat-family) ============
  async getFamilyMembers(familyCode) {
    const list = getCollection('eat-family-members');
    return list.filter(item => item.family_code === familyCode);
  },
  async joinFamily(inviteCode, userInfo) {
    // 这里简单模拟，不再跨设备验证邀请码，直接创建一个家庭或加入
    const families = getCollection('eat-family');
    let family = families.find(f => f.invite_code === inviteCode);
    
    if (!family) {
      // 如果不存在这个邀请码，就模拟创建一个
      family = {
        _id: generateId(),
        name: '我的小厨房',
        invite_code: inviteCode,
        create_time: Date.now()
      };
      families.push(family);
      setCollection('eat-family', families);
    }
    
    const members = getCollection('eat-family-members');
    const newMember = {
      _id: generateId(),
      family_code: family._id,
      uid: userInfo.uid || generateId(),
      nick: userInfo.nick || '游客',
      avatar: userInfo.avatar || '',
      role: '干饭人',
      join_time: Date.now()
    };
    members.push(newMember);
    setCollection('eat-family-members', members);
    
    return { familyCode: family._id, familyName: family.name };
  }
};

export default localDB;
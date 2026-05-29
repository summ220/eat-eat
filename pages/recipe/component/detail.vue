<template>
  <custom-header title="菜谱详情" back />
  <view class="page" v-if="recipe" :style="themeStyle">
    <image class="cover-img" :src=" recipe.cover.startsWith('http') ? recipe.cover : config.imgBaseUrl + recipe.cover || defaultCover" mode="aspectFill" />
    
    <view class="content">
      <view class="header-card">
        <view class="title-row">
          <text class="title">{{ recipe.name }}</text>
          <text class="favorite-btn" @click="toggleFavorite" style="color: var(--primary);">
            {{ recipe.favorite ? '❤️ 喜欢' : '🤍 收藏' }}
          </text>
        </view>
        <view class="tags-row">
          <view class="tag" style="color: var(--primary); background-color: var(--primary-light);">{{ recipe.category }}</view>
          <view class="tag" style="color: var(--primary); background-color: var(--primary-light);">⏱ {{ recipe.duration }}</view>
          <view class="tag" style="color: var(--primary); background-color: var(--primary-light);">🌶 {{ recipe.difficulty }}</view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-header">
          <text class="section-title">准备食材</text>
          <button class="add-cart-btn" @click="addMissingToCart">一键加购缺少的</button>
        </view>
        <!-- 主食材 -->
        <view class="ingredient-group" v-if="mainIngredients.length > 0">
          <text class="group-title">主食材</text>
          <view class="ingredient-list">
            <view class="ingredient-item" v-for="(ing, i) in mainIngredients" :key="i">
              <text class="ing-name">{{ ing.name }}</text>
              <view class="ing-right">
                <text class="ing-amount">{{ ing.amount }}</text>
                <text class="status-label" :class="{ 'has-stock': ing.hasInStock }" :style="ing.hasInStock ? { color: 'var(--primary)' } : {}">
                  {{ ing.hasInStock ? '✅ 已有' : '🛒 需购买' }}
                </text>
                <view class="add-icon" @click.stop="addSingleToCart(ing)">+</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 辅料调料 -->
        <view class="ingredient-group" v-if="seasoningIngredients.length > 0">
          <text class="group-title">辅料 / 调料</text>
          <view class="ingredient-list">
            <view class="ingredient-item" v-for="(ing, i) in seasoningIngredients" :key="i">
              <text class="ing-name">{{ ing.name }}</text>
              <view class="ing-right">
                <text class="ing-amount">{{ ing.amount }} 🧂</text>
                <!-- 移除重复的"调料"标签，因为外层已经分类。直接提供加购入口即可 -->
                <view class="add-icon" @click.stop="addSingleToCart(ing)">+</view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">烹饪步骤</text>
        <text class="step-hint">点击步骤可标记完成</text>
        <view class="step-list">
          <view class="step-item" 
                v-for="(step, i) in recipe.steps" :key="i"
                :class="{ 'step-completed': completedSteps.includes(i) }"
                @click="toggleStep(i)">
            <view class="step-index">{{ i + 1 }}</view>
            <text class="step-text">{{ step }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="footer-actions" v-if="recipe.own">
      <button class="action-btn delete-btn" @click="deleteRecipe">删除菜谱</button>
      <button class="action-btn edit-btn" @click="editRecipe">编辑菜谱</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import eatCo from '@/common/localDB.js'
import recipeApi from '@/common/api/recipe.js'
import config from '@/common/config.js'
import shopApi from '@/common/api/shop.js'

const familyCode = uni.getStorageSync('family_code') || 'default_family';
const defaultCover = ref(config.imgBaseUrl + '/uploads/recipe-covers/fam_230122da8f990571/mpqporl6_477ca5c44ac3.jpg')

// 主题系统
const themes = [
  { name: '温柔粉', color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
  { name: '清新绿', color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
  { name: '雾霾蓝', color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
  { name: '暖杏黄', color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
]
const currentTheme = ref(uni.getStorageSync('current_theme') || 0)
const themeStyle = computed(() => {
  const t = themes[currentTheme.value]
  return `
    --primary: ${t.color};
    --primary-grad: ${t.gradient};
    --primary-light: ${t.light};
    --primary-shadow: ${t.shadow};
  `
})

const recipeId = ref('')
const recipe = ref(null)
const stockList = ref([])

const completedSteps = ref([])

onLoad((options) => {
  if (options.id) {
    recipeId.value = options.id
  }
})

onShow(() => {
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  loadStock()
  loadRecipe()
})

const loadStock = async () => {
  stockList.value = await eatCo.getStockList(familyCode)
}

const loadRecipe = async () => {
  try {
    const res = await recipeApi.getFamilyRecipeItem(familyCode,recipeId.value)
    if (res && res.data) {
      recipe.value = res.data.recipe
    } else {
      uni.showToast({ title: '菜谱不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
}

const seasoningKeywords = ['盐', '糖', '生抽', '老抽', '料酒', '醋', '姜', '葱', '大蒜', '蒜', '油', '花椒', '八角', '胡椒', '酱', '精', '孜然']

const ingredientsWithStock = computed(() => {
  if (!recipe.value) return []
  return (recipe.value.ingredients || []).map(ing => {
    // 优先读取录入时保存的真实归类
    let isSeasoning = ing.isSeasoning
    if (isSeasoning === undefined) {
      isSeasoning = seasoningKeywords.some(key => ing.name.includes(key))
    }
    const hasInStock = !isSeasoning && stockList.value.some(s => s.has && s.name.includes(ing.name))
    return { ...ing, hasInStock, isSeasoning }
  })
})

const mainIngredients = computed(() => {
  return ingredientsWithStock.value.filter(ing => !ing.isSeasoning)
})

const seasoningIngredients = computed(() => {
  return ingredientsWithStock.value.filter(ing => ing.isSeasoning)
})

const toggleFavorite = async () => {
  if (!recipe.value) return
  const newFav = !recipe.value.favorite
  recipe.value.favorite = newFav
  
  try {
    const familyCode = uni.getStorageSync('family_code') || 'default_family';
    // 保留需要更新的属性
    const submitData = { ...recipe.value, favorite: newFav }
    await recipeApi.updateFamilyRecipe(familyCode, submitData, recipe.value.cover)
    uni.showToast({ title: newFav ? '已收藏' : '已取消', icon: 'none' })
  } catch (e) {
    recipe.value.favorite = !newFav
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// 供一键加入和单点加入调用
const pushToShop = async (ing) => {
  const familyCode = uni.getStorageSync('family_code') || 'default_family';
  try {
    const shopListRes = await shopApi.getFamilyShoppingItems(familyCode)
    const shopList = shopListRes.data.shoppingItems || []
    
    const alreadyInShop = shopList.some(s => !s.done && (s.name.includes(ing.name) || ing.name.includes(s.name)))
    if (!alreadyInShop) {
      await shopApi.saveFamilyShoppingItem(familyCode, {
        name: ing.name,
        num: ing.amount,
        price: '',
        done: false
      })
      return true
    }
  } catch (e) {
    console.error('真实接口加购失败:', e)
  }
  return false
}

const addSingleToCart = async (ing) => {
  const added = await pushToShop(ing)
  if (added) {
    uni.showToast({ title: '已加入购物清单', icon: 'none' })
  } else {
    uni.showToast({ title: '清单中已存在', icon: 'none' })
  }
}

const addMissingToCart = async () => {
  // 不过滤调料，如果不是调料且没有库存，就加入。如果是调料则忽略（用户通过单点旁边的加号添加）
  const missing = ingredientsWithStock.value.filter(ing => !ing.isSeasoning && !ing.hasInStock)
  if (missing.length === 0) {
    return uni.showToast({ title: '没有需要购买的主食材', icon: 'none' })
  }
  
  let addedCount = 0
  for (const ing of missing) {
    if (await pushToShop(ing)) addedCount++
  }
  
  if (addedCount > 0) {
    uni.showToast({ title: `已将 ${addedCount} 种材料加入清单`, icon: 'none' })
  } else {
    uni.showToast({ title: '缺少的食材已在清单中', icon: 'none' })
  }
}

const toggleStep = (index) => {
  const idx = completedSteps.value.indexOf(index)
  if (idx > -1) {
    completedSteps.value.splice(idx, 1)
  } else {
    completedSteps.value.push(index)
  }
}

const editRecipe = () => {
  uni.navigateTo({ url: `/pages/recipe/component/edit?recipeId=${recipeId.value}` })
}

const deleteRecipe = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个菜谱吗？',
    confirmColor: '#FF7DA8',
    success: async (res) => {
      if (res.confirm) {
        try {
          await recipeApi.deleteFamilyRecipe(recipe.value.id || recipe.value._id)
          uni.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 1000)
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style lang="less" scoped>
.page {
  min-height: 100vh;
  padding-bottom: 220rpx;
}
.cover-img {
  width: 100%;
  height: 580rpx;
  display: block;
}
.content {
  padding: 0 30rpx;
  margin-top: -80rpx;
  position: relative;
  z-index: 10;
}
.header-card {
  background: #ffffff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 16rpx 60rpx rgba(0,0,0,0.06);
  margin-bottom: 30rpx;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30rpx;
}
.title {
  font-size: 44rpx;
  font-weight: 900;
  color: #2c3e50;
  flex: 1;
  line-height: 1.3;
  letter-spacing: 2rpx;
}
.favorite-btn {
  font-size: 28rpx;
  background: #f8f9fa;
  padding: 12rpx 30rpx;
  border-radius: 100rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  margin-left: 20rpx;
  transition: transform 0.2s;
  &:active {
    transform: scale(0.95);
  }
}
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.tag {
  padding: 12rpx 24rpx;
  border-radius: 100rpx;
  font-size: 24rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
}
.section-card {
  background: #ffffff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 12rpx 40rpx rgba(0,0,0,0.03);
  margin-bottom: 30rpx;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}
.section-title {
  font-size: 36rpx;
  font-weight: 900;
  color: #2c3e50;
  letter-spacing: 1rpx;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: -8rpx;
    left: 0;
    width: 40rpx;
    height: 6rpx;
    background: var(--primary);
    border-radius: 10rpx;
  }
}
.add-cart-btn {
  font-size: 24rpx;
  background: var(--primary-grad);
  color: #fff;
  margin: 0;
  padding: 0 32rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 100rpx;
  box-shadow: 0 8rpx 20rpx var(--primary-shadow);
  font-weight: bold;
  transition: opacity 0.2s;
  &::after { border: none; }
  &:active { opacity: 0.8; }
}
.ingredient-group {
  margin-bottom: 48rpx;
  &:last-child {
    margin-bottom: 0;
  }
}
.group-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #95a5a6;
  display: block;
  margin-bottom: 10rpx;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #ecf0f1;
}
.ingredient-list {
  display: flex;
  flex-direction: column;
}
.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx dashed #ecf0f1;
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}
.ing-name {
  font-size: 32rpx;
  color: #34495e;
  font-weight: 800;
}
.ing-right {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.ing-amount {
  font-size: 30rpx;
  color: #7f8c8d;
  font-weight: bold;
}
.status-label {
  font-size: 22rpx;
  color: #95a5a6;
  background: #f1f2f6;
  padding: 8rpx 20rpx;
  border-radius: 100rpx;
  font-weight: 800;
  &.has-stock {
    background: var(--primary-light);
  }
  &.seasoning-label {
    background: #FFFAF0;
    color: #F39C12;
  }
}
.add-icon {
  width: 48rpx;
  height: 48rpx;
  background: #f1f2f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #2c3e50;
  padding-bottom: 4rpx;
  transition: all 0.2s;
  &:active {
    background: var(--primary);
    color: #fff;
    transform: scale(0.9);
  }
}
.step-hint {
  display: block;
  font-size: 22rpx;
  color: #bdc3c7;
  margin-top: -30rpx;
}
.step-list {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  margin-top: 40rpx;
}
.step-item {
  display: flex;
  align-items: flex-start;
  gap: 30rpx;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 26rpx;
    top: 60rpx;
    bottom: -50rpx;
    width: 4rpx;
    background: #f1f2f6;
    z-index: 0;
  }
  &:last-child::before {
    display: none;
  }
  &.step-completed {
    opacity: 0.5;
    .step-index {
      background: #bdc3c7 !important;
      box-shadow: none !important;
    }
    .step-text {
      text-decoration: line-through;
      color: #95a5a6;
    }
  }
}
.step-index {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 4rpx 10rpx var(--primary-shadow);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
  font-weight: 900;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}
.step-text {
  font-size: 32rpx;
  color: #2c3e50;
  line-height: 1.7;
  flex: 1;
  padding-top: 6rpx;
  font-weight: 500;
}

/* 底部操作区 */
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx 40rpx 60rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  display: flex;
  gap: 30rpx;
  box-shadow: 0 -10rpx 30rpx rgba(0,0,0,0.03);
  z-index: 100;
}
.action-btn {
  flex: 1;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 100rpx;
  font-size: 32rpx;
  font-weight: 900;
  transition: transform 0.2s;
  &::after { border: none; }
  &:active { transform: scale(0.98); }
}
.delete-btn {
  background: #f1f2f6;
  color: #7f8c8d;
}
.edit-btn {
  background: var(--primary-grad);
  color: #fff;
  box-shadow: 0 10rpx 24rpx var(--primary-shadow);
}
</style>
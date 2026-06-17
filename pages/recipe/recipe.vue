<template>
  <custom-header title="菜谱" icon="🍳" />
  <gourmet-refresher :refreshing="refreshing" type="recipe" />
  <view class="page" @click="exitEditMode" :style="themeStyle">
    <view class="search-panel">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchText"
          placeholder="搜索菜谱 / 食材"
          placeholder-style="color:#C9C9C9"
        />
      </view>
      <button class="create-btn" @click="openEditor">+ 新建</button>
    </view>

    <view class="category-wrapper">
      <scroll-view class="category-bar" scroll-x="true" :show-scrollbar="false">
        <view 
            class="category-chip"
            :class="{ active: currentCategory === '全部' }"
            @click="changeCategory('全部')"
          >
            <text class="category-text">全部</text>
          </view>
        <view
          class="category-chip"
          :class="{ active: currentCategory === category.name }"
          v-for="category in categories"
          :key="category.name"
          @click="changeCategory(category.name)"
        >{{ category.name }}</view>
      </scroll-view>
      <view class="category-chip add-chip" @click="openCategoryModal">+</view>
    </view>

    <!-- 分类管理弹窗 -->
    <view class="modal-mask" v-if="showCategoryModal" @click="closeCategoryModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">管理分类</text>
        <view class="cat-manage-list">
          <view class="cat-manage-item" v-for="cat in categories" :key="cat._id">
            <text>{{ cat.name }}</text>
            <text class="del-cat" @click="deleteCategory(cat)">删除</text>
          </view>
        </view>
        <view class="add-cat-box">
          <input class="add-cat-input" v-model="newCategoryName" placeholder="新分类名称" />
          <view class="add-cat-btn-modal" @click="addCategory">添加</view>
        </view>
      </view>
    </view>

    <!-- 编辑模式提示栏 -->
    <view class="edit-bar" v-if="editMode" @click.stop>
      <text class="edit-bar-tip">长按菜谱可删除，点击空白退出</text>
      <text class="edit-bar-done" @click="exitEditMode">完成</text>
    </view>

    <view class="empty-state" v-if="visibleRecipes.length === 0">
      <text v-if="searchText || currentCategory !== '全部'">未找到匹配菜谱，试试清空搜索或切换分类</text>
      <text v-else>暂无菜谱，点击右上角创建新菜谱</text>
    </view>
    
    <view class="card-list" v-else>
      <view
        class="recipe-card"
        :class="{ 'edit-shake': editMode }"
        v-for="recipe in visibleRecipes"
        :key="recipe.id"
        @click.stop="handleCardClick(recipe)"
        @longpress="enterEditMode"
      >
        <!-- 删除角标按钮 -->
        <view class="delete-badge" v-if="editMode" @click.stop="confirmDelete(recipe)">
          <text class="delete-badge-icon">✕</text>
        </view>
        <view class="cover-wrapper">
          <image class="cover" :src="config.imgBaseUrl + recipe.cover || defaultCover" mode="aspectFill" />
          <text class="category-tag">{{ recipe.category }}</text>
        </view>
        <view class="card-body">
          <view class="recipe-title-row">
            <text class="recipe-name">{{ recipe.name }}</text>
            <view class="favorite" @click.stop="toggleFavorite(recipe)">
              <text class="fav-icon">{{ recipe.favorite ? '❤️' : '🤍' }}</text>
            </view>
          </view>
          <view class="recipe-info">
            <text class="info-text">⏱ {{ recipe.duration }}</text>
            <text class="info-text">🔥 {{ recipe.kcal }}kcal</text>
          </view>
        </view>
      </view>

      <view class="more-row" v-if="page * pageSize < filteredRecipes.length">
        <button class="more-btn" @click.stop="loadMore">加载更多</button>
      </view>
      
      <!-- 底部防遮挡安全区 -->
      <view class="list-bottom-safe"></view>
    </view>
    <custom-tabbar />
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import recipeApi from '@/common/api/recipe.js'
import config from '@/common/config'

let familyCode = uni.getStorageSync('family_code') || 'default_family';

const refreshing = ref(false)
const searchText = ref('')
const page = ref(1)
const pageSize = ref(6)

// 实时搜索：输入变化时重置分页，确保从第一页展示过滤结果
watch(searchText, () => {
  page.value = 1
})
const recipes = ref([])

onPullDownRefresh(async () => {
  refreshing.value = true
  familyCode = uni.getStorageSync('family_code') || 'default_family'
  try {
    await Promise.all([
      loadCategories(),
      loadRecipes(),
      new Promise(resolve => setTimeout(resolve, 1500)) // 确保治愈平底锅多快乐弹跳一会
    ])
  } catch (e) {
    console.error(e)
  } finally {
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
})

// =========================分类管理=========================
const currentCategory = ref('全部')
const categories = ref([])

const loadCategories = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await recipeApi.getFamilyRecipeCategories(familyCode)
    categories.value = res.data.categories || []
    uni.hideLoading()
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    uni.hideLoading()
  }
}

const changeCategory = (category) => {
  currentCategory.value = category
  loadRecipes()
  page.value = 1
}

const showCategoryModal = ref(false)
const newCategoryName = ref('')

const openCategoryModal = () => {
  showCategoryModal.value = true
}
const closeCategoryModal = () => {
  showCategoryModal.value = false
  newCategoryName.value = ''
}


const addCategory = async () => {
  const name = newCategoryName.value.trim()
  if (!name) return
  if (categories.value.some(c => c.name === name)) {
    uni.showToast({ title: '分类已存在', icon: 'none' })
    return
  }
  let recipeCategoryJson = {name: name, sortOrder: 60}
  try {
    await recipeApi.saveFamilyRecipeCategory(familyCode, recipeCategoryJson)
    newCategoryName.value = ''
    await loadCategories()
    uni.showToast({ title: '添加成功', icon: 'none' })
  } catch (e) {
    console.error('添加分类失败', e)
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

const deleteCategory = async (cat) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除「${cat.name}」分类吗？`,
    confirmColor: '#FF7DA8',
    success: async (res) => {
      if (res.confirm) {
        try {
          await recipeApi.deleteFamilyRecipeCategory(cat.id)
          await loadCategories()
          if (currentCategory.value === cat.name) {
            currentCategory.value = '全部'
            page.value = 1
          }
          uni.showToast({ title: '已删除', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// ====================================分类管理====================================

const defaultCover = ref(config.imgBaseUrl + '/uploads/recipe-covers/fam_230122da8f990571/mpqporl6_477ca5c44ac3.jpg')

const makeRecipe = (item, index) => {
  let recipeDetails = {}
  if (item.recipeJson) {
    recipeDetails = typeof item.recipeJson === 'string' ? JSON.parse(item.recipeJson) : item.recipeJson
  }
  return {
    id: item.id || recipeDetails.id || `recipe_${Date.now()}_${index}`,
    name: item.name || recipeDetails.name || '新菜谱',
    category: item.category || recipeDetails.category || '家常菜',
    cover: item.coverUrl || item.cover || recipeDetails.cover || defaultCover,
    duration: item.duration || recipeDetails.duration || '30分钟',
    difficulty: item.difficulty || recipeDetails.difficulty || '中等',
    ingredients: item.ingredients || recipeDetails.ingredients || [],
    steps: item.steps || recipeDetails.steps || [],
    favorite: item.favorite !== undefined ? !!item.favorite : !!recipeDetails.favorite,
    own: item.own !== undefined ? item.own : (recipeDetails.own !== undefined ? recipeDetails.own : true),
    kcal: item.kcal || recipeDetails.kcal || Math.floor(Math.random() * 400 + 100), // 模拟热量数据
    healthTag: item.healthTag || recipeDetails.healthTag || (['低脂', '高蛋白', '均衡', '营养'][index % 4])
  }
}

const loadRecipes = async () => {
  try {
    const res = await recipeApi.getFamilyRecipeByMember(familyCode,currentCategory.value || '')
    recipes.value = res.data.recipeList || []
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const filteredRecipes = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  return recipes.value.filter(item => {
    const categoryMatch = currentCategory.value === '全部' || item.category === currentCategory.value
    const textMatch = !keyword || item.name.toLowerCase().includes(keyword) || item.ingredients.some(ing => ing.name.toLowerCase().includes(keyword))
    return categoryMatch && textMatch
  })
})

const visibleRecipes = computed(() => {
  return filteredRecipes.value.slice(0, page.value * pageSize.value)
})


const loadMore = () => {
  if (page.value * pageSize.value < filteredRecipes.value.length) {
    page.value += 1
  }
}

const toggleFavorite = async (item) => {
  const newFav = !item.favorite
  item.favorite = newFav // 乐观更新
  try {
    const submitData = { ...item, favorite: newFav }
    await recipeApi.updateFamilyRecipe(familyCode, submitData, item.cover)
    uni.showToast({ title: newFav ? '已收藏' : '已取消', icon: 'none' })
    loadRecipes()
  } catch (e) {
    item.favorite = !newFav // 失败回滚
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/recipe/component/detail?id=${id}` })
}

const openEditor = () => {
  uni.navigateTo({ url: '/pages/recipe/component/edit' })
}

// ===== 编辑模式 & 删除 =====
const editMode = ref(false)

const enterEditMode = () => {
  editMode.value = true
}

const exitEditMode = () => {
  editMode.value = false
}

const handleCardClick = (recipe) => {
  if (editMode.value) {
    // 编辑模式下点卡片主体退出编辑模式（@click.stop 阻断了冒泡，需在此处主动退出）
    exitEditMode()
    return
  }
  console.log(recipe, '=================>>')
  goDetail(recipe.id)
}

const confirmDelete = (recipe) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除「${recipe.name}」吗？此操作不可恢复。`,
    confirmColor: '#FF7DA8',
    success: async (res) => {
      if (res.confirm) {
        try {
          await recipeApi.deleteFamilyRecipe(familyCode,recipe._id || recipe.id)
          recipes.value = recipes.value.filter(r => (r._id !== recipe._id && r.id !== recipe.id))
          uni.showToast({ title: '已删除', icon: 'success' })
          loadRecipes()
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

onShow(() => {
  uni.hideTabBar({ animation: false })
  const code = uni.getStorageSync('family_code')
  if (!code) {
    uni.switchTab({
      url: '/pages/family/family',
      success: () => {
        uni.showToast({
          title: '请先创建或加入家庭',
          icon: 'none',
          duration: 2000
        })
      }
    })
    return
  }
  familyCode = code
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  loadCategories()
  loadRecipes()
  exitEditMode()
})

onReachBottom(() => {
  loadMore()
})

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
</script>

<style lang="less" scoped>
.page {
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 100%);
  // background-color: var(--primary-light);
  height: ~"calc(100vh - 400rpx)";
  padding: 30rpx 24rpx 180rpx;
}

/* 顶部搜索与操作区 */
.search-panel {
  position: sticky;
  top: 80rpx; /* account for custom header */
  z-index: 100;
  background: var(--primary-light);
  padding-bottom: 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 10rpx;
}
.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  height: 64rpx;
  box-sizing: border-box;
  padding: 0 30rpx;
  background: #ffffff;
  border-radius: 100rpx;
  box-shadow: 0 12rpx 30rpx rgba(0,0,0,0.03);
  transition: all 0.3s ease;
}
.search-icon {
  margin-right: 16rpx;
  font-size: 28rpx;
  color: var(--primary);
  transition: transform 0.3s ease;
}
.search-input {
  flex: 1;
  height: 36rpx;
  font-size: 26rpx;
  color: #333;
  border: none;
  background: transparent;
}
.create-btn {
  border-radius: 100rpx;
  padding: 0 36rpx;
  height: 64rpx;
  line-height: 60rpx;
  font-size: 26rpx;
  font-weight: bold;
  margin: 0;
  background: var(--primary-grad);
  color: #fff;
  border: none;
  box-shadow: 0 6rpx 16rpx var(--primary-shadow);
  transition: transform 0.2s;
  &:active { transform: scale(0.95); }
}

/* 分类滞动条 */
.category-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  width: 100%;
}
.category-bar {
  flex: 1;
  white-space: nowrap;
  padding: 0 4rpx;
  min-width: 0;
}
.category-chip {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 28rpx; /* 调矮上下padding */
  border-radius: 100rpx;
  background: rgba(0, 0, 0, 0.04);
  color: #888;
  font-size: 25rpx;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-right: 14rpx;
  margin-left: 4rpx;
  border: 2rpx solid transparent;
  letter-spacing: 0.5rpx;
}
.category-chip.active {
  background: var(--primary-grad);
  color: #fff;
  transform: scale(1.04);
  box-shadow: 0 8rpx 20rpx var(--primary-shadow);
  border-color: transparent;
}

.add-chip {
  font-size: 26rpx;
  color: var(--primary);
  background: var(--primary-light);
  flex-shrink: 0;
  margin-right: 0;
  margin-left: 14rpx;
  border-radius: 50%;
  border: 1px solid var(--primary);
  width: 40rpx; /* 调小圆形添加分类按钮 */
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

/* 编辑弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  width: 620rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  box-sizing: border-box;
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.1);
}

.modal-title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  color: #333;
  font-weight: 800;
  margin-bottom: 40rpx;
}

.cat-manage-list {
  max-height: 400rpx;
  overflow-y: auto;
  margin-bottom: 30rpx;
}
.cat-manage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #F8F9FA;
  font-size: 28rpx;
  color: #2C3E50;
}
.del-cat {
  color: #FF4757;
  font-size: 24rpx;
  font-weight: bold;
}
.add-cat-box {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}
.add-cat-input {
  flex: 1;
  background: #F8F9FA;
  height: 80rpx;
  border-radius: 20rpx;
  padding: 0 30rpx;
  font-size: 26rpx;
}
.add-cat-btn-modal {
  background: var(--primary);
  color: #fff;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 30rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: bold;
}

/* 编辑模式提示栏 */
.edit-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--primary-light);
  border-radius: 20rpx;
  padding: 18rpx 30rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid var(--primary);
}
.edit-bar-tip {
  font-size: 24rpx;
  color: var(--primary);
}
.edit-bar-done {
  font-size: 26rpx;
  font-weight: 800;
  color: var(--primary);
  padding: 8rpx 20rpx;
  background: #fff;
  border-radius: 100rpx;
  box-shadow: 0 4rpx 12rpx var(--primary-shadow);
}

/* 卡片列表 */
.card-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-content: start;
  gap: 6rpx;
  height: 70.6vh;
  overflow: auto;
  padding: 4rpx;
  box-sizing: border-box;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.card-list::-webkit-scrollbar { display: none; }

.recipe-card {
  position: relative;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, margin 0.2s;
  display: flex;
  flex-direction: column;
  overflow: visible;
  &:active {
    transform: scale(0.97);
  }
}

.cover-wrapper {
  position: relative;
  width: 100%;
  height: 320rpx;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  overflow: hidden;
  background-color: var(--primary-light);
  
  .cover {
    width: 100%;
    height: 100%;
  }

  .category-tag {
    position: absolute;
    left: 10rpx;
    top: 10rpx;
    padding: 4rpx 10rpx;
    border-radius: 10rpx;
    font-size: 18rpx;
    font-weight: 700;
    color: var(--primary);
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }
}


/* 删除角标 */
.delete-badge {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  z-index: 10; 
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #FF4757;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(255, 71, 87, 0.45);
  animation: badge-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.delete-badge-icon {
  color: #fff;
  font-size: 22rpx;
  font-weight: 900;
  line-height: 1;
}

/* 编辑模式抖动动画 */
.edit-shake {
  animation: card-shake 0.5s ease infinite alternate;
  transform-origin: center;
}
@keyframes card-shake {
  0%   { transform: rotate(-0.5deg); }
  100% { transform: rotate(0.5deg); }
}
@keyframes badge-pop {
  0%   { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.card-body {
  padding: 20rpx 20rpx 22rpx;
}
.recipe-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}
.recipe-name {
  font-size: 30rpx;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 0;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  letter-spacing: 0.5rpx;
  flex: 1;
  margin-right: 12rpx;
}
.favorite {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
  transition: transform 0.2s;
  flex-shrink: 0;
  
  .fav-icon {
    font-size: 20rpx;
    line-height: 1;
  }

  &:active {
    transform: scale(1.2);
  }
}
.recipe-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.info-text {
  font-size: 19rpx;
  color: #7f8c8d;
  background: #f8f9fa;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  
  &.health-tag {
    background: #F0F9F4;
    color: #4DB88F;
    border: 1rpx solid #E8F5E9;
  }
}

/* 更多及空状态 */
.more-row {
  grid-column: span 2;
  padding: 30rpx 0;
  display: flex;
  justify-content: center;
}
.more-btn {
  width: 260rpx;
  height: 80rpx;
  border-radius: 100rpx;
  border: none;
  background: #ffffff;
  color: #555;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.03);
}
.empty-state {
  margin-top: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #95a5a6;
  font-size: 28rpx;
  padding: 60rpx 0;
}
.list-bottom-safe {
  grid-column: span 2;
  height: 180rpx;
  flex-shrink: 0;
}
</style>

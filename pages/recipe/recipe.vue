<template>
  <view class="page" @click="exitEditMode" :style="themeStyle">
    <custom-header title="菜谱" icon="🍳" />
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

    <scroll-view class="category-bar" scroll-x="true" show-scrollbar="false">
      <view
        class="category-chip"
        :class="{ active: currentCategory === category }"
        v-for="category in categories"
        :key="category"
        @click="changeCategory(category)"
      >{{ category }}</view>
    </scroll-view>

    <!-- 编辑模式提示栏 -->
    <view class="edit-bar" v-if="editMode" @click.stop>
      <text class="edit-bar-tip">长按菜谱可删除，点击空白退出</text>
      <text class="edit-bar-done" @click="exitEditMode">完成</text>
    </view>

    <view class="card-list">
      <view
        class="recipe-card"
        :class="{ 'edit-shake': editMode }"
        v-for="recipe in visibleRecipes"
        :key="recipe.id"
        @click.stop="handleCardClick(recipe.id)"
        @longpress="enterEditMode"
      >
        <!-- 删除角标按钮 -->
        <view class="delete-badge" v-if="editMode" @click.stop="confirmDelete(recipe)">
          <text class="delete-badge-icon">✕</text>
        </view>

        <image class="cover" :src="recipe.cover || defaultCover" mode="aspectFill" />
        <view class="card-body">
          <view class="card-header">
            <text class="recipe-name">{{ recipe.name }}</text>
            <text class="category-tag">{{ recipe.category }}</text>
          </view>
          <view class="recipe-info">
            <text class="info-text">⏱ {{ recipe.duration }}</text>
            <text class="info-text">🔥 {{ recipe.kcal }}kcal</text>
            <text class="info-text health-tag">{{ recipe.healthTag }}</text>
            <text class="favorite" @click.stop="toggleFavorite(recipe)">{{ recipe.favorite ? '❤️' : '🤍' }}</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="visibleRecipes.length === 0">
        <text v-if="searchText || currentCategory !== '全部'">未找到匹配菜谱，试试清空搜索或切换分类</text>
        <text v-else>暂无菜谱，点击右上角创建新菜谱</text>
      </view>

      <view class="more-row" v-if="page * pageSize < filteredRecipes.length">
        <button class="more-btn" @click.stop="loadMore">加载更多</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'

const searchText = ref('')
const currentCategory = ref('全部')
const page = ref(1)
const pageSize = ref(6)
const recipes = ref([])

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

const categories = ['全部', '家常菜', '减脂', '增肌', '健康', '儿童', '汤品']
const defaultCover = 'https://pic.rmb.bdstatic.com/bjh/240813/dump/2f9e7e45efdb1b9134b9c9af309ffe33.png'

const makeRecipe = (item, index) => ({
  id: item.id || `recipe_${Date.now()}_${index}`,
  name: item.name || '新菜谱',
  category: item.category || '家常菜',
  cover: item.cover || defaultCover,
  duration: item.duration || '30分钟',
  difficulty: item.difficulty || '中等',
  ingredients: item.ingredients || [],
  steps: item.steps || [],
  favorite: !!item.favorite,
  own: item.own !== undefined ? item.own : true,
  kcal: item.kcal || Math.floor(Math.random() * 400 + 100), // 模拟热量数据
  healthTag: item.healthTag || (['低脂', '高蛋白', '均衡', '营养'][index % 4])
})

import eatCo from '@/common/localDB.js'

const loadRecipes = async () => {
  const familyId = uni.getStorageSync('family_id') || 'default_family';
  try {
    const data = await eatCo.getRecipeList(familyId)
    recipes.value = data.map((item, index) => {
      const formatted = makeRecipe(item, index)
      formatted.id = item._id
      formatted._id = item._id
      return formatted
    })
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

const changeCategory = (category) => {
  currentCategory.value = category
  page.value = 1
}

const loadMore = () => {
  if (page.value * pageSize.value < filteredRecipes.value.length) {
    page.value += 1
  }
}

const toggleFavorite = async (item) => {
  const newFav = !item.favorite
  item.favorite = newFav // 乐观更新
  try {
    await eatCo.updateRecipe(item._id, { favorite: newFav })
    uni.showToast({ title: newFav ? '已收藏' : '已取消', icon: 'none' })
  } catch (e) {
    item.favorite = !newFav // 失败回滚
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/recipe/detail?recipeId=${id}` })
}

const openEditor = () => {
  uni.navigateTo({ url: '/pages/recipe/edit' })
}

// ===== 编辑模式 & 删除 =====
const editMode = ref(false)

const enterEditMode = () => {
  editMode.value = true
}

const exitEditMode = () => {
  editMode.value = false
}

const handleCardClick = (id) => {
  if (editMode.value) {
    // 编辑模式下点卡片主体退出编辑模式（@click.stop 阻断了冒泡，需在此处主动退出）
    exitEditMode()
    return
  }
  goDetail(id)
}

const confirmDelete = (recipe) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除「${recipe.name}」吗？此操作不可恢复。`,
    confirmColor: '#FF7DA8',
    success: async (res) => {
      if (res.confirm) {
        try {
          await eatCo.deleteRecipe(recipe._id)
          recipes.value = recipes.value.filter(r => r._id !== recipe._id)
          uni.showToast({ title: '已删除', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

onShow(() => {
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  loadRecipes()
  exitEditMode()
})

onReachBottom(() => {
  loadMore()
})
</script>

<style lang="less" scoped>
.page {
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 100%);
  background-color: var(--primary-light);
  // min-height: ~"calc(100vh - 240rpx)";
  padding: 30rpx 24rpx 40rpx;
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
  padding: 20rpx 30rpx;
  background: #ffffff;
  border-radius: 100rpx;
  box-shadow: 0 12rpx 30rpx rgba(0,0,0,0.03);
  transition: all 0.3s ease;
}
.search-icon {
  margin-right: 16rpx;
  font-size: 32rpx;
  color: var(--primary);
  transition: transform 0.3s ease;
}
.search-input {
  flex: 1;
  height: 26rpx;
  font-size: 28rpx;
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
.category-bar {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 24rpx;
  padding: 0 4rpx;
}
.category-chip {
  display: inline-flex;
  align-items: center;
  padding: 14rpx 36rpx;
  border-radius: 100rpx;
  background: rgba(0, 0, 0, 0.04);
  color: #888;
  font-size: 27rpx;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-right: 16rpx;
  margin-left: 4rpx;
  border: 2rpx solid transparent;
  letter-spacing: 0.5rpx;
}
.category-chip.active {
  background: var(--primary-grad);
  color: #fff;
  transform: scale(1.05);
  box-shadow: 0 8rpx 20rpx var(--primary-shadow);
  border-color: transparent;
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
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  height: 69vh;
  overflow: auto;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.card-list::-webkit-scrollbar { display: none; }

.recipe-card {
  position: relative;
  background: #ffffff;
  border-radius: 40rpx;
  overflow: visible;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
  &:active {
    transform: scale(0.98);
  }
}

/* 卡片主体圆角裁切：让图片不溢出 */
.recipe-card > .cover {
  border-radius: 40rpx 40rpx 0 0;
  overflow: hidden;
}

/* 删除角标 */
.delete-badge {
  position: absolute;
  top: -18rpx;
  right: -18rpx;
  z-index: 10;
  width: 56rpx;
  height: 56rpx;
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
  font-size: 26rpx;
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
.cover {
  width: 100%;
  height: 320rpx;
  display: block;
  background-color: var(--primary-light);
}
.card-body {
  padding: 30rpx;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.recipe-name {
  font-size: 34rpx;
  font-weight: 900;
  color: #2c3e50;
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  letter-spacing: 1rpx;
}
.category-tag {
  padding: 8rpx 20rpx;
  border-radius: 100rpx;
  font-size: 22rpx;
  font-weight: 800;
  margin-left: 20rpx;
  color: var(--primary);
  background-color: var(--primary-light);
}
.recipe-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.info-text {
  font-size: 24rpx;
  color: #7f8c8d;
  background: #f8f9fa;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  
  &.health-tag {
    background: #F0F9F4;
    color: #4DB88F;
    border: 1rpx solid #E8F5E9;
  }
}
.favorite {
  margin-left: auto;
  font-size: 36rpx;
  padding: 10rpx;
  color: var(--primary);
  transition: transform 0.2s;
  &:active {
    transform: scale(1.3);
  }
}

/* 更多及空状态 */
.more-row {
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
</style>

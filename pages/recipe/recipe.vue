<template>
  <view class="page">
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

    <view class="card-list">
      <view class="recipe-card" v-for="recipe in visibleRecipes" :key="recipe.id" @click="goDetail(recipe.id)">
        <image class="cover" :src="recipe.cover || defaultCover" mode="aspectFill" />
        <view class="card-body">
          <view class="card-header">
            <text class="recipe-name">{{ recipe.name }}</text>
            <text class="category-tag">{{ recipe.category }}</text>
          </view>
          <view class="recipe-info">
            <text class="info-text">⏱ {{ recipe.duration }}</text>
            <text class="info-text">🌶 {{ recipe.difficulty }}</text>
            <text class="favorite" @click.stop="toggleFavorite(recipe)">{{ recipe.favorite ? '❤️' : '🤍' }}</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="visibleRecipes.length === 0">
        <text v-if="searchText || currentCategory !== '全部'">未找到匹配菜谱，试试清空搜索或切换分类</text>
        <text v-else>暂无菜谱，点击右上角创建新菜谱</text>
      </view>

      <view class="more-row" v-if="page * pageSize < filteredRecipes.length">
        <button class="more-btn" @click="loadMore">加载更多</button>
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

const categories = ['全部', '家常菜', '快手菜', '素食', '肉类', '汤品']
const defaultCover = 'https://img-blog.csdnimg.cn/20240110133807328.png'

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
  own: item.own !== undefined ? item.own : true
})

const sampleRecipes = () => [
  {
    id: 'recipe_001',
    name: '蒜香鸡腿煲',
    category: '家常菜',
    cover: 'https://img.zcool.cn/community/016c62572de38faa801219c7722b65.jpg',
    duration: '45分钟',
    difficulty: '中等',
    ingredients: [
      { name: '鸡腿', amount: '2只' },
      { name: '大蒜', amount: '5瓣' },
      { name: '生抽', amount: '2勺' }
    ],
    steps: ['鸡腿清洗后切块', '热锅放油放入蒜末爆香', '加入鸡腿煸炒并加入调料慢炖'],
    favorite: false,
    own: false
  },
  {
    id: 'recipe_002',
    name: '番茄鸡蛋面',
    category: '快手菜',
    cover: 'https://img.zcool.cn/community/01d8e458cf4abea801215a0bbd2ae8.jpg',
    duration: '20分钟',
    difficulty: '简单',
    ingredients: [
      { name: '番茄', amount: '2个' },
      { name: '鸡蛋', amount: '2个' },
      { name: '挂面', amount: '1把' }
    ],
    steps: ['番茄切块炒软', '鸡蛋打散炒熟', '煮面并加入番茄鸡蛋同煮'],
    favorite: false,
    own: false
  },
  {
    id: 'recipe_003',
    name: '香菇青菜汤',
    category: '汤品',
    cover: 'https://img.zcool.cn/community/0195d95978a608a801215a0bf88a5a.jpg',
    duration: '25分钟',
    difficulty: '简单',
    ingredients: [
      { name: '香菇', amount: '6朵' },
      { name: '青菜', amount: '200g' },
      { name: '鸡汤', amount: '500ml' }
    ],
    steps: ['香菇泡发切片', '青菜洗净', '煮开汤底放入材料煮熟'],
    favorite: false,
    own: false
  }
]

const loadRecipes = () => {
  const stored = uni.getStorageSync('recipe_list') || []
  if (!stored.length) {
    recipes.value = sampleRecipes().map((item, index) => makeRecipe(item, index))
    saveRecipes()
  } else {
    recipes.value = stored.map((item, index) => makeRecipe(item, index))
  }
}

const saveRecipes = () => {
  uni.setStorageSync('recipe_list', recipes.value)
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

const toggleFavorite = (item) => {
  item.favorite = !item.favorite
  saveRecipes()
  uni.showToast({ title: item.favorite ? '已收藏' : '已取消', icon: 'none' })
}

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/recipe/detail?recipeId=${id}` })
}

const openEditor = () => {
  uni.navigateTo({ url: '/pages/recipe/edit' })
}

onShow(() => {
  loadRecipes()
})

onReachBottom(() => {
  loadMore()
})
</script>

<style lang="less" scoped>
.page {
  background: #FFF5F7;
  min-height: ~"calc(100vh - 60rpx)";
  padding: 30rpx 24rpx 40rpx;
}

/* 顶部搜索与操作区 */
.search-panel {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
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
  color: #FF7DA8;
  transition: transform 0.3s ease;
}
.search-input {
  flex: 1;
  height: 48rpx;
  font-size: 28rpx;
  color: #333;
  border: none;
  background: transparent;
}
.create-btn {
  width: 160rpx;
  height: 88rpx;
  border-radius: 100rpx;
  background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10rpx 24rpx rgba(255, 125, 168, 0.25);
  border: none;
  margin: 0;
  padding: 0;
  transition: opacity 0.2s;
  &:active { opacity: 0.8; }
}

/* 分类滚动条解决兼容横滚的方法：不使用 display flex，只用 white-space nowrap */
.category-bar {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 30rpx;
}
.category-chip {
  display: inline-block;
  padding: 16rpx 40rpx;
  border-radius: 100rpx;
  background: #ffffff;
  color: #777;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.02);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-right: 20rpx;
}
.category-chip.active {
  background: #FF7DA8;
  color: #fff;
  transform: scale(1.05);
  box-shadow: 0 12rpx 24rpx rgba(255, 125, 168, 0.3);
}

/* 卡片列表 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}
.recipe-card {
  background: #ffffff;
  border-radius: 40rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
  &:active {
    transform: scale(0.98);
  }
}
.cover {
  width: 100%;
  height: 320rpx;
  display: block;
  background-color: #FFF5F7;
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
  color: #FF7DA8;
  background-color: #FFF5F7;
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
  gap: 8rpx;
}
.favorite {
  margin-left: auto;
  font-size: 36rpx;
  padding: 10rpx;
  color: #FF7DA8;
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

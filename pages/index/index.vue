<template>
  <view class="page" :style="themeStyle">
    <!-- <custom-header title="吃什么" icon="🍓" /> -->
    <view class="header">
      <view class="title-wrap">
        <text class="main-title">🍓 今天吃什么</text>
        <view class="badge"><text>绝不纠结</text></view>
      </view>
      <text class="sub-title">好好吃饭，是对自己最大的善意</text>
    </view>

    <!-- 随机菜卡片 -->
    <view class="random-card">
      <view class="random-bg"></view>
      <text class="dish-label">今日推荐</text>
      <text class="dish-text" :class="{ 'dish-big': result !== '点击开始抽菜～' }">{{ result }}</text>
      <button class="btn-round" hover-class="btn-hover" @click="getRandomDish">⚡ 抽一个菜</button>
    </view>

    <view class="quick-title"><text>常用记账与管理</text></view>
    
    <view class="quick-group">
      <view class="quick-item" hover-class="card-hover" @click="goToStock">
        <view class="icon-wrap bg-green"><text class="icon">🍅</text></view>
        <text class="q-title">食材库存</text>
        <text class="q-desc">管理家里余粮</text>
      </view>
      <view class="quick-item" hover-class="card-hover" @click="goToShop">
        <view class="icon-wrap bg-blue"><text class="icon">🛒</text></view>
        <text class="q-title">购物清单</text>
        <text class="q-desc">去超市买点啥</text>
      </view>
    </view>
    
    <view class="quick-group">
      <view class="quick-item" hover-class="card-hover" @click="goToCost">
        <view class="icon-wrap bg-pink"><text class="icon">💰</text></view>
        <text class="q-title">花费账本</text>
        <text class="q-desc">月度开销统计</text>
      </view>
      <view class="quick-item" hover-class="card-hover" @click="goToRecipe">
        <view class="icon-wrap bg-yellow"><text class="icon">🍳</text></view>
        <text class="q-title">私房食谱</text>
        <text class="q-desc">我的拿手好菜</text>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import familyApi from '@/common/api/family.js'

const familyCode = ref(uni.getStorageSync('family_code') || 'default_family')


const defaultMenu = [
  '番茄炒蛋', '可乐鸡翅', '青椒肉丝', '蒜蓉西兰花',
  '红烧肉', '酸辣土豆丝', '水煮肉片', '香菇滑鸡', '蛋炒饭',
  '粉蒸排骨', '糖醋里脊', '麻婆豆腐', '手撕包菜', '清炒菜心'
]
const result = ref('点击开始抽菜～')

// 随机推荐池动态配置
const randomMenuPool = ref([])
const loadRandomMenuPool = async () => {
  const res = await familyApi.getFamilyRecipePoolItems(familyCode.value)
  randomMenuPool.value = res?.data?.dishes.map(dish => dish.name) || defaultMenu
}

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

onShow(() => {
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  loadRandomMenuPool() // 进入页面拉取最新的自定义随机推荐池数据
})

const getRandomDish = () => {
  let pool = [...randomMenuPool.value]

  if (pool.length === 0) {
    return uni.showToast({ title: '抽菜池为空，请去设置添加', icon: 'none' })
  }

  let times = 0
  let timer = setInterval(() => {
    times++
    const i = Math.floor(Math.random() * pool.length)
    result.value = pool[i]
    if (times > 12) clearInterval(timer)
  }, 50)
}

const goToStock = () => uni.switchTab({ url: '/pages/stock/stock' })
const goToShop = () => uni.switchTab({ url: '/pages/shop/shop' })
const goToRecipe = () => uni.switchTab({ url: '/pages/recipe/recipe' })
const goToCost = () => uni.navigateTo({ url: '/pages/cost/cost' })
</script>

<style lang="less" scoped>
.page {
  padding: 40rpx;
  background: #FAFAFA;
  min-height: ~"calc(100vh - 240rpx)";
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 100%);
  background-color: var(--primary-light);
}
.header {
  margin: 130rpx 0 60rpx;
  .title-wrap {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
  }
  .main-title {
    font-size: 52rpx;
    font-weight: 800;
    color: #333;
    letter-spacing: 2rpx;
  }
  .badge {
    background: var(--primary-grad);
    color: #fff;
    font-size: 20rpx;
    padding: 6rpx 14rpx;
    border-radius: 20rpx 20rpx 20rpx 0;
    margin-left: 20rpx;
    font-weight: bold;
    transform: translateY(-8rpx);
    box-shadow: 0 4rpx 10rpx var(--primary-shadow);
  }
  .sub-title {
    font-size: 26rpx;
    color: #999;
  }
}

.random-card {
  position: relative;
  background: var(--primary-grad);
  border-radius: 40rpx;
  padding: 80rpx 40rpx;
  text-align: center;
  box-shadow: 0 16rpx 40rpx var(--primary-shadow);
  margin-bottom: 60rpx;
  overflow: hidden;
  
  .random-bg {
    position: absolute;
    right: -40rpx;
    top: -40rpx;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
  }

  .dish-label {
    display: block;
    color: rgba(255,255,255,0.9);
    font-size: 26rpx;
    margin-bottom: 24rpx;
    letter-spacing: 4rpx;
  }
  .dish-text {
    font-size: 40rpx;
    color: #fff;
    font-weight: 500;
    transition: all 0.3s;
    display: block;
    min-height: 80rpx;
  }
  .dish-big {
    font-size: 60rpx;
    font-weight: bold;
    text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  }
  .btn-round {
    background: #fff;
    color: var(--primary);
    border-radius: 100rpx;
    font-size: 30rpx;
    font-weight: bold;
    padding: 0 60rpx;
    height: 88rpx;
    line-height: 88rpx;
    margin-top: 50rpx;
    display: inline-block;
    box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.06);
    &::after { border: none; }
  }
  .btn-hover {
    transform: scale(0.96);
  }
}

.quick-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.quick-group {
  display: flex;
  gap: 30rpx;
  margin-bottom: 30rpx;
}
.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 36rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.03);
  transition: all 0.3s;
  
  .icon-wrap {
    width: 88rpx;
    height: 88rpx;
    border-radius: 28rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 24rpx;
    .icon {
      font-size: 44rpx;
    }
  }
  .bg-green { background: #E8F7ED; }
  .bg-blue { background: #E8F0FF; }
  .bg-pink { background: #FFF0F3; }
  .bg-yellow { background: #FFF4E5; }
  
  .q-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
  }
  .q-desc {
    font-size: 22rpx;
    color: #999;
  }
}
.card-hover {
  transform: translateY(4rpx) scale(0.98);
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);
}
</style>
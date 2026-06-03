<template>
  <view class="custom-tabbar-container">
    <view class="custom-tabbar-main">
      <view
        class="custom-tabbar-item"
        v-for="(item, index) in list"
        :key="index"
        @click="switchTab(item)"
      >
        <view class="icon-wrap" :class="{'active': activeIndex === index}">
          <image
            class="tabbar-icon"
            :src="activeIndex === index ? item.selectedIconPath : item.iconPath"
            mode="aspectFit"
          />
        </view>
        <text class="tabbar-text" :class="{ active: activeIndex === index }">
          {{ item.text }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const list = [
  {
    pagePath: '/pages/index/index',
    text: '吃什么',
    iconPath: '/static/tabbar/home2.png',
    selectedIconPath: '/static/tabbar/home2-active.png'
  },
  {
    pagePath: '/pages/stock/stock',
    text: '食材库存',
    iconPath: '/static/tabbar/stock2.png',
    selectedIconPath: '/static/tabbar/stock2-active.png'
  },
  {
    pagePath: '/pages/recipe/recipe',
    text: '菜谱',
    iconPath: '/static/tabbar/recipe2.png',
    selectedIconPath: '/static/tabbar/recipe2-active.png'
  },
  {
    pagePath: '/pages/shop/shop',
    text: '购物清单',
    iconPath: '/static/tabbar/shop2.png',
    selectedIconPath: '/static/tabbar/shop2-active.png'
  },
  {
    pagePath: '/pages/family/family',
    text: '家庭',
    iconPath: '/static/tabbar/family2.png',
    selectedIconPath: '/static/tabbar/family2-active.png'
  }
]

const activeIndex = ref(0)

const updateActiveTab = () => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    const currentRoute = currentPage.route.replace(/^\//, '')
    const index = list.findIndex(item => item.pagePath.replace(/^\//, '') === currentRoute)
    if (index !== -1) {
      activeIndex.value = index
    }
  }
}

const switchTab = (item) => {
  uni.switchTab({
    url: item.pagePath
  })
}

onMounted(() => {
  // 隐藏原生tabbar
  uni.hideTabBar({ animation: false })
  updateActiveTab()
})
</script>

<style lang="less" scoped>
.custom-tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: transparent;
  padding: 10rpx 30rpx calc(16rpx + env(safe-area-inset-bottom)) 30rpx;
  pointer-events: none;
  box-sizing: border-box;
}

.custom-tabbar-main {
  pointer-events: auto;
  background: #ffffff;
  border-radius: 48rpx;
  padding: 18rpx 20rpx; /* 上下内边距 12rpx */
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-sizing: border-box;
  /* 衬底圆角内凹精致投影效果 */
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.02),
              0 12rpx 30rpx rgba(0, 0, 0, 0.08),
              inset 0 2rpx 4rpx rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(0, 0, 0, 0.04);
}

.custom-tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-wrap {
  width: 68rpx;
  height: 68rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(1.3);
  }
}
.icon-wrap.active{
  transform: scale(1.3);
}

.tabbar-icon {
  width: 100%;
  height: 100%;
}

.tabbar-text {
  font-size: 20rpx;
  color: #999999;
  margin-top: 8rpx;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &.active {
    color: #333333;
    font-weight: bold;
  }
}
</style>

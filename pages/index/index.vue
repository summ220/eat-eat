<template>
  <view class="page">
    <view class="header">
      <text class="main-title">🍓 今天吃什么？</text>
      <text class="sub-title">不纠结 · 好好吃饭</text>
    </view>

    <view class="card random-card">
      <text class="dish-text">{{ result }}</text>
      <button class="btn-round" @click="getRandomDish">抽一个菜</button>
    </view>

    <view class="quick-group">
      <view class="quick-item" @click="goToStock">
        <text class="icon">🍅</text>
        <text>食材库存</text>
      </view>
      <view class="quick-item" @click="goToRecipe">
        <text class="icon">🍳</text>
        <text>食谱</text>
      </view>
      <view class="quick-item" @click="goToShop">
        <text class="icon">🛒</text>
        <text>购物清单</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const menuList = [
  '番茄炒蛋', '可乐鸡翅', '青椒肉丝', '蒜蓉西兰花',
  '红烧肉', '酸辣土豆丝', '水煮肉片', '香菇滑鸡', '蛋炒饭'
]
const result = ref('点击开始抽菜～')

const getRandomDish = () => {
  const i = Math.floor(Math.random() * menuList.length)
  result.value = menuList[i]
}
const goToStock = () => {
  uni.switchTab({ url: '/pages/stock/stock' })
}
const goToRecipe = () => {
  uni.switchTab({ url: '/pages/recipe/recipe' })
}
const goToShop = () => {
  uni.switchTab({ url: '/pages/shop/shop' })
}
</script>

<style lang="less" scoped>
.page {
  padding: 30rpx;
  background-color: #FFF1F5;
  height: ~"calc(100vh - 60rpx)";
}
.header {
  text-align: center;
  margin: 50rpx 0 60rpx;
}
.main-title {
  font-size: 50rpx;
  font-weight: bold;
  color: #FF7DA8;
}
.sub-title {
  font-size: 26rpx;
  color: #D98CA6;
  margin-top: 10rpx;
  display: block;
}
.card {
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 10rpx 30rpx rgba(255, 173, 199, 0.15);
}
.random-card {
  padding: 90rpx 40rpx;
  text-align: center;
  margin-bottom: 40rpx;
}
.dish-text {
  font-size: 42rpx;
  color: #555;
}
.btn-round {
  background: #FF93B6;
  border-radius: 100rpx;
  color: #fff;
  font-size: 30rpx;
  padding: 20rpx 50rpx;
  margin-top: 40rpx;
  border: none;
}
.quick-group {
  display: flex;
  gap: 24rpx;
}
.quick-item {
  flex: 1;
  background: #fff;
  border-radius: 28rpx;
  padding: 40rpx 20rpx;
  text-align: center;
  box-shadow: 0 8rpx 20rpx rgba(255, 173, 199, 0.1);
  .icon {
    font-size: 40rpx;
    margin-bottom: 10rpx;
    display: block;
  }
  text {
    font-size: 28rpx;
    color: #666;
  }
}
</style>
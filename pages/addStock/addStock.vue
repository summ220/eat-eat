<template>
  <view class="page">
    <view class="card">
      <text class="title">🍅 添加食材</text>
      
      <view class="category-wrap">
        <text class="label">选择分类</text>
        <view class="tags">
          <text 
            class="tag" 
            :class="{ active: category === cat }" 
            v-for="cat in categories" 
            :key="cat" 
            @click="category = cat"
          >{{ cat }}</text>
        </view>
      </view>

      <input v-model="name" placeholder="请输入食材名称" class="input" />
      <input v-model="num" placeholder="数量：例如 3个 (选填)" class="input" />
      <button class="save-btn" @click="save">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const num = ref('')
const category = ref('蔬菜')
const categories = ['蔬菜', '肉蛋', '水产', '调料', '其他']

const save = () => {
  if (!name.value) return uni.showToast({ icon: 'none', title: '请输入名称' })
  let list = uni.getStorageSync('stock') || []
  list.unshift({ 
    name: name.value, 
    num: num.value, 
    category: category.value, 
    has: true 
  })
  uni.setStorageSync('stock', list)
  uni.navigateBack()
}
</script>

<style lang="less" scoped>
.page {
  background: #FAFAFA;
  padding: 40rpx;
  min-height: ~"calc(100vh - 80rpx)";
  background-image: linear-gradient(180deg, #FFF5F7 0%, #FAFAFA 400rpx);
}
.card {
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 16rpx 40rpx rgba(255, 141, 161, 0.08);
}
.title {
  font-size: 40rpx;
  color: #333;
  font-weight: 800;
  margin-bottom: 50rpx;
  display: block;
  text-align: center;
}
.category-wrap {
  margin-bottom: 40rpx;
}
.label {
  font-size: 28rpx;
  color: #888;
  margin-bottom: 24rpx;
  display: block;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.tag {
  background: #F8F9FA;
  color: #888;
  padding: 12rpx 32rpx;
  border-radius: 100rpx;
  font-size: 26rpx;
  transition: all 0.3s;
  &.active {
    background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
    color: #fff;
    box-shadow: 0 4rpx 12rpx rgba(255, 125, 168, 0.25);
  }
}
.input {
  background: #F8F9FA;
  border-radius: 24rpx;
  height: 90rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  margin-bottom: 30rpx;
  &:focus {
    border: 2rpx solid #FF8DA1;
    background: #FFF;
  }
}
.save-btn {
  background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
  color: #fff;
  border-radius: 100rpx;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(255, 125, 168, 0.25);
  transition: transform 0.2s;
  &:active { transform: scale(0.96); }
  &::after { border: none; }
}
</style>
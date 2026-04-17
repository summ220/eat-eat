<template>
  <view class="page">
    <view class="card">
      <text class="title">🛒 添加购物清单</text>
      
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

      <input v-model="name" placeholder="请输入要购买的任务或物品" class="input" />
      <input v-model="num" placeholder="数量：例如 3个 (选填)" class="input" />
      <input v-model="price" placeholder="花费/单价 ¥ (选填)" class="input" />
      <button class="save-btn" @click="save">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const num = ref('')
const price = ref('')
const category = ref('蔬菜')
const categories = ['蔬菜', '肉蛋', '水产', '调料', '其他']

const save = () => {
  if (!name.value) return uni.showToast({ icon: 'none', title: '请输入名称' })
  let list = uni.getStorageSync('shop') || []
  list.unshift({ 
    id: 'shop_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    name: name.value, 
    num: num.value, 
    category: category.value, 
    price: price.value,
    done: false 
  })
  uni.setStorageSync('shop', list)
  uni.navigateBack()
}
</script>

<style lang="less" scoped>
.page {
  background: #FFF1F5;
  padding: 40rpx;
  height: ~"calc(100vh - 60rpx)";
}
.card {
  background: #fff;
  border-radius: 28rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 173, 199, 0.12);
}
.title {
  font-size: 36rpx;
  color: #FF7DA8;
  font-weight: bold;
  margin-bottom: 40rpx;
  display: block;
  text-align: center;
}
.category-wrap {
  margin-bottom: 30rpx;
}
.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.tag {
  background: #f5f5f5;
  color: #666;
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  &.active {
    background: #FF93B6;
    color: #fff;
  }
}
.input {
  border-bottom: 2rpx solid #FFC9D9;
  padding: 16rpx 0;
  font-size: 28rpx;
  margin-bottom: 30rpx;
}
.save-btn {
  background: #FF93B6;
  color: #fff;
  border-radius: 100rpx;
  padding: 20rpx 0;
  font-size: 30rpx;
  margin-top: 20rpx;
  border: none;
}
</style>
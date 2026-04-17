<template>
  <view class="page">
    <view class="top-bar">
      <text class="title">🛒 购物清单</text>
      <button class="add-btn" @click="goAdd">+ 新增</button>
    </view>

    <view class="item-card" v-for="(item, i) in list" :key="i">
      <text class="name" :class="{ done: item.done }">{{ item.name }}</text>
      <switch :checked="item.done" @change="toggle(i)" color="#FF93B6" />
    </view>

    <view class="empty" v-if="list.length === 0">
      <text>购物车还是空的哦～</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { list: [] }
  },
  onShow() { this.load() },
  methods: {
    load() { this.list = uni.getStorageSync('shop') || [] },
    save() { uni.setStorageSync('shop', this.list) },
    toggle(i) {
      this.list[i].done = !this.list[i].done
      this.save()
    },
    goAdd() {
      uni.navigateTo({ url: '/pages/addShop/index' })
    }
  }
}
</script>

<style scoped>
.page {
  background: #FFF1F5;
  padding: 30rpx;
  min-height: 100vh;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}
.title {
  font-size: 38rpx;
  color: #FF7DA8;
  font-weight: bold;
}
.add-btn {
  background: #FF93B6;
  color: #fff;
  border-radius: 100rpx;
  padding: 12rpx 26rpx;
  font-size: 26rpx;
  border: none;
}
.item-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 6rpx 16rpx rgba(255, 173, 199, 0.1);
}
.name {
  font-size: 32rpx;
  color: #444;
}
.done {
  text-decoration: line-through;
  color: #ccc;
}
.empty {
  text-align: center;
  margin-top: 120rpx;
  color: #BC8DA7;
  font-size: 28rpx;
}
</style>
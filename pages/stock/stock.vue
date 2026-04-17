<template>
  <view class="page">
    <view class="top-bar">
      <text class="title">🍅 家里食材</text>
      <button class="add-btn" @click="goAdd">+ 添加</button>
    </view>

    <view class="item-card" v-for="(item, i) in list" :key="i">
      <view>
        <text class="name">{{ item.name }}</text>
        <text class="num">{{ item.num }}</text>
      </view>
      <switch :checked="item.has" @change="toggle(i)" color="#FF93B6" />
    </view>

    <view class="empty" v-if="list.length === 0">
      <text>冰箱空空哒～快去添加吧</text>
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
    load() { this.list = uni.getStorageSync('stock') || [] },
    save() { uni.setStorageSync('stock', this.list) },
    toggle(i) {
      this.list[i].has = !this.list[i].has
      this.save()
    },
    goAdd() {
      uni.navigateTo({ url: '/pages/addStock/index' })
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
.num {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
}
.empty {
  text-align: center;
  margin-top: 120rpx;
  color: #BC8DA7;
  font-size: 28rpx;
}
</style>
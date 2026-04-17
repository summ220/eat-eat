<template>
  <view class="page">
    <view class="card">
      <text class="title">🍅 添加食材</text>
      <input v-model="name" placeholder="食材名称" class="input" />
      <input v-model="num" placeholder="数量：例如 3个" class="input" />
      <button class="save-btn" @click="save">保存</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { name: '', num: '' }
  },
  methods: {
    save() {
      if (!this.name) return uni.showToast({ icon: 'none', title: '请输入名称' })
      let list = uni.getStorageSync('stock') || []
      list.unshift({ name: this.name, num: this.num, has: true })
      uni.setStorageSync('stock', list)
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page {
  background: #FFF1F5;
  padding: 40rpx;
  min-height: 100vh;
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
<template>
  <view class="page">
    <view class="card">
      <text class="title">🏠 我的家庭</text>
      <view class="input-item">
        <text>家庭名称</text>
        <input v-model="familyName" placeholder="取个可爱名字" />
      </view>
      <button class="save-btn" @click="save">保存</button>
    </view>

    <view class="card member-card">
      <text class="title">👨‍👩‍👧‍👦 家庭成员</text>
      <view class="member" v-for="(item, i) in members" :key="i">
        <text>🥰 {{ item }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const familyName = ref('快乐干饭小家')
const members = ref(['爸爸', '妈妈', '宝宝'])

const save = () => {
  uni.showToast({ title: '保存成功', icon: 'success' })
}
</script>

<style lang="less" scoped>
.page {
  background: #FFF1F5;
  padding: 30rpx;
  height: ~"calc(100vh - 60rpx)";
}
.card {
  background: #fff;
  border-radius: 28rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 173, 199, 0.12);
}
.title {
  font-size: 34rpx;
  color: #FF7DA8;
  font-weight: bold;
  margin-bottom: 30rpx;
  display: block;
}
.input-item {
  margin-bottom: 30rpx;
  text {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 10rpx;
    display: block;
  }
}
input {
  border-bottom: 2rpx solid #FFC9D9;
  padding: 10rpx 0;
  font-size: 28rpx;
}
.save-btn {
  background: #FF93B6;
  color: #fff;
  border-radius: 100rpx;
  padding: 18rpx 0;
  font-size: 28rpx;
  border: none;
}
.member {
  font-size: 28rpx;
  color: #555;
  padding: 10rpx 0;
}
</style>
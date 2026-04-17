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
  background: #FAFAFA;
  padding: 40rpx;
  min-height: ~"calc(100vh - 80rpx)";
  background-image: linear-gradient(180deg, #FFF5F7 0%, #FAFAFA 400rpx);
}
.card {
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 16rpx 40rpx rgba(255, 141, 161, 0.08);
}
.title {
  font-size: 36rpx;
  color: #333;
  font-weight: 800;
  margin-bottom: 40rpx;
  display: block;
}
.input-item {
  margin-bottom: 40rpx;
  text {
    font-size: 28rpx;
    color: #888;
    margin-bottom: 20rpx;
    display: block;
  }
}
input {
  background: #F8F9FA;
  border-radius: 24rpx;
  height: 90rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
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
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(255, 125, 168, 0.25);
  transition: transform 0.2s;
  &:active { transform: scale(0.96); }
  &::after { border: none; }
}
.member {
  font-size: 30rpx;
  color: #333;
  padding: 16rpx 0;
  font-weight: 500;
}
</style>
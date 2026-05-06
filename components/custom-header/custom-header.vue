<template>
  <view>
    <view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px', background: bg }">
      <view class="header-content">
        <view class="left-icon" v-if="back" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <view class="title-wrap">
          <text class="h-icon" v-if="icon">{{ icon }}</text>
          <text class="h-title">{{ title }}</text>
        </view>
      </view>
    </view>
    <!-- 占位，防止内容被遮挡 -->
    <view class="header-placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }" v-if="placeholder"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: String,
  icon: String,
  back: { type: Boolean, default: false },
  bg: { type: String, default: 'var(--primary-light, #FFF5F7)' },
  placeholder: { type: Boolean, default: true }
})

const statusBarHeight = ref(20)

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
  } catch (e) {
    statusBarHeight.value = 20
  }
})

const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);
  transition: background 0.3s ease;
}
.header-content {
  height: 44px;
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 30rpx;
}
.left-icon {
  position: absolute;
  left: 30rpx;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 10;
}
.back-icon {
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
}
.title-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}
.h-icon {
  font-size: 38rpx;
}
.h-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #333;
  letter-spacing: 2rpx;
}
.header-placeholder {
  width: 100%;
}
</style>

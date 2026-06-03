<template>
  <view>
    <view class="custom-header" :style="headerStyle">
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
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const props = defineProps({
  title: String,
  icon: String,
  back: { type: Boolean, default: false },
  placeholder: { type: Boolean, default: true }
})

const themes = [
  { light: '#FFE8EE' },
  { light: '#E6F7F0' },
  { light: '#E8F0FE' },
  { light: '#FEF4E8' }
]

const statusBarHeight = ref(20)
const currentTheme = ref(0)

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
  } catch (e) {
    statusBarHeight.value = 20
  }
  currentTheme.value = uni.getStorageSync('current_theme') || 0
})

onShow(() => {
  currentTheme.value = uni.getStorageSync('current_theme') || 0
})

const headerStyle = computed(() => {
  const t = themes[currentTheme.value] || themes[0]
  return {
    paddingTop: statusBarHeight.value + 'px',
    background: t.light
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
  /* box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02); */
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

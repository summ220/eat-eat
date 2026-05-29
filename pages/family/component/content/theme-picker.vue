<!-- 个性主题选择自治组件 -->
<template>
  <view class="theme-list">
    <view 
      class="theme-item" 
      v-for="(t, idx) in themes" 
      :key="idx"
      :class="{ active: currentTheme === idx }"
      :style="{ background: t.color }"
      @click="switchTheme(idx)"
    >
      <text class="check" v-if="currentTheme === idx">✓</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  themes: {
    type: Array,
    required: true
  },
  currentTheme: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['change'])

const switchTheme = (idx) => {
  uni.setStorageSync('current_theme', idx)
  uni.setTabBarStyle({ selectedColor: props.themes[idx].color })
  emit('change', idx)
}
</script>

<style lang="less" scoped>
.theme-list {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 20rpx;
}

.theme-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  
  &.active {
    transform: scale(1.15);
    box-shadow: 0 8rpx 24rpx var(--primary-shadow);
    border: 4rpx solid #fff;
  }
  
  .check {
    color: #fff;
    font-weight: bold;
    font-size: 32rpx;
  }
}
</style>

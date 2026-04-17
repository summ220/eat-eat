<template>
  <view class="page" :style="themeStyle">
    <view class="empty">
      <text>👨‍🍳 菜谱功能开发中，敬请期待...</text>
    </view>
  </view>
</template>

<script setup>
import { useTheme } from '../../utils/theme.js'

const { themeStyle } = useTheme()
</script>

<style lang="less" scoped>
.page {
  background: var(--theme-light);
  padding: 30rpx;
  height: ~"calc(100vh - 60rpx)";
  display: flex;
  justify-content: center;
}
.empty {
  color: var(--theme-color);
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 160rpx;
}
</style>

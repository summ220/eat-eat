<template>
  <view class="gourmet-refresh-container" :class="{ show: refreshing }" :style="localThemeStyle">
    <view class="refresh-content">
      <!-- 1. 菜谱页面动画：快乐摇摆的煎蛋平底锅 -->
      <view class="animation-wrapper" v-if="type === 'recipe'">
        <view class="pan-handle-wrapper">
          <view class="pan-pot">
            <view class="egg-white">
              <view class="egg-yolk"></view>
            </view>
          </view>
          <view class="pan-handle"></view>
        </view>
        <!-- 蒸汽飘动粒子 -->
        <view class="steam-particle s-1">💨</view>
        <view class="steam-particle s-2">💨</view>
      </view>

      <!-- 2. 库存页面动画：跳舞的魔法胡萝卜 -->
      <view class="animation-wrapper carrot-wrap" v-if="type === 'stock'">
        <text class="carrot-body">🥕</text>
        <text class="sparkle sp-1">✨</text>
        <text class="sparkle sp-2">⭐</text>
      </view>

      <!-- 3. 清单页面动画：漂移的粉嫩购物手推车 -->
      <view class="animation-wrapper cart-wrap" v-if="type === 'shop'">
        <view class="cart-container">
          <text class="cart-icon">🛒</text>
          <text class="donut">🍩</text>
        </view>
      </view>

      <!-- 4. 家庭页面动画：吐爱心的小暖屋 -->
      <view class="animation-wrapper house-wrap" v-if="type === 'family'">
        <text class="house-icon">🏠</text>
        <view class="heart-bubble h-1">{{ bubbles.b1 }}</view>
        <view class="heart-bubble h-2">{{ bubbles.b2 }}</view>
      </view>

      <!-- 5. 首页抽菜动画：正在疯狂翻滚的幸运骰子 -->
      <view class="animation-wrapper dice-wrap" v-if="type === 'index'">
        <text class="dice-body">🎲</text>
        <text class="sparkle dice-sp-1">✨</text>
        <text class="sparkle dice-sp-2">💖</text>
        <text class="sparkle dice-sp-3">🍓</text>
      </view>

      <!-- 动态治愈文案 -->
      <text class="refresh-tip-text">{{ tipText }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  refreshing: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'recipe' // recipe | stock | shop | family
  },
  theme: {
    type: [Number, String],
    default: null
  }
})

const themes = [
  { color: '#FF6B8B', light: '#FFF5F7' },
  { color: '#4DB88F', light: '#E6F7F0' },
  { color: '#5B89E5', light: '#E8F0FE' },
  { color: '#F2A13B', light: '#FEF4E8' }
]

const activeThemeIdx = computed(() => {
  const t = props.theme !== null && props.theme !== undefined ? props.theme : uni.getStorageSync('current_theme')
  return t !== null && t !== undefined ? Number(t) : 0
})

const localThemeStyle = computed(() => {
  const t = themes[activeThemeIdx.value] || themes[0]
  return `
    --primary: ${t.color};
    --primary-light: ${t.light};
  `
})

const bubbles = computed(() => {
  switch (activeThemeIdx.value) {
    case 1:
      return { b1: '💚', b2: '🍀' }
    case 2:
      return { b1: '💙', b2: '💎' }
    case 3:
      return { b1: '💛', b2: '⭐' }
    default:
      return { b1: '💖', b2: '💝' }
  }
})

const tipText = computed(() => {
  switch (props.type) {
    case 'recipe':
      return '🍳 魔法锅铲飞舞，正在为您呈上新鲜菜谱...'
    case 'stock':
      return '🥕 正在精细盘点小仓库，更新最新食材库存...'
    case 'shop':
      return '🛒 正在打扫购物清单，同步最新的采购任务...'
    case 'family':
      return '🏠 正在温馨整理家庭看板与成员健康状况...'
    case 'index':
      return '🎲 幸运大骰子翻滚中，正在为您驱散今天的干饭纠结...'
    default:
      return '🍏 正在努力加载中...'
  }
})
</script>

<style lang="less" scoped>
.gourmet-refresh-container {
  height: 0;
  overflow: hidden; /* 未激活时紧紧隐藏溢出背景，绝不干扰页面层级与排版 */
  opacity: 0;
  background: var(--primary-light);
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2rpx solid rgba(255, 107, 139, 0.02);
  position: relative; /* 定位基准 */

  /* 物理天幕溢出无限延伸，完美防御强拉白块 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    height: 800rpx; /* 向上延伸800rpx，阻断任何系统白底 */
    background: var(--primary-light);
    pointer-events: none;
  }

  &.show {
    height: 150rpx;
    opacity: 1;
    padding: 20rpx 0;
    overflow: visible; /* 激活时开启天幕，提供沉浸式下拉遮挡 */
  }
}

.refresh-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.animation-wrapper {
  position: relative;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-tip-text {
  font-size: 24rpx;
  color: var(--primary);
  font-weight: bold;
  letter-spacing: 2rpx;
  animation: textPulse 1.5s infinite ease-in-out;
}

/* 1. 煎蛋锅动画 */
.pan-handle-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  animation: panShake 0.6s infinite ease-in-out alternate;
}

.pan-pot {
  width: 50rpx;
  height: 50rpx;
  background: #2C3E50;
  border-radius: 50%;
  border-bottom: 6rpx solid #1A252F;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pan-handle {
  width: 30rpx;
  height: 8rpx;
  background: #2C3E50;
  border-radius: 4rpx;
  transform: rotate(-10deg);
  transform-origin: left center;
}

.egg-white {
  width: 28rpx;
  height: 24rpx;
  background: #FFFFFF;
  border-radius: 50% 60% 55% 45%;
  position: relative;
  animation: eggBounce 0.4s infinite ease-in-out alternate;
}

.egg-yolk {
  width: 12rpx;
  height: 12rpx;
  background: #FF9F43;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.steam-particle {
  position: absolute;
  font-size: 20rpx;
  opacity: 0;
  
  &.s-1 {
    top: -20rpx; left: -10rpx;
    animation: steamRise 1s infinite ease-in-out;
  }
  &.s-2 {
    top: -10rpx; right: -10rpx;
    animation: steamRise 1s infinite ease-in-out 0.5s;
  }
}

/* 2. 胡萝卜跳舞动画 */
.carrot-wrap {
  .carrot-body {
    font-size: 46rpx;
    animation: carrotDance 0.8s infinite ease-in-out;
  }
  .sparkle {
    position: absolute;
    font-size: 20rpx;
    animation: sparkleBlink 1.2s infinite ease-in-out;
    
    &.sp-1 { top: -10rpx; left: -20rpx; animation-delay: 0.2s; }
    &.sp-2 { bottom: -10rpx; right: -20rpx; animation-delay: 0.6s; }
  }
}

/* 3. 购物车漂移动画 */
.cart-wrap {
  .cart-container {
    position: relative;
    animation: cartDrift 1.2s infinite cubic-bezier(0.25, 1, 0.5, 1);
  }
  .cart-icon {
    font-size: 46rpx;
  }
  .donut {
    position: absolute;
    font-size: 22rpx;
    top: -14rpx;
    left: 10rpx;
    animation: donutBounce 0.5s infinite alternate ease-in-out;
  }
}

/* 4. 暖屋爱心动画 */
.house-wrap {
  .house-icon {
    font-size: 46rpx;
    animation: houseBreath 1.5s infinite ease-in-out;
  }
  .heart-bubble {
    position: absolute;
    font-size: 22rpx;
    opacity: 0;
    
    &.h-1 {
      top: -20rpx; left: 10rpx;
      animation: heartFloat 1.2s infinite ease-out;
    }
    &.h-2 {
      top: -15rpx; right: 10rpx;
      animation: heartFloat 1.2s infinite ease-out 0.6s;
    }
  }
}

/* ================== CSS 动画声明 ================== */

@keyframes textPulse {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

@keyframes panShake {
  0% { transform: rotate(-5deg) translateY(0); }
  100% { transform: rotate(10deg) translateY(-4rpx); }
}

@keyframes eggBounce {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-6rpx) scale(1.05); }
}

@keyframes steamRise {
  0% { transform: translateY(10rpx) scale(0.6); opacity: 0; }
  50% { opacity: 0.6; }
  100% { transform: translateY(-30rpx) scale(1); opacity: 0; }
}

@keyframes carrotDance {
  0% { transform: rotate(-15deg) scale(1); }
  50% { transform: rotate(15deg) scale(1.15) translateY(-6rpx); }
  100% { transform: rotate(-15deg) scale(1); }
}

@keyframes sparkleBlink {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes cartDrift {
  0% { transform: translateX(-30rpx) rotate(-3deg); }
  50% { transform: translateX(30rpx) rotate(3deg); }
  100% { transform: translateX(-30rpx) rotate(-3deg); }
}

@keyframes donutBounce {
  0% { transform: translateY(0) rotate(0); }
  100% { transform: translateY(-10rpx) rotate(15deg); }
}

@keyframes houseBreath {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

@keyframes heartFloat {
  0% { transform: translateY(10rpx) scale(0.5); opacity: 0; }
  30% { opacity: 0.8; }
  100% { transform: translateY(-40rpx) scale(1.2); opacity: 0; }
}

/* 5. 骰子旋转翻滚动画 */
.dice-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dice-body {
  font-size: 55rpx;
  animation: diceRoll 0.8s infinite linear;
  display: inline-block;
}

@keyframes diceRoll {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) translateY(-5rpx) scale(1.1); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) translateY(5rpx) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}

/* 骰子专属粒子漂浮 */
.dice-sp-1 {
  top: -10rpx;
  left: -30rpx;
  animation: diceSparkle1 1.2s infinite ease-in-out;
}
.dice-sp-2 {
  bottom: -10rpx;
  right: -30rpx;
  animation: diceSparkle2 1.2s infinite ease-in-out 0.3s;
}
.dice-sp-3 {
  top: 10rpx;
  right: -35rpx;
  animation: diceSparkle3 1.2s infinite ease-in-out 0.6s;
}

@keyframes diceSparkle1 {
  0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
  50% { transform: translate(-15rpx, -15rpx) scale(1.1); opacity: 1; }
  100% { transform: translate(-30rpx, -30rpx) scale(0.6); opacity: 0; }
}

@keyframes diceSparkle2 {
  0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
  50% { transform: translate(15rpx, 15rpx) scale(1.1); opacity: 1; }
  100% { transform: translate(30rpx, 30rpx) scale(0.6); opacity: 0; }
}

@keyframes diceSparkle3 {
  0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
  50% { transform: translate(15rpx, -10rpx) scale(1.1); opacity: 1; }
  100% { transform: translate(30rpx, -20rpx) scale(0.6); opacity: 0; }
}
</style>

<template>
  <view class="welcome-ad-fullscreen" 
        v-if="show" 
        @touchmove.stop.prevent="" 
        style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999999; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 60rpx 40rpx; box-sizing: border-box;">
    <image src="@/static/logo.jpg" mode="aspectFill" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1;"></image>
    <!-- 轻柔磨砂粉红色蒙层 -->
    <view style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 235, 238, 0.45); z-index: 2; backdrop-filter: blur(2rpx);"></view>
    
    <view class="ad-skip-btn" 
          @click="closeAd" 
          style="position: absolute; top: 110rpx; left: 40rpx; background: rgba(0,0,0,0.3); color: #fff; padding: 12rpx 30rpx; border-radius: 30rpx; font-size: 24rpx; font-weight: 500; letter-spacing: 2rpx; z-index: 10; cursor: pointer; display: flex; align-items: center; justify-content: center;">
      跳过 {{ adCountdown }}s
    </view>
    
    <view style="z-index: 3; text-align: center; margin-top: 200rpx; display: flex; flex-direction: column; align-items: center;">
      <text style="font-size: 64rpx; font-weight: 900; color: #FF4D6D; display: block; letter-spacing: 6rpx; text-shadow: 0 4rpx 12rpx rgba(255, 77, 109, 0.15); font-family: system-ui, -apple-system, sans-serif">欢迎回家</text>
      <text style="font-size: 28rpx; color: #FF4D6D; font-weight: 500; display: inline-block; margin-top: 24rpx; letter-spacing: 2rpx; background: rgba(255, 255, 255, 0.85); padding: 8rpx 30rpx; border-radius: 30rpx; box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.02);">今天，也要记得好好吃饭呀</text>
    </view>
    
    <view style="z-index: 3; width: 560rpx; display: flex; flex-direction: column; align-items: center; gap: 30rpx; margin-bottom: 120rpx;">
      <button @click="closeAd" style="background: linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%); color: #fff; font-size: 32rpx; font-weight: bold; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; box-shadow: 0 12rpx 30rpx rgba(255, 90, 121, 0.35); border: none; margin: 0; width: 100%; text-align: center;">
        开启美好一餐
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const adCountdown = ref(5)
let adTimer = null

const startAdCountdown = () => {
  adCountdown.value = 5
  if (adTimer) clearInterval(adTimer)
  adTimer = setInterval(() => {
    adCountdown.value--
    if (adCountdown.value <= 0) {
      closeAd()
    }
  }, 1000)
}

const closeAd = () => {
  if (adTimer) {
    clearInterval(adTimer)
    adTimer = null
  }
  uni.showTabBar({ animation: false })
  emit('close')
}

onMounted(() => {
  if (props.show) {
    uni.hideTabBar({ animation: false })
    startAdCountdown()
  }
})

onUnmounted(() => {
  if (adTimer) {
    clearInterval(adTimer)
  }
  uni.showTabBar({ animation: false })
})
</script>

<style scoped>
.welcome-ad-fullscreen {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

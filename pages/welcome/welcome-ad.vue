<template>
  <view class="welcome-ad-fullscreen" 
        v-if="show" 
        @touchmove.stop.prevent="" 
        :style="{ backgroundColor: activeTheme?.overlay || '#FFE8EE' }"
        style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999999; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 60rpx 40rpx; box-sizing: border-box;">
    <!-- 4套静态编译大图，分配独一无二的key防原地DOM复用，100% 绝对完美显示！ -->
    <image v-if="themeIndex == 0" key="pink" src="https://lw.feiyuf.top/static/logo-pink.jpg" mode="aspectFill" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1;"></image>
    <image v-else-if="themeIndex == 1" key="green" src="https://lw.feiyuf.top/static/logo-green.jpg" mode="aspectFill" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1;"></image>
    <image v-else-if="themeIndex == 2" key="blue" src="https://lw.feiyuf.top/static/logo-blue.jpg" mode="aspectFill" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1;"></image>
    <image v-else-if="themeIndex == 3" key="yellow" src="https://lw.feiyuf.top/static/logo-yellow.jpg" mode="aspectFill" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1;"></image>
    
    <!-- 动态磨砂系统主题蒙层 -->
    <!-- <view style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; backdrop-filter: blur(4rpx); transition: background-color 0.3s ease;" 
          :style="{ backgroundColor: activeTheme.overlay }"></view> -->
    
    <view class="ad-skip-btn" 
          @click="closeAd" 
          style="position: absolute; top: 110rpx; left: 40rpx; background: rgba(0,0,0,0.3); color: #fff; padding: 12rpx 30rpx; border-radius: 30rpx; font-size: 24rpx; font-weight: 500; letter-spacing: 2rpx; z-index: 10; cursor: pointer; display: flex; align-items: center; justify-content: center;">
      跳过 {{ adCountdown }}s
    </view>
    
    <view style="z-index: 3; text-align: center; margin-top: 220rpx; display: flex; flex-direction: column; align-items: center;">
      <text style="font-size: 74rpx; font-weight: 900;color: #fff; display: block; letter-spacing: 6rpx; text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05); font-family: system-ui, -apple-system, sans-serif; transition: color 0.3s ease;"
            >欢迎回家</text>
      <text style="font-size: 36rpx; font-weight: 500;color: #fff; display: inline-block; margin-top: 24rpx; letter-spacing: 1rpx;"
            >今天，也要记得好好吃饭呀</text>
    </view>
    
    <view style="z-index: 3; width: 560rpx; display: flex; flex-direction: column; align-items: center; gap: 30rpx; margin-bottom: 140rpx;">
      <button @click="closeAd" 
              style="color: #fff; font-size: 32rpx; font-weight: bold; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; border: none; margin: 0; width: 100%; text-align: center; transition: all 0.3s ease;"
              :style="{ background: activeTheme.gradient, boxShadow: '0 12rpx 30rpx ' + activeTheme.shadow }">
        开启美好一餐
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const adCountdown = ref(5)
let adTimer = null

// 4套治愈系动态系统主题配置
const themes = [
  { 
    name: '温柔粉', 
    color: '#FF4D6D', 
    gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', 
    overlay: 'rgba(255, 235, 238, 0.55)', 
    shadow: 'rgba(255, 90, 121, 0.35)',
  },
  { 
    name: '清新绿', 
    color: '#4DB88F', 
    gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', 
    overlay: 'rgba(230, 247, 240, 0.55)', 
    shadow: 'rgba(77, 184, 143, 0.35)',
  },
  { 
    name: '雾霾蓝', 
    color: '#5B89E5', 
    gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', 
    overlay: 'rgba(232, 240, 254, 0.55)', 
    shadow: 'rgba(91, 137, 229, 0.35)',
  },
  { 
    name: '暖杏黄', 
    color: '#F2A13B', 
    gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', 
    overlay: 'rgba(254, 244, 232, 0.55)', 
    shadow: 'rgba(242, 161, 59, 0.35)',
  }
]

const themeIndex = ref(Number(uni.getStorageSync('current_theme') || 0))
const activeTheme = computed(() => themes[themeIndex.value])

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

/* @keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
} */
</style>

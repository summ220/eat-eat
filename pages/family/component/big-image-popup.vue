<template>
  <view class="big-image-mask" v-if="show" @click="close">
    <view class="big-image-content" @click.stop>
      <image class="big-image" :src="imageUrl" mode="aspectFit" />
      <view class="close-big-btn" @click="close">✕</view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style lang="less" scoped>
.big-image-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .big-image-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx;
    
    .big-image {
      max-width: 80vw;
      max-height: 60vh;
      border-radius: 32rpx;
      box-shadow: 0 24rpx 72rpx rgba(0, 0, 0, 0.35);
      border: 4rpx solid rgba(255, 255, 255, 0.15);
    }
    
    .close-big-btn {
      margin-top: 48rpx;
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 2rpx solid rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 40rpx;
      backdrop-filter: blur(5px);
      transition: all 0.2s;
      
      &:active {
        transform: scale(0.9);
        background: rgba(255, 255, 255, 0.35);
      }
    }
  }
}
</style>

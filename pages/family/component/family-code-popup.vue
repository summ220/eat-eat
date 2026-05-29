<!-- 家庭编码复制弹窗 -->
<template>
  <view class="modal-mask" v-if="show" @click="close">
    <view class="modal-content" @click.stop>
      <text class="modal-title">🔑 家庭安全编码</text>
      <view class="invite-info" style="margin: 20rpx 0; width: 100%;">
        <text class="invite-desc" style="color: #666; font-size: 26rpx; line-height: 1.5; margin-bottom: 20rpx; display: block; text-align: center;">家庭编码是数据丢失后找回的唯一凭证，请务必截图或保存至安全位置！</text>
        <view class="invite-code-box" style="background: #FAFAFA; border: 2rpx dashed var(--primary); padding: 24rpx; border-radius: 16rpx; display: flex; justify-content: space-between; align-items: center;">
          <text class="code-val" style="font-size: 32rpx; font-weight: bold; color: #333; letter-spacing: 1rpx;">{{ familyCode }}</text>
          <text class="copy-btn" style="background: var(--primary); color: #fff; padding: 10rpx 24rpx; border-radius: 12rpx; font-size: 24rpx; font-weight: bold;" @click="copyFamilyCode">复制</text>
        </view>
      </view>
      <button class="close-modal-btn prim" style="margin-top: 20rpx;" @click="close">关闭</button>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  familyCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const copyFamilyCode = () => {
  if (!props.familyCode) return
  uni.setClipboardData({
    data: props.familyCode,
    success: () => {
      uni.showToast({ title: '复制成功', icon: 'success' })
    }
  })
}
</script>

<style lang="less" scoped>
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(10rpx);
}
.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  
  .modal-title {
    font-size: 34rpx;
    font-weight: 800;
    color: #2C3E50;
    margin-bottom: 20rpx;
  }
}
</style>

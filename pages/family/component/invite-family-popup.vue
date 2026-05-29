<!-- 邀请家人加入弹窗 -->
<template>
  <view class="modal-mask" v-if="show" @click="close">
    <view class="modal-content invite-modal" @click.stop>
      <text class="modal-title">邀请家人加入</text>
      <view class="invite-info">
        <text class="invite-desc">让家人扫描二维码或输入邀请码</text>
        <view class="invite-code-box">
          <text class="code-val">{{ inviteCode }}</text>
          <text class="copy-btn" @click="copyCode">复制</text>
        </view>
        <view class="invite-expire-tip">
          <text class="expire-icon">⏱️</text>
          <text class="expire-text">邀请码有效期5分钟</text>
          <text class="expire-countdown">{{ formattedCountdown }}</text>
        </view>
        <view class="qr-placeholder">
          <text class="qr-icon">📱</text>
          <text>扫码加入家庭</text>
        </view>
      </view>
      <button class="close-modal-btn prim" @click="close">完成</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import familyApi from '@/common/api/family.js'

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

const inviteCode = ref('')
const inviteCodeExpireTime = ref(0)
const countdownSeconds = ref(0)
let countdownTimer = null

watch(() => props.show, (newVal) => {
  if (newVal) {
    initInvite()
  } else {
    clearTimer()
  }
})

const close = () => {
  emit('close')
}

const clearTimer = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

onBeforeUnmount(() => {
  clearTimer()
})

const initInvite = async () => {
  if (!props.familyCode) return
  // 检查邀请码是否有效（5分钟内）
  if (inviteCode.value && Date.now() <= inviteCodeExpireTime.value) {
    startCountdown()
  } else {
    await getInviteCode()
  }
}

const getInviteCode = async () => {
  try {
    const res = await familyApi.createFamilyInvite(props.familyCode, 300)
    if (res && res.data) {
      inviteCode.value = res.data.inviteCode
      inviteCodeExpireTime.value = Date.now() + 5 * 60 * 1000
      startCountdown()
    } else {
      uni.showToast({ title: '获取验证码失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '获取验证码失败', icon: 'none' })
  }
}

const startCountdown = () => {
  clearTimer()
  
  const updateCountdown = () => {
    const remaining = Math.max(0, Math.ceil((inviteCodeExpireTime.value - Date.now()) / 1000))
    countdownSeconds.value = remaining
    if (remaining <= 0) {
      clearTimer()
    }
  }
  
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
}

const formattedCountdown = computed(() => {
  const minutes = Math.floor(countdownSeconds.value / 60)
  const seconds = countdownSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const copyCode = () => {
  if (!inviteCode.value) return
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => uni.showToast({ title: '复制成功' })
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

.invite-modal {
  width: 600rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
  .modal-title {
    font-size: 34rpx;
    font-weight: 800;
    color: #2C3E50;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .invite-info {
    text-align: center;
    padding: 20rpx 0;
    width: 100%;
    
    .invite-desc {
      font-size: 26rpx;
      color: #7F8C8D;
      display: block;
      margin-bottom: 40rpx;
    }
    
    .invite-code-box {
      background: #F8F9FA;
      padding: 30rpx;
      border-radius: 24rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      border: 2rpx dashed var(--primary);
      box-sizing: border-box;
      
      .code-val {
        font-size: 48rpx;
        font-weight: 900;
        color: var(--primary);
        letter-spacing: 4rpx;
      }
      
      .copy-btn {
        font-size: 24rpx;
        color: #fff;
        background: var(--primary);
        padding: 10rpx 24rpx;
        border-radius: 100rpx;
        font-weight: bold;
      }
    }
    
    .invite-expire-tip {
      margin-bottom: 30rpx;
      color: #ccc;
      font-size: 22rpx;
      .expire-countdown {
        margin-left: 18rpx;
        color: #FF4D6D;
        font-weight: bold;
      }
    }
    
    .qr-placeholder {
      width: 280rpx;
      height: 280rpx;
      background: #fff;
      border: 2rpx solid #F0F2F5;
      border-radius: 30rpx;
      margin: 0 auto 30rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16rpx;
      color: #BDC3C7;
      font-size: 22rpx;
      
      .qr-icon { font-size: 80rpx; }
    }
  }
  
  .close-modal-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 100rpx;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    &::after { border: none; }
    
    &.prim {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 8rpx 20rpx var(--primary-shadow);
    }
  }
}
</style>

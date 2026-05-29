<!-- 加入新家庭弹窗 -->
<template>
  <view class="modal-mask" v-if="show" @click="close">
    <view class="modal-content" @click.stop>
      <text class="modal-title">加入新家庭</text>
      <view class="input-box">
        <input class="join-input" v-model="joinCode" placeholder="请输入邀请码" />
      </view>
      <view class="modal-tips">加入后将同步该家庭的所有数据</view>
      <view class="modal-btns">
        <button class="m-btn-sub" @click="close">取消</button>
        <button class="m-btn-main" @click="confirmJoin">加入</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import familyApi from '@/common/api/family.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'joined'])

const joinCode = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    joinCode.value = ''
  }
})

const close = () => {
  emit('close')
}

const confirmJoin = async () => {
  const val = joinCode.value.trim()
  if (!val) return uni.showToast({ title: '请输入邀请码', icon: 'none' })
  
  uni.showLoading({ title: '正在加入...', mask: true })
  try {
    const res = await familyApi.joinFamily(val)
    if (res && res.data) {
      const code = res.data.member.familyCode
      const role = res.data.member.role
      uni.setStorageSync('family_code', code)
      uni.setStorageSync('family_role', role)
      
      uni.showToast({ title: '成功加入家庭', icon: 'success' })
      emit('joined', { code, role })
      close()
    } else {
      uni.showToast({ title: res.message || '加入家庭失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '加入家庭失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
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
  box-sizing: border-box;
  
  .modal-title {
    font-size: 34rpx;
    font-weight: 800;
    color: #2C3E50;
    text-align: center;
    margin-bottom: 30rpx;
  }
}

.input-box {
  background: #F8F9FA;
  border-radius: 30rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 16rpx;
  width: 100%;
  box-sizing: border-box;
  
  .join-input {
    width: 100%;
    height: 60rpx;
    font-size: 28rpx;
    color: #2C3E50;
  }
}

.modal-tips {
  font-size: 22rpx;
  color: #95A5A6;
  text-align: center;
  margin-bottom: 24rpx;
}

.modal-btns {
  display: flex;
  gap: 30rpx;
  margin-top: 10rpx;
  width: 100%;
  
  button {
    flex: 1;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 100rpx;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    &::after { border: none; }
  }
  
  .m-btn-sub {
    background: #F8F9FA;
    color: #7F8C8D;
  }
  
  .m-btn-main {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 8rpx 20rpx var(--primary-shadow);
  }
}
</style>

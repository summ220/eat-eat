<!-- 加入新家庭弹窗 -->
<template>
  <view class="modal-mask" v-if="show" @click="!isJoining && close">
    <view class="modal-content" @click.stop>
      <block v-if="!isJoining">
        <text class="modal-title">加入新家庭</text>
        <view class="input-box">
          <input class="join-input" v-model="joinCode" placeholder="请输入邀请码 (必填)" />
          <view class="scan-icon-btn" @click="handleScan">
            <text class="scan-icon">📷</text>
          </view>
        </view>
        
        <view class="preset-fields-title" style="font-size: 24rpx; color: #888; font-weight: bold; margin-top: 24rpx; margin-bottom: 12rpx;">👤 预设我的成员信息</view>
        <view class="input-box">
          <input class="join-input" v-model="nickName" placeholder="预设我的昵称 (如：大饱饱)" />
        </view>
        <view class="input-box">
          <input class="join-input" v-model="memberTitle" placeholder="预设家庭称呼 (如：女儿、爸爸)" />
        </view>
        
        <view class="modal-tips" style="margin-top: 16rpx; display: flex; flex-direction: column; gap: 8rpx; align-items: center;">
          <text>加入后将同步该家庭的所有数据</text>
          <text style="color: #999; text-decoration: underline; cursor: pointer; font-size: 22rpx; font-weight: 500;" @click="skipPreset">暂不预设，稍后在家庭修改</text>
        </view>
        
        <view class="modal-btns" style="margin-top: 20rpx;">
          <button class="m-btn-sub" @click="close">取消</button>
          <button class="m-btn-main" @click="confirmJoin">加入</button>
        </view>
      </block>
      
      <!-- 正在加入家庭的疗愈动效 -->
      <view class="joining-box" v-else>
        <view class="loading-icon-wrap">
          <text class="loading-emoji">🏡</text>
          <view class="loading-pulse"></view>
        </view>
        <text class="joining-text">正在同步家庭餐桌...</text>
        <text class="joining-subtext">美味即将共享，请稍候</text>
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
const nickName = ref('')
const memberTitle = ref('')
const isJoining = ref(false)

watch(() => props.show, (newVal) => {
  if (newVal) {
    joinCode.value = ''
    nickName.value = ''
    memberTitle.value = ''
    isJoining.value = false
  }
})

const close = () => {
  emit('close')
}

const skipPreset = () => {
  nickName.value = ''
  memberTitle.value = ''
  confirmJoin()
}

const handleScan = () => {
  uni.scanCode({
    onlyFromCamera: false, // 允许从相册选择二维码
    scanType: ['qrCode'],
    success: (res) => {
      const scanResult = res.result
      console.log('扫码结果:', scanResult)
      
      let inviteCode = ''
      if (/^[A-Za-z0-9]+$/.test(scanResult)) {
        inviteCode = scanResult
      } else {
        const match = scanResult.match(/code=([A-Za-z0-9]+)/)
        if (match) {
          inviteCode = match[1]
        }
      }
      
      if (!inviteCode) {
        setTimeout(() => {
          uni.showToast({ title: '无法识别的家庭邀请码', icon: 'none' })
        }, 300)
        return
      }
      
      joinCode.value = inviteCode
      // 扫码成功后，先立即切入“加入中”的精致动画卡片，完全不回填显示原弹框
      isJoining.value = true
      
      // 延时 300ms 执行加入，确保扫码界面收起转场完毕，解决真机卡死或冲突问题
      setTimeout(() => {
        confirmJoin()
      }, 300)
    },
    fail: (err) => {
      if (err && err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
        return
      }
      console.error('扫码发生错误:', err)
    }
  })
}

const myFamiliesList = ref([])

const confirmJoin = async () => {
  const val = joinCode.value.trim()
  if (!val) return uni.showToast({ title: '请输入邀请码', icon: 'none' })
  
  isJoining.value = true
  try {
    const res = await familyApi.joinFamily(val)
    if (res && res.data) {
      const code = res.data.member.familyCode
      const role = res.data.member.role
      
      const finalNick = nickName.value.trim()
      const finalTitle = memberTitle.value.trim()
      if (finalNick || finalTitle) {
        try {
          await familyApi.updateMyFamilyMemberProfile(code, finalNick || '新成员', finalTitle || '成员', '')
        } catch (profErr) {
          console.error('预设修改成员资料失败:', profErr)
        }
      }
      
      const myFamilies = await familyApi.getMyFamilies()
      if (myFamilies && myFamilies.data) {
        myFamiliesList.value = myFamilies.data.families || []
      }
      
      if (myFamiliesList.value.find(item => item.familyCode === code)) {
        isJoining.value = false
        uni.showToast({ title: '成功加入家庭，开始记录每一餐吧~', icon: 'none' })
        uni.setStorageSync('family_code', code)
        setTimeout(() => {
          close()
        }, 1500)
        return
      }
      uni.setStorageSync('family_code', code)
      
      uni.showToast({ title: '成功加入家庭，开始记录每一餐吧~'})
      emit('joined', { code, role })
      
      // 延时 800ms 关闭，让微信原生成功 Toast 完整显示，再丝滑关闭弹窗并回到页面
      setTimeout(() => {
        close()
      }, 800)
    } else {
      isJoining.value = false // 失败则退回输入页面以供修改或再次操作
      uni.showToast({ title: res.message || '加入家庭失败', icon: 'none' })
    }
  } catch (e) {
    isJoining.value = false // 异常则退回输入页面
    uni.showToast({ title: '加入家庭失败', icon: 'none' })
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
  display: flex;
  align-items: center;
  
  .join-input {
    flex: 1;
    height: 60rpx;
    font-size: 28rpx;
    color: #2C3E50;
  }
  
  .scan-icon-btn {
    padding: 0 10rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .scan-icon {
      font-size: 36rpx;
    }
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

.joining-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  width: 100%;
  
  .loading-icon-wrap {
    position: relative;
    width: 120rpx;
    height: 120rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30rpx;
    
    .loading-emoji {
      font-size: 60rpx;
      z-index: 2;
      animation: rotateDish 1.6s infinite ease-in-out;
    }
    
    .loading-pulse {
      position: absolute;
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background: var(--primary-light);
      z-index: 1;
      animation: pulseAnim 1.6s infinite ease-in-out;
    }
  }
  
  .joining-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #2C3E50;
    margin-bottom: 12rpx;
  }
  
  .joining-subtext {
    font-size: 22rpx;
    color: #BDC3C7;
  }
}

@keyframes rotateDish {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.15); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes pulseAnim {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.3); opacity: 0.8; }
  100% { transform: scale(0.8); opacity: 0.5; }
}
</style>

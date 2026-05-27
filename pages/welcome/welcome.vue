<template>
  <view class="welcome-container" :style="themeStyle" @touchmove.stop.prevent="">
    <image v-if="restoreStep === 0" src="@/static/logo.jpg" mode="aspectFill" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1;"></image>
    <!-- 页面零：全新温馨治愈欢迎页 -->
    <view class="splash-step-container" style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 80vh; z-index: 9;" v-if="restoreStep === 0">
      <view class="splash-brand" style="text-align: center; margin-top: 100rpx;">
        <!-- <view class="splash-logo" style="font-size: 150rpx; margin-bottom: 20rpx; animation: bounce 2s infinite ease-in-out;">🍳</view> -->
        <text class="splash-name" style="font-size: 56rpx; font-weight: 900; color: #FF4D6D; display: block; letter-spacing: 4rpx; font-family: system-ui, -apple-system, sans-serif">干饭小家</text>
        <text class="splash-tag" style="font-size: 26rpx; color: #FF4D6D; font-weight: 500; display: inline-block; margin-top: 24rpx; letter-spacing: 1rpx;">好好吃饭，是对自己最大的善意</text>
      </view>
      
      <view class="splash-action-box" style="width: 620rpx; display: flex; flex-direction: column; align-items: center; gap: 40rpx; margin-bottom: 40rpx;">
        <button class="splash-btn-primary" style="background: linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%); color: #fff; font-size: 32rpx; font-weight: bold; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; box-shadow: 0 12rpx 30rpx rgba(255, 90, 121, 0.35); border: none; margin: 0; width: 520rpx; text-align: center;" @click="silentCreateNewFamily">
          开始使用
        </button>
        
        <view class="restore-trigger-link" style="padding: 20rpx 40rpx; cursor: pointer;" @click="restoreStep = 1">
          <text style="font-size: 24rpx; color: #fff; text-decoration: underline; letter-spacing: 1rpx;">之前用过？点击找回旧数据</text>
        </view>
      </view>
    </view>
    
    <!-- 页面一：选择操作页 -->
    <view class="splash-step-container" style="width: 100%; display: flex; flex-direction: column; align-items: center;" v-if="restoreStep === 1">
      <view class="splash-brand" style="text-align: center; margin-top: 80rpx; margin-bottom: 60rpx;">
        <view class="splash-logo" style="font-size: 120rpx; margin-bottom: 10rpx;">🍳</view>
        <text class="splash-name" style="font-size: 52rpx; font-weight: 900; color: #333; display: block; letter-spacing: 2rpx;">Eat-Eat</text>
        <text class="splash-tag" style="font-size: 26rpx; color: var(--primary); font-weight: bold; background: var(--primary-light); padding: 4rpx 20rpx; border-radius: 20rpx; display: inline-block; margin-top: 10rpx;">智能厨房管家</text>
      </view>
      
      <view class="splash-intro-card" style="background: #fff; width: 620rpx; padding: 48rpx; border-radius: 40rpx; box-shadow: 0 16rpx 40rpx rgba(0,0,0,0.03); margin-bottom: 80rpx; text-align: center; border: 2rpx solid var(--primary-light); box-sizing: border-box;">
        <text class="splash-warning-title" style="font-size: 34rpx; font-weight: bold; color: #333; display: block; margin-bottom: 20rpx;">⚠️ 本地家庭数据已丢失</text>
        <text class="splash-warning-desc" style="font-size: 26rpx; color: #666; line-height: 1.6; display: block;">由于小程序误删或清空缓存，本地关联已被切断。若您此前设置过密保或保存过编码，可安全找回全部食材、菜单和账本数据！</text>
      </view>
      
      <view class="splash-action-box" style="width: 620rpx; display: flex; flex-direction: column; gap: 30rpx;">
        <button class="splash-btn-primary" style="background: var(--primary-grad); color: #fff; font-size: 30rpx; font-weight: bold; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; box-shadow: 0 10rpx 24rpx var(--primary-shadow); border: none; margin: 0; width: 100%;" @click="goToRestoreStep2">
          找回家庭数据
        </button>
        <button class="splash-btn-secondary" style="background: #fff; color: #666; font-size: 30rpx; font-weight: bold; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; border: 2rpx solid #EFEFEF; margin: 0; width: 100%; box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.01);" @click="silentCreateNewFamily">
          重新开始
        </button>
      </view>

      <view class="abandon-btn" style="margin-top: 40rpx; padding: 10rpx 40rpx; cursor: pointer;" @click="restoreStep = 0">
        <text class="abandon-text" style="font-size: 26rpx; color: #999; font-weight: 500; text-decoration: underline;">返回欢迎页</text>
      </view>
    </view>
    
    <!-- 页面二：密保找回页 -->
    <view class="splash-step-container" style="width: 100%; display: flex; flex-direction: column; box-sizing: border-box; padding: 0 40rpx;" v-if="restoreStep === 2">
      <view class="splash-back-bar" style="display: flex; align-items: center; padding: 20rpx 0; margin-top: 60rpx; margin-bottom: 40rpx; color: #666; cursor: pointer;" @click="handleBackClick">
        <!-- <text class="back-arrow" style="font-size: 28rpx; margin-right: 10rpx;">◀</text>
        <text class="back-text" style="font-size: 28rpx; font-weight: 500;">返回</text> -->
      </view>
      
      <view class="splash-form-header" style="margin-bottom: 40rpx;">
        <text class="form-title" style="font-size: 42rpx; font-weight: 900; color: #333; display: block; margin-bottom: 12rpx;">🔍 找回家庭数据</text>
        <text class="form-subtitle" style="font-size: 26rpx; color: #888; display: block;">双重密保校验验证，安全找回家庭云端共有资产</text>
      </view>
      
      <view class="splash-form-body" style="background: #fff; padding: 40rpx; border-radius: 36rpx; box-shadow: 0 16rpx 40rpx rgba(0,0,0,0.02); border: 2rpx solid var(--primary-light);">
        <!-- 锁定提示 -->
        <view class="lock-banner" style="background: #FFF2F4; border: 2rpx solid #FFD3DC; padding: 24rpx; border-radius: 16rpx; display: flex; flex-direction: column; align-items: center; margin-bottom: 30rpx; text-align: center;" v-if="isRestoreLocked">
          <text class="lock-icon" style="font-size: 48rpx; margin-bottom: 8rpx;">🔒</text>
          <text class="lock-text" style="color: #FF4D6D; font-size: 26rpx; font-weight: bold;">输入连续错误5次，设备已锁定！</text>
          <text class="lock-countdown" style="color: #FF4D6D; font-size: 24rpx; margin-top: 4rpx;">请于 {{ lockCountdown }} 秒后重试</text>
        </view>
        
        <view class="form-item">
          <text class="form-label" style="font-size: 26rpx; font-weight: bold; color: #555; display: block; margin-bottom: 16rpx;">家庭编码 (FamilyCode)</text>
          <input 
            class="form-input" 
            style="background: #FAFAFA; border: 2rpx solid #F0F0F0; border-radius: 16rpx; height: 90rpx; padding: 0 24rpx; font-size: 28rpx; color: #333; width: 100%; box-sizing: border-box;"
            v-model="restoreForm.familyCode" 
            placeholder="请输入您的家庭编码 (必填)" 
            :disabled="isRestoreLocked"
          />
          <text class="form-hint" style="font-size: 22rpx; color: #bbb; display: block; margin-top: 12rpx; line-height: 1.4;">建议截图保存编码以防数据丢失。如已加入，可向其他成员询问。</text>
        </view>
        
        <view class="form-item" style="margin-top: 36rpx;">
          <text class="form-label" style="font-size: 26rpx; font-weight: bold; color: #555; display: block; margin-bottom: 16rpx;">安全密保问题</text>
          <picker 
            mode="selector" 
            :range="securityQuestions" 
            @change="onRestoreQuestionChange"
            :disabled="isRestoreLocked"
          >
            <view class="picker-value-box" style="background: #FAFAFA; border: 2rpx solid #F0F0F0; border-radius: 16rpx; height: 90rpx; padding: 0 24rpx; display: flex; justify-content: space-between; align-items: center; font-size: 28rpx; color: #333;" :class="{ disabled: isRestoreLocked }">
              <text>{{ restoreForm.question || '请选择密保问题' }}</text>
              <text class="down-arrow" style="font-size: 20rpx; color: #bbb;">▼</text>
            </view>
          </picker>
        </view>
        
        <view class="form-item" style="margin-top: 36rpx;">
          <text class="form-label" style="font-size: 26rpx; font-weight: bold; color: #555; display: block; margin-bottom: 16rpx;">密保问题答案</text>
          <input 
            class="form-input" 
            style="background: #FAFAFA; border: 2rpx solid #F0F0F0; border-radius: 16rpx; height: 90rpx; padding: 0 24rpx; font-size: 28rpx; color: #333; width: 100%; box-sizing: border-box;"
            v-model="restoreForm.answer" 
            placeholder="请输入对应的密保问题答案" 
            :disabled="isRestoreLocked"
          />
        </view>
      </view>
      
      <view class="splash-form-footer" style="margin-top: 48rpx; display: flex; flex-direction: column; align-items: center; gap: 24rpx; padding-bottom: 80rpx;">
        <button 
          class="splash-btn-primary" 
          style="background: var(--primary-grad); color: #fff; font-size: 30rpx; font-weight: bold; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; box-shadow: 0 10rpx 24rpx var(--primary-shadow); border: none; margin: 0; width: 100%;"
          :class="{ disabled: !isRestoreFormComplete || isRestoreLocked }" 
          :disabled="!isRestoreFormComplete || isRestoreLocked"
          @click="submitRestore"
        >
          立即验证并找回
        </button>
        <view class="abandon-btn" style="padding: 10rpx 40rpx; cursor: pointer;" @click="handleBackClick">
          <text class="abandon-text" style="font-size: 26rpx; color: #999; font-weight: 500;">暂不找回，返回</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import familyApi from '@/common/api/family.js'
import config from '@/common/config'

// --- 数据找回与密保双重验证系统 ---
const securityQuestions = ['我的家庭名称是？', '家中常吃的一道菜是？', '自定义家庭备注是？']
const restoreStep = ref(0)
const restoreForm = ref({ familyCode: '', question: '我的家庭名称是？', answer: '' })

// 路由与逻辑来源参数
const isFromSettings = ref(false)

// 安全防暴力破解
const errorCount = ref(0)
const isRestoreLocked = ref(false)
const lockCountdown = ref(0)
let lockTimer = null

const isRestoreFormComplete = computed(() => {
  return restoreForm.value.familyCode.trim() && restoreForm.value.question && restoreForm.value.answer.trim()
})

onLoad((options) => {
  if (options && options.action === 'restore') {
    isFromSettings.value = true
    restoreStep.value = 2 // 直接切入密保校验模式
  }
})

onShow(() => {
  // 冷启动检测：如果是常规进入（非设置页主动跳转）且本地已经有了 family_code，直接闪击重定向到首页，不渲染欢迎页！
  if (!isFromSettings.value) {
    const code = uni.getStorageSync('family_code')
    if (code) {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
})

const handleBackClick = () => {
  if (isFromSettings.value) {
    uni.navigateBack()
  } else {
    restoreStep.value = 0
  }
}

const goToRestoreStep2 = () => {
  restoreForm.value = {
    familyCode: '',
    question: '我的家庭名称是？',
    answer: ''
  }
  restoreStep.value = 2
}

const onRestoreQuestionChange = (e) => {
  const index = e.detail.value
  restoreForm.value.question = securityQuestions[index]
}

// 静默生成全新默认家庭并直接进入
const silentCreateNewFamily = async () => {
  uni.showLoading({ title: '正在初始化...', mask: true })
  try {
    const res = await familyApi.createFamily('我的厨房')
    if (res && res.data && res.data.family) {
      const fam = res.data.family
      const member = res.data.member
      
      uni.setStorageSync('family_code', fam.familyCode)
      uni.setStorageSync('family_name', fam.familyName)
      uni.setStorageSync('family_avatar', fam.avatarUrl || '')
      uni.setStorageSync('family_role', member.role || 'owner')
      
      // 新注册首次进入，设置临时打卡标志避免首次弹出老用户开屏
      uni.setStorageSync('is_first_launch_after_register', 'true')
      
      uni.showToast({ title: '已为您创建默认家庭', icon: 'success' })
      
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 500)
    } else {
      uni.showToast({ title: '创建默认家庭失败', icon: 'none' })
    }
  } catch (e) {
    console.error('静默创建家庭出错', e)
    uni.showToast({ title: '初始化失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 错误处理与防暴力破解锁定
const handleRestoreFailure = () => {
  errorCount.value++
  if (errorCount.value >= 5) {
    isRestoreLocked.value = true
    lockCountdown.value = 300 // 5分钟 = 300秒
    
    uni.showModal({
      title: '尝试次数过多',
      content: '您的尝试次数过多，已被安全锁定5分钟！请稍后再试。',
      showCancel: false
    })
    
    if (lockTimer) clearInterval(lockTimer)
    lockTimer = setInterval(() => {
      lockCountdown.value--
      if (lockCountdown.value <= 0) {
        clearInterval(lockTimer)
        lockTimer = null
        isRestoreLocked.value = false
        errorCount.value = 0
      }
    }, 1000)
  } else {
    uni.showModal({
      title: '验证失败',
      content: '信息校验失败，请核对后重试',
      showCancel: false
    })
  }
}

// 提交密保找回云端验证
const submitRestore = async () => {
  if (isRestoreLocked.value) {
    return uni.showToast({ title: '尝试次数过多，请稍后再试', icon: 'none' })
  }
  
  const targetCode = restoreForm.value.familyCode.trim()
  const targetQuestion = restoreForm.value.question
  const targetAnswer = restoreForm.value.answer.trim()
  
  if (!targetCode || !targetAnswer) {
    return uni.showToast({ title: '请填写完整信息', icon: 'none' })
  }
  
  uni.showLoading({ title: '正在验证中...', mask: true })
  try {
    const res = await familyApi.recoverFamilyBySecurity(targetCode, targetQuestion, targetAnswer)
    
    // 双重校验逻辑：校验通过
    if (res && res.data && res.data.familyCode) {
      uni.showToast({ title: '找回成功！', icon: 'success' })
      
      uni.setStorageSync('family_code', res.data.familyCode)
      uni.setStorageSync('family_name', res.data.familyName || '找回的家庭')
      uni.setStorageSync('family_avatar', res.data.avatarUrl || '')
      uni.setStorageSync('family_role', res.data.role || 'owner')
      
      // 验证找回首次进入，设置临时打卡标志避免首次弹出老用户开屏
      uni.setStorageSync('is_first_launch_after_register', 'true')
      
      errorCount.value = 0
      
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 500)
    } else {
      // 兼容历史老存量家庭：如果后端判断 familyCode 有效但未设置密保，直接可以通过
      if (res && res.message && res.message.includes('不存在')) {
        uni.showToast({ title: '该家庭编码无效，请核对或重新开始', icon: 'none' })
      } else {
        handleRestoreFailure()
      }
    }
  } catch (e) {
    console.error('找回数据请求出错', e)
    const errText = e.message || e.data?.message || ''
    if (errText.includes('不存在') || errText.includes('无效')) {
      uni.showModal({
        title: '提示',
        content: '该家庭编码无效，请核对或重新开始',
        showCancel: false
      })
    } else {
      handleRestoreFailure()
    }
  } finally {
    uni.hideLoading()
  }
}

// 主题与色彩系统统一
const themes = [
  { name: '温柔粉', color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
  { name: '清新绿', color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
  { name: '雾霾蓝', color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
  { name: '暖杏黄', color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
]
const currentTheme = ref(uni.getStorageSync('current_theme') || 0)
const themeStyle = computed(() => {
  const t = themes[currentTheme.value]
  return `
    --primary: ${t.color};
    --primary-grad: ${t.gradient};
    --primary-light: ${t.light};
    --primary-shadow: ${t.shadow};
  `
})
</script>

<style lang="less" scoped>
.welcome-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 100%);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

.disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>

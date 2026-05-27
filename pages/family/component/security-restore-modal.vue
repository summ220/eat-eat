<template>
  <block v-if="modelValue">
    
    <!-- 模式一：查看复制安全编码弹窗 -->
    <view class="modal-mask" v-if="mode === 'code'" @click="close">
      <view class="modal-content" @click.stop>
        <text class="modal-title">🔑 家庭安全编码</text>
        <view class="invite-info" style="margin: 20rpx 0;">
          <text class="invite-desc" style="color: #666; font-size: 26rpx; line-height: 1.5; margin-bottom: 20rpx; display: block; text-align: center;">家庭编码是数据丢失后找回的唯一凭证，请务必截图或保存至安全位置！</text>
          <view class="invite-code-box" style="background: #FAFAFA; border: 2rpx dashed var(--primary, #FF6B8B); padding: 24rpx; border-radius: 16rpx; display: flex; justify-content: space-between; align-items: center;">
            <text class="code-val" style="font-size: 32rpx; font-weight: bold; color: #333; letter-spacing: 1rpx;">{{ familyCode }}</text>
            <text class="copy-btn" style="background: var(--primary, #FF6B8B); color: #fff; padding: 10rpx 24rpx; border-radius: 12rpx; font-size: 24rpx; font-weight: bold;" @click="copyFamilyCode">复制</text>
          </view>
        </view>
        <button class="close-modal-btn prim" style="margin-top: 20rpx;" @click="close">关闭</button>
      </view>
    </view>

    <!-- 模式二：密保问题设置弹窗 -->
    <view class="modal-mask" v-else-if="mode === 'setting'" @click="close">
      <view class="modal-content" @click.stop>
        <text class="modal-title">🛡️ 数据找回密保设置</text>
        <view class="invite-info" style="text-align: left; width: 100%; margin: 20rpx 0;">
          <text class="invite-desc" style="color: #666; font-size: 26rpx; line-height: 1.5; text-align: center; margin-bottom: 30rpx; display: block;">设置密保答案，若未来发生小程序误删或缓存清空，可通过密保安全找回数据。</text>
          
          <view class="security-form" style="background: #FAFAFA; padding: 30rpx; border-radius: 20rpx;">
            <view class="sec-label" style="font-size: 26rpx; color: #888; margin-bottom: 12rpx;">选择密保问题：</view>
            <picker mode="selector" :range="securityQuestions" @change="onSecurityQuestionChange">
              <view class="picker-value-box" style="background: #fff; border: 2rpx solid #EFEFEF; border-radius: 12rpx; height: 80rpx; padding: 0 20rpx; display: flex; justify-content: space-between; align-items: center; font-size: 28rpx; color: #333; margin-bottom: 24rpx;">
                <text>{{ securityForm.question || '请选择密保问题' }}</text>
                <text class="down-arrow" style="font-size: 20rpx; color: #bbb;">▼</text>
              </view>
            </picker>

            <view class="sec-label" style="font-size: 26rpx; color: #888; margin-bottom: 12rpx; margin-top: 10rpx;">密保问题答案：</view>
            <input 
              class="sec-input" 
              style="background: #fff; border: 2rpx solid #EFEFEF; border-radius: 12rpx; height: 80rpx; padding: 0 20rpx; font-size: 28rpx; color: #333;"
              v-model="securityForm.answer" 
              placeholder="请输入您的密保答案" 
            />
          </view>
        </view>
        <view class="modal-btns" style="margin-top: 30rpx; display: flex; gap: 20rpx; width: 100%;">
          <button class="m-btn-sub" style="flex: 1; border-radius: 40rpx; font-size: 28rpx; height: 80rpx; line-height: 80rpx; background: #F5F5F5; color: #666; margin:0;" @click="close">取消</button>
          <button class="m-btn-main" style="flex: 1; border-radius: 40rpx; font-size: 28rpx; height: 80rpx; line-height: 80rpx; background: var(--primary-grad, linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)); color: #fff; box-shadow: 0 8rpx 16rpx var(--primary-shadow, rgba(255,90,121,0.3)); margin:0;" @click="saveSecurityQuestion">保存</button>
        </view>
      </view>
    </view>

    <!-- 模式三：数据找回开屏/大面板 -->
    <view class="restore-splash-fullscreen" v-else-if="mode === 'splash'" @touchmove.stop.prevent="">
      
      <!-- 页面零：全新欢迎开屏页 (温柔治愈粉色系) -->
      <view class="welcome-splash-step" v-if="restoreStep === 0">
        <!-- 顶部: 图标 + 标题 + 副标题 -->
        <view class="welcome-header">
          <view class="welcome-logo-wrap">
            <text class="welcome-logo-emoji">🍳</text>
          </view>
          <text class="welcome-title">干饭小家</text>
          <text class="welcome-subtitle">好好吃饭，是对自己最大的善意</text>
        </view>
        
        <!-- 中间: 粉色胶囊按钮 -->
        <view class="welcome-action-box">
          <button class="welcome-btn-primary" @click="silentCreateNewFamily">
            开始使用
          </button>
        </view>
        
        <!-- 底部: 找回旧数据入口 -->
        <view class="welcome-footer">
          <text class="welcome-link-text" @click="goToRestoreStep1">
            之前用过？点击找回旧数据
          </text>
        </view>
      </view>

      <!-- 页面一：之前的开屏选择操作页 (Eat-Eat 智能厨房管家) -->
      <view class="splash-step-container" style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 40rpx; box-sizing: border-box;" v-if="restoreStep === 1">
        <view class="splash-back-bar" style="display: flex; align-items: center; align-self: flex-start; padding: 20rpx 0; margin-bottom: 40rpx; color: #666;" @click="goBack">
          <text class="back-arrow" style="font-size: 28rpx; margin-right: 10rpx;">◀</text>
          <text class="back-text" style="font-size: 28rpx; font-weight: 500;">返回</text>
        </view>

        <view class="splash-brand" style="text-align: center; margin-bottom: 60rpx;">
          <view class="splash-logo" style="font-size: 120rpx; margin-bottom: 10rpx;">🍳</view>
          <text class="splash-name" style="font-size: 52rpx; font-weight: 900; color: #333; display: block; letter-spacing: 2rpx;">Eat-Eat</text>
          <text class="splash-tag" style="font-size: 26rpx; color: var(--primary, #FF6B8B); font-weight: bold; background: var(--primary-light, #FFE8EE); padding: 4rpx 20rpx; border-radius: 20rpx; display: inline-block; margin-top: 10rpx;">智能厨房管家</text>
        </view>
        
        <view class="splash-intro-card" style="background: #fff; width: 620rpx; padding: 48rpx; border-radius: 40rpx; box-shadow: 0 16rpx 40rpx rgba(0,0,0,0.03); margin-bottom: 80rpx; text-align: center; border: 2rpx solid var(--primary-light, #FFE8EE);">
          <text class="splash-warning-title" style="font-size: 34rpx; font-weight: bold; color: #333; display: block; margin-bottom: 20rpx;">⚠️ 本地家庭数据已丢失</text>
          <text class="splash-warning-desc" style="font-size: 26rpx; color: #666; line-height: 1.6; display: block;">由于小程序误删或清空缓存，本地关联已被切断。若您此前设置过密保或保存过编码，可安全找回全部食材、菜单和账本数据！</text>
        </view>
        
        <view class="splash-action-box" style="width: 620rpx; display: flex; flex-direction: column; gap: 30rpx;">
          <button class="splash-btn-primary" style="background: var(--primary-grad, linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)); color: #fff; font-size: 30rpx; font-weight: bold; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; box-shadow: 0 10rpx 24rpx var(--primary-shadow, rgba(255,90,121,0.3)); border: none; margin: 0; width: 100%;" @click="goToRestoreStep2">
            我之前用过，找回家庭数据
          </button>
          <button class="splash-btn-secondary" style="background: #fff; color: #666; font-size: 30rpx; font-weight: bold; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; border: 2rpx solid #EFEFEF; margin: 0; width: 100%; box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.01);" @click="silentCreateNewFamily">
            首次使用 / 重新开始
          </button>
        </view>
      </view>
      
      <!-- 页面二：密保找回页 -->
      <view class="splash-step-container" style="width: 100%; display: flex; flex-direction: column; padding: 40rpx; box-sizing: border-box;" v-if="restoreStep === 2">
        <view class="splash-back-bar" style="display: flex; align-items: center; padding: 20rpx 0; margin-bottom: 40rpx; color: #666;" @click="goBack">
          <text class="back-arrow" style="font-size: 28rpx; margin-right: 10rpx;">◀</text>
          <text class="back-text" style="font-size: 28rpx; font-weight: 500;">返回</text>
        </view>
        
        <view class="splash-form-header" style="margin-bottom: 40rpx;">
          <text class="form-title" style="font-size: 42rpx; font-weight: 900; color: #333; display: block; margin-bottom: 12rpx;">🔍 找回家庭数据</text>
          <text class="form-subtitle" style="font-size: 26rpx; color: #888; display: block;">双重密保校验验证，安全找回家庭云端共有资产</text>
        </view>
        
        <view class="splash-form-body" style="background: #fff; padding: 40rpx; border-radius: 36rpx; box-shadow: 0 16rpx 40rpx rgba(0,0,0,0.02); border: 2rpx solid var(--primary-light, #FFE8EE);">
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
              style="background: #FAFAFA; border: 2rpx solid #F0F0F0; border-radius: 16rpx; height: 90rpx; padding: 0 24rpx; font-size: 28rpx; color: #333;"
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
              style="background: #FAFAFA; border: 2rpx solid #F0F0F0; border-radius: 16rpx; height: 90rpx; padding: 0 24rpx; font-size: 28rpx; color: #333;"
              v-model="restoreForm.answer" 
              placeholder="请输入对应的密保问题答案" 
              :disabled="isRestoreLocked"
            />
          </view>
        </view>
        
        <view class="splash-form-footer" style="margin-top: 48rpx; display: flex; flex-direction: column; align-items: center; gap: 24rpx;">
          <button 
            class="splash-btn-primary" 
            style="background: var(--primary-grad, linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)); color: #fff; font-size: 30rpx; font-weight: bold; height: 100rpx; line-height: 100rpx; border-radius: 50rpx; box-shadow: 0 10rpx 24rpx var(--primary-shadow, rgba(255, 90, 121, 0.3)); border: none; margin: 0; width: 100%;"
            :class="{ disabled: !isRestoreFormComplete || isRestoreLocked }" 
            :disabled="!isRestoreFormComplete || isRestoreLocked"
            @click="submitRestore"
          >
            立即验证并找回
          </button>
          <view class="abandon-btn" style="padding: 10rpx 40rpx;" @click="goBack">
            <text class="abandon-text" style="font-size: 26rpx; color: #999; font-weight: 500;">暂不找回，返回</text>
          </view>
        </view>
      </view>
    </view>

  </block>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import familyApi from '@/common/api/family.js'
import config from '@/common/config'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'splash' // 'code' | 'setting' | 'splash'
  },
  familyCode: {
    type: String,
    default: ''
  },
  familyName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'update:mode', 'success'])

const securityQuestions = ['我的家庭名称是？', '家中常吃的一道菜是？', '自定义家庭备注是？']
const securityForm = ref({ question: '我的家庭名称是？', answer: '' })

// 找回数据流程
const restoreStep = ref(0)
const restoreForm = ref({ familyCode: '', question: '我的家庭名称是？', answer: '' })

// 安全防暴力破解
const errorCount = ref(0)
const isRestoreLocked = ref(false)
const lockCountdown = ref(0)
let lockTimer = null

const isRestoreFormComplete = computed(() => {
  return restoreForm.value.familyCode.trim() && restoreForm.value.question && restoreForm.value.answer.trim()
})

const initData = () => {
  if (props.mode === 'setting') {
    securityForm.value = {
      question: '我的家庭名称是？',
      answer: ''
    }
  } else if (props.mode === 'splash') {
    restoreStep.value = 0
    restoreForm.value = {
      familyCode: '',
      question: '我的家庭名称是？',
      answer: ''
    }
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    initData()
  }
})

onBeforeUnmount(() => {
  if (lockTimer) clearInterval(lockTimer)
})

const close = () => {
  emit('update:modelValue', false)
}

// ----------------- 安全码管理 -----------------
const copyFamilyCode = () => {
  if (!props.familyCode) return
  uni.setClipboardData({
    data: props.familyCode,
    success: () => {
      uni.showToast({ title: '复制成功', icon: 'success' })
    }
  })
}

// ----------------- 密保问题设定 -----------------
const onSecurityQuestionChange = (e) => {
  const index = e.detail.value
  securityForm.value.question = securityQuestions[index]
}

const saveSecurityQuestion = async () => {
  if (!securityForm.value.answer.trim()) {
    return uni.showToast({ title: '请输入密保答案', icon: 'none' })
  }
  
  uni.showLoading({ title: '正在云端保存...', mask: true })
  try {
    await familyApi.setFamilySecurityQuestion(
      props.familyCode,
      securityForm.value.question,
      securityForm.value.answer.trim()
    )
    uni.showToast({ title: '密保设置成功', icon: 'success' })
    close()
  } catch (e) {
    uni.showToast({ title: '设置密保失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// ----------------- 数据恢复流程 -----------------
const goToRestoreStep1 = () => {
  restoreStep.value = 1
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

const goBack = () => {
  if (props.familyCode) {
    close()
  } else {
    if (restoreStep.value === 2) {
      restoreStep.value = 1
    } else if (restoreStep.value === 1) {
      restoreStep.value = 0
    } else {
      close()
    }
  }
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
      
      uni.showToast({ title: '已为您创建默认家庭', icon: 'success' })
      close()
      
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/family/family' })
      }, 500)
    } else {
      uni.showToast({ title: '创建默认家庭失败', icon: 'none' })
    }
  } catch (e) {
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
    
    if (res && res.data && res.data.familyCode) {
      uni.showToast({ title: '找回成功！', icon: 'success' })
      
      uni.setStorageSync('family_code', res.data.familyCode)
      uni.setStorageSync('family_name', res.data.familyName || '找回的家庭')
      uni.setStorageSync('family_avatar', res.data.avatarUrl || '')
      uni.setStorageSync('family_role', res.data.role || 'owner')
      
      emit('success', res.data)
      close()
      
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/family/family' })
      }, 800)
    } else {
      if (res && res.message && res.message.includes('不存在')) {
        uni.showToast({ title: '该家庭编码无效，请核对或重新开始', icon: 'none' })
      } else {
        handleRestoreFailure()
      }
    }
  } catch (e) {
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
</script>

<style lang="less" scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx;
  box-sizing: border-box;
  animation: modalFadeIn 0.3s ease;
}
.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
  display: block;
}

.invite-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-modal-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: #f5f5f5;
  color: #666;
  border-radius: 45rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
  margin: 0;
}
.close-modal-btn.prim {
  background: var(--primary-grad, linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%));
  color: #fff;
  box-shadow: 0 10rpx 20rpx var(--primary-shadow, rgba(255, 90, 121, 0.3));
}

.modal-btns {
  display: flex;
  gap: 20rpx;
  
  button {
    flex: 1;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 45rpx;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    margin: 0;
  }
  
  .m-btn-sub {
    background: #f5f5f5;
    color: #666;
  }
  .m-btn-main {
    background: var(--primary-grad, linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%));
    color: #fff;
  }
}

.abandon-btn {
  font-size: 26rpx;
  color: #999;
  text-decoration: underline;
  padding: 10rpx 40rpx;
  display: inline-block;
}

/* 欢迎开屏页专属样式 */
.restore-splash-fullscreen {
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100vw;
  height: 100vh; 
  background: linear-gradient(180deg, var(--primary-light, #FFE8EE) 0%, #FAFAFA 100%); 
  z-index: 99999; 
  display: flex; 
  flex-direction: column; 
  box-sizing: border-box;
}

.welcome-splash-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 120rpx 40rpx 80rpx;
  width: 100%;
  box-sizing: border-box;
}

.welcome-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80rpx;
  
  .welcome-logo-wrap {
    width: 180rpx;
    height: 180rpx;
    background: #FFF;
    border-radius: 50rpx;
    box-shadow: 0 20rpx 40rpx rgba(255, 107, 139, 0.15);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 48rpx;
    border: 4rpx solid #FFE8EE;
    
    .welcome-logo-emoji {
      font-size: 90rpx;
    }
  }
  
  .welcome-title {
    font-size: 56rpx;
    font-weight: 900;
    color: #333;
    letter-spacing: 4rpx;
    margin-bottom: 16rpx;
  }
  
  .welcome-subtitle {
    font-size: 26rpx;
    color: #888;
    letter-spacing: 1rpx;
    font-weight: 500;
  }
}

.welcome-action-box {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 120rpx;
  
  .welcome-btn-primary {
    width: 520rpx;
    height: 100rpx;
    line-height: 100rpx;
    background: linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 50rpx;
    box-shadow: 0 12rpx 30rpx rgba(255, 90, 121, 0.35);
    border: none;
    margin: 0;
    text-align: center;
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.97);
    }
  }
}

.welcome-footer {
  margin-bottom: env(safe-area-inset-bottom);
  
  .welcome-link-text {
    font-size: 24rpx;
    color: #999;
    text-decoration: underline;
    padding: 20rpx 40rpx;
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

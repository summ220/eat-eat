<!-- 密保组件 -->
<template>
  <view class="modal-mask" v-if="show" @click="close">
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
        <button class="m-btn-main" style="flex: 1; border-radius: 40rpx; font-size: 28rpx; height: 80rpx; line-height: 80rpx; background: var(--primary-grad); color: #fff; box-shadow: 0 8rpx 16rpx var(--primary-shadow); margin:0;" @click="saveSecurityQuestion">保存</button>
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
  },
  familyCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'saved'])

const securityQuestions = ['我的家庭名称是？', '家中常吃的一道菜是？', '自定义家庭备注是？']
const securityForm = ref({ question: '我的家庭名称是？', answer: '' })

watch(() => props.show, (newVal) => {
  if (newVal) {
    securityForm.value = {
      question: '我的家庭名称是？',
      answer: ''
    }
  }
})

const close = () => {
  emit('close')
}

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
    emit('saved')
    close()
  } catch (e) {
    console.error('设置密保失败', e)
    uni.showToast({ title: '设置密保失败，请重试', icon: 'none' })
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

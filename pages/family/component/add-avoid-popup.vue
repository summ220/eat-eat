<!-- 添加忌口食材弹窗 -->
<template>
  <view class="modal-mask" v-if="show" @click="close">
    <view class="modal-content" @click.stop>
      <text class="modal-title">添加忌口食材</text>
      <view class="input-box">
        <input class="join-input" v-model="newAvoid" placeholder="输入食材名称，如：生姜" focus />
      </view>
      <view class="modal-btns">
        <button class="m-btn-sub" @click="close">取消</button>
        <button class="m-btn-main" @click="confirmAddAvoid">添加</button>
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
  },
  avoidOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

const newAvoid = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    newAvoid.value = ''
  }
})

const close = () => {
  emit('close')
}

const confirmAddAvoid = async () => {
  const val = newAvoid.value.trim()
  if (!val) return
  if (props.avoidOptions.some(x => x.title === val)) {
    return uni.showToast({ title: '已在列表中', icon: 'none' })
  }
  
  uni.showLoading({ title: '正在添加...', mask: true })
  try {
    await familyApi.saveFamilyDietPreference(props.familyCode, JSON.stringify({
      title: val,
      type: 'avoid_food'
    }))
    uni.showToast({ title: '添加成功', icon: 'success' })
    emit('saved')
    close()
  } catch (e) {
    console.error('添加忌口失败', e)
    uni.showToast({ title: '添加失败', icon: 'none' })
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
  margin-bottom: 24rpx;
  width: 100%;
  box-sizing: border-box;
  
  .join-input {
    width: 100%;
    height: 60rpx;
    font-size: 28rpx;
    color: #2C3E50;
  }
}

.modal-btns {
  display: flex;
  gap: 30rpx;
  margin-top: 20rpx;
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

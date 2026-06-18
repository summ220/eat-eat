<!-- 智能管家提醒弹窗 -->
<template>
  <view class="modal-mask" v-if="show" @click="close">
    <view class="modal-content reminder-modal" @click.stop>
      <view class="modal-header">
        <view class="modal-title" style="display: flex; align-items: center;">
          <view class="theme-icon icon-alarm" style="width: 46rpx; height: 46rpx; margin-right: 12rpx;" />
          智能管家提醒
        </view>
        <text class="modal-subtitle">为您整理了 {{ reminders.length }} 条待办事项</text>
      </view>
      
      <scroll-view scroll-y class="reminder-detail-list" :show-scrollbar="false">
        <view class="detail-item" v-for="(r, i) in reminders" :key="i" :class="r.type">
          <view class="d-left">
            <view class="d-icon" style="display: flex; align-items: center;">
              <view class="theme-icon" :class="`icon-${getIconClass(r)}`" style="width: 44rpx; height: 44rpx; margin-right: 16rpx;" />
            </view>
            <view class="d-info">
              <text class="d-text">{{ r.text }}</text>
              <text class="d-type-name">{{ r.type === 'warning' ? '库存预警' : (r.type === 'danger' ? '过期提醒' : '健康建议') }}</text>
            </view>
          </view>
          <view class="d-action-btn" @click="handleReminderAction(r)">{{ r.action }}</view>
        </view>
      </scroll-view>
      
      <button class="close-reminder-btn" @click="close">我知道了</button>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  reminders: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'action'])

const close = () => {
  emit('close')
}

const handleReminderAction = (r) => {
  emit('action', r)
  close()
}

const getIconClass = (r) => {
  if (r.type === 'danger') return 'garbage'
  if (r.type === 'warning') return 'alarm'
  return 'memo'
}
</script>

<style lang="less" scoped>
@import "@/static/icon_base64.css";

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

.reminder-modal {
  width: 620rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
  .modal-header {
    margin-bottom: 30rpx;
    display: flex;
    flex-direction: column;
    
    .modal-title {
      font-size: 34rpx;
      font-weight: 800;
      color: #2C3E50;
      margin-bottom: 8rpx;
    }
    
    .modal-subtitle {
      font-size: 24rpx;
      color: #95A5A6;
    }
  }
}

.reminder-detail-list {
  max-height: 600rpx;
  margin-bottom: 30rpx;
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-radius: 24rpx;
    margin-bottom: 20rpx;
    
    &.warning {
      background: #FFF9E6;
      .d-action-btn { background: #FFB300; }
      .theme-icon { background-color: #FFB300 !important; }
    }
    &.danger {
      background: #FFEBEB;
      .d-action-btn { background: #FF4D4F; }
      .theme-icon { background-color: #FF4D4F !important; }
    }
    &.info {
      background: #EBF3FF;
      .d-action-btn { background: #3498DB; }
      .theme-icon { background-color: #3498DB !important; }
    }
    
    .d-left {
      display: flex;
      align-items: center;
      flex: 1;
      margin-right: 20rpx;
      
      .d-icon {
        display: flex;
        align-items: center;
      }
      
      .d-info {
        display: flex;
        flex-direction: column;
        
        .d-text {
          font-size: 26rpx;
          color: #2C3E50;
          font-weight: 500;
          line-height: 1.4;
        }
        
        .d-type-name {
          font-size: 20rpx;
          color: #7F8C8D;
          margin-top: 4rpx;
        }
      }
    }
    
    .d-action-btn {
      padding: 10rpx 28rpx;
      border-radius: 40rpx;
      color: #fff;
      font-size: 22rpx;
      font-weight: bold;
      white-space: nowrap;
    }
  }
}

.close-reminder-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: var(--primary);
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 100rpx;
  box-shadow: 0 8rpx 20rpx var(--primary-shadow);
  border: none;
  &::after { border: none; }
}
</style>

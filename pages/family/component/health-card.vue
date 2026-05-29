<!-- 家庭健康管理简报自治卡片组件 -->
<template>
  <view class="health-card-body">
    <view class="health-info-row">
      <view class="h-stat">
        <text class="h-val">{{ healthData.avgBmi }}</text>
        <text class="h-label">平均BMI</text>
      </view>
      <view class="h-sep"></view>
      <view class="h-stat">
        <text class="h-val">{{ healthData.statusText }}</text>
        <text class="h-label">状态</text>
      </view>
      <view class="h-sep"></view>
      <view class="h-stat">
        <text class="h-val">{{ healthData.goalAchievement }}</text>
        <text class="h-label">目标达成</text>
      </view>
    </view>
    <view class="health-tip-box">
      <text class="h-tip-icon">🍏</text>
      <text class="h-tip-text">{{ healthData.tipText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  familyCode: {
    type: String,
    default: ''
  }
})

// 默认Mock数据，后续可在loadHealthSummary中直接替换为后端真实数据统计接口
const healthData = ref({
  avgBmi: '22.4',
  statusText: '健康',
  goalAchievement: '85%',
  tipText: '全家近一周饮食结构均衡，建议继续保持。'
})

const loadHealthSummary = async () => {
  if (!props.familyCode) return
  // TODO: 后续在这里设计并请求后端健康管理综合汇总接口
  console.log('加载健康简报汇总，当前家庭安全编码为:', props.familyCode)
}

watch(() => props.familyCode, (newVal) => {
  if (newVal) {
    loadHealthSummary()
  }
}, { immediate: true })

defineExpose({
  loadHealthSummary
})
</script>

<style lang="less" scoped>
.health-card-body {
  background: #FFF;
  border-radius: 36rpx;
  padding: 30rpx 40rpx;
  margin-top: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.02);
  transition: all 0.3s;
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.01);
  }

  .health-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx 0;
    
    .h-stat {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .h-val {
        font-size: 38rpx;
        font-weight: 800;
        color: #2C3E50;
        margin-bottom: 8rpx;
      }
      
      .h-label {
        font-size: 22rpx;
        color: #7F8C8D;
      }
    }
    
    .h-sep {
      width: 2rpx;
      height: 60rpx;
      background: #F0F2F5;
    }
  }

  .health-tip-box {
    margin-top: 24rpx;
    background: #F8F9FA;
    border-radius: 20rpx;
    padding: 20rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    
    .h-tip-icon {
      font-size: 32rpx;
    }
    
    .h-tip-text {
      font-size: 24rpx;
      color: #7F8C8D;
      line-height: 1.4;
    }
  }
}
</style>

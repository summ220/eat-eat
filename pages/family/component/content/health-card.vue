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
import familyApi from '@/common/api/family.js'

const props = defineProps({
  familyCode: {
    type: String,
    default: ''
  }
})

// 默认Mock数据，后续可在loadHealthSummary中直接替换为后端真实数据统计接口
const healthData = ref({
  avgBmi: '--',
  statusText: '加载中',
  goalAchievement: '--',
  tipText: '正在为您拉取家庭最新健康周报...'
})

const loadHealthSummary = async () => {
  if (!props.familyCode) return
  try {
    const res = await familyApi.getHealthMembers(props.familyCode)
    if (res && res.data && res.data.length > 0) {
      const list = res.data
      
      // 1. 加权求和平均 BMI
      let sumBmi = 0
      let bmiCount = 0
      list.forEach(m => {
        const bmiVal = parseFloat(m.bmi)
        if (!isNaN(bmiVal) && bmiVal > 0) {
          sumBmi += bmiVal
          bmiCount++
        }
      })
      
      const avgBmiVal = bmiCount > 0 ? (sumBmi / bmiCount).toFixed(1) : '22.0'
      
      // 2. 根据平均 BMI 计算全家状态
      let status = '健康'
      const avgBmiNum = parseFloat(avgBmiVal)
      if (avgBmiNum < 18.5) status = '偏轻'
      else if (avgBmiNum < 24) status = '健康'
      else if (avgBmiNum < 28) status = '超重'
      else status = '肥胖'
      
      // 3. 计算多维度目标达成度
      let sumProgress = 0
      let progressCount = 0
      list.forEach(m => {
        const start = parseFloat(m.startWeight)
        const target = parseFloat(m.targetWeight)
        const current = parseFloat(m.weight)
        if (!isNaN(start) && !isNaN(target) && !isNaN(current)) {
          const total = Math.abs(start - target)
          if (total > 0) {
            const progressed = Math.min(total, Math.abs(start - current))
            sumProgress += (progressed / total) * 100
            progressCount++
          }
        }
      })
      const avgAchievement = progressCount > 0 ? Math.round(sumProgress / progressCount) + '%' : '100%'
      
      // 4. 定制家庭饮食温馨小管家贴士
      let tip = '全家近一周饮食结构均衡，建议继续保持。'
      if (status === '超重' || status === '肥胖') {
        tip = '全家近一周能量摄入略高，建议控油并多吃些时令蔬菜 🥗'
      } else if (status === '偏轻') {
        tip = '全家近一周营养摄入偏少，建议多补充些优质高蛋白食物 🍗'
      }
      
      healthData.value = {
        avgBmi: avgBmiVal,
        statusText: status,
        goalAchievement: avgAchievement,
        tipText: tip
      }
    } else {
      healthData.value = {
        avgBmi: '22.0',
        statusText: '健康',
        goalAchievement: '100%',
        tipText: '尚未录入家庭健康成员，点击进入健康管理开启旅程 🍏'
      }
    }
  } catch (err) {
    console.error('获取健康汇总失败:', err)
    healthData.value = {
      avgBmi: '--',
      statusText: '获取失败',
      goalAchievement: '--',
      tipText: '健康服务器暂时开小差，请稍后再试 ⏳'
    }
  }
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

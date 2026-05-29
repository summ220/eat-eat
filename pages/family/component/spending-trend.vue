<!-- 近7日开销趋势自治组件 -->
<template>
  <view class="chart-box">
    <view class="chart-bars">
      <view class="bar-col" v-for="(val, day) in trends" :key="day">
        <view class="bar-track">
          <view class="bar-fill" :style="{ height: (val / 200 * 100) + '%' }">
            <text class="bar-val" v-if="val > 0">{{ val }}</text>
          </view>
        </view>
        <text class="bar-label">{{ day }}</text>
      </view>
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

// 默认Mock的消费趋势数据，后续可以直接改为后端统计API
const trends = ref({
  '一': 120, '二': 45, '三': 180, '四': 0, '五': 80, '六': 150, '日': 110
})

const loadSpendingTrends = async () => {
  if (!props.familyCode) return
  // TODO: 后续在这里设计并请求后端家庭开销趋势统计接口
  console.log('加载消费趋势图表, familyCode:', props.familyCode)
}

watch(() => props.familyCode, (newVal) => {
  if (newVal) {
    loadSpendingTrends()
  }
}, { immediate: true })

defineExpose({
  loadSpendingTrends
})
</script>

<style lang="less" scoped>
.chart-box {
  background: #F8F9FA;
  border-radius: 30rpx;
  padding: 40rpx 20rpx 20rpx;
  height: 280rpx;
  display: flex;
  align-items: flex-end;
  margin-top: 20rpx;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  align-items: flex-end;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  height: 100%;
}

.bar-track {
  flex: 1;
  width: 20rpx;
  background: #EAECEF;
  border-radius: 20rpx;
  display: flex;
  align-items: flex-end;
  overflow: visible;
}

.bar-fill {
  width: 100%;
  background: var(--primary-grad);
  border-radius: 20rpx;
  position: relative;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease;
  
  .bar-val {
    position: absolute;
    top: -36rpx;
    left: 50%;
    transform: translateX(-50%);
    font-size: 18rpx;
    color: #95A5A6;
    font-weight: bold;
  }
}

.bar-label {
  font-size: 22rpx;
  color: #7F8C8D;
}
</style>

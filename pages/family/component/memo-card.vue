<!-- 家庭备忘录自治卡片组件 -->
<template>
  <view class="memo-card-body">
    <!-- 如果没有真实备忘（显示漂亮的引导文案） -->
    <view class="memo-preview" v-if="memos.length === 0">
      <text class="memo-icon">📌</text>
      <text class="memo-desc">记录家庭琐事、重要日子或购物心愿单...</text>
    </view>
    <!-- 如果有真实备忘（显示最近的精美便签备忘） -->
    <view class="memo-list" v-else>
      <view class="memo-item" v-for="(memo, idx) in memos.slice(0, 2)" :key="idx">
        <view class="memo-badge" :style="{ backgroundColor: memo.color || 'var(--primary)' }"></view>
        <text class="memo-content">{{ memo.title || memo.content }}</text>
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

// 默认Mock数据，后续可以直接在loadMemoPreview中改为接口请求
const memos = ref([
  // { title: '周末全家野餐购物清单：柠檬、三明治、无糖可乐', color: '#FFD166' },
  // { title: '下周二是外公70大寿寿宴，记得提前订好包厢和蛋糕', color: '#06D6A0' }
])

const loadMemoPreview = async () => {
  if (!props.familyCode) return
  // TODO: 后续在这里设计并请求后端备忘录列表数据，拿到后更新memos.value
  console.log('加载备忘录卡片预览, familyCode:', props.familyCode)
}

watch(() => props.familyCode, (newVal) => {
  if (newVal) {
    loadMemoPreview()
  }
}, { immediate: true })

defineExpose({
  loadMemoPreview
})
</script>

<style lang="less" scoped>
.memo-card-body {
  margin-top: 20rpx;
  background: #FFF;
  border-radius: 36rpx;
  padding: 30rpx 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.02);
  transition: all 0.3s;
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.01);
  }
}

.memo-preview {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #F8F9FA;
  padding: 24rpx 30rpx;
  border-radius: 24rpx;
  
  .memo-icon {
    font-size: 32rpx;
  }
  
  .memo-desc {
    font-size: 26rpx;
    color: #7F8C8D;
    line-height: 1.4;
  }
}

.memo-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.memo-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #F8F9FA;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  
  .memo-badge {
    width: 8rpx;
    height: 32rpx;
    border-radius: 4rpx;
  }
  
  .memo-content {
    font-size: 26rpx;
    color: #2C3E50;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
}
</style>

<template>
  <custom-header title="健康管理" icon="🍳" :back="true" />
  <view class="health-page" :style="themeStyle" v-if="currentMember">
    <!-- 顶部状态栏 -->
    <view class="status-bar-safe"></view>
    
    <!-- 1. 成员切换 -->
    <view class="member-nav">
      <scroll-view scroll-x class="member-scroll" :show-scrollbar="false">
        <view class="member-list">
          <view 
            class="member-item" 
            v-for="(m, idx) in members" 
            :key="idx"
            :class="{ active: currentMemberIdx === idx }"
            @click="currentMemberIdx = idx"
          >
            <image class="m-avatar" :src="m.avatar" mode="aspectFill" />
            <text class="m-name">{{ m.nick }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <scroll-view scroll-y class="main-scroll" :show-scrollbar="false">
      <view class="content-body">
        <!-- 2. BMI & 核心数据 -->
        <view class="data-card bmi-card">
          <view class="bmi-header">
            <view class="bmi-main">
              <text class="bmi-label">当前BMI</text>
              <text class="bmi-val">{{ currentMember.bmi }}</text>
            </view>
            <view class="bmi-tag" :class="getBmiStatusClass(currentMember.bmi)">
              {{ getBmiStatus(currentMember.bmi) }}
            </view>
          </view>
          <view class="data-grid">
            <view class="data-item">
              <text class="d-val">{{ currentMember.weight }}<text class="d-unit">kg</text></text>
              <text class="d-label">当前体重</text>
            </view>
            <view class="d-sep"></view>
            <view class="data-item">
              <text class="d-val">{{ currentMember.height }}<text class="d-unit">cm</text></text>
              <text class="d-label">身高</text>
            </view>
            <view class="d-sep"></view>
            <view class="data-item">
              <text class="d-val">{{ currentMember.age }}<text class="d-unit">岁</text></text>
              <text class="d-label">年龄</text>
            </view>
          </view>
        </view>

        <!-- 3. 健康目标 -->
        <view class="section-box">
          <view class="section-title">
            <text class="t-text">健康目标</text>
            <text class="t-action" @click="openGoalModal">修改</text>
          </view>
          <view class="goal-card">
            <view class="goal-info">
              <view class="goal-tag">{{ currentMember.goalType }}</view>
              <text class="goal-desc">目标体重：{{ currentMember.targetWeight }}kg</text>
            </view>
            <view class="progress-container">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: goalProgress + '%' }"></view>
              </view>
              <view class="progress-labels">
                <text>起始 {{ currentMember.startWeight }}kg</text>
                <text>还差 {{ Math.max(0, currentMember.weight - currentMember.targetWeight).toFixed(1) }}kg</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 4. 体重趋势 -->
        <view class="section-box">
          <view class="section-title">
            <text class="t-text">体重趋势</text>
            <view class="t-tabs">
              <text class="t-tab" :class="{ active: trendType === 'week' }" @click="trendType = 'week'">周</text>
              <text class="t-tab" :class="{ active: trendType === 'month' }" @click="trendType = 'month'">月</text>
            </view>
          </view>
          <view class="trend-card">
            <view class="chart-bars">
              <view class="bar-col" v-for="(v, i) in displayedHistory" :key="i">
                <view class="bar-track">
                  <view class="bar-fill" :style="{ height: getBarHeight(v) }"></view>
                </view>
                <text class="bar-label">{{ getBarLabel(i) }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 5. 推荐餐单 -->
        <view class="section-box">
          <view class="section-title">
            <text class="t-text">专属健康推荐</text>
            <text class="t-action more-link" @click="goToRecipes">查看更多{{ currentMember.goalType.includes('减脂') ? '减脂餐' : '健康餐' }} →</text>
          </view>
          <view class="recipe-grid">
            <view 
              class="recipe-card" 
              v-for="(r, i) in recommendedRecipes" 
              :key="i"
              @click="viewRecipe(r)"
            >
              <image class="r-img" :src="r.image" mode="aspectFill" />
              <view class="r-content">
                <view class="r-header">
                  <text class="r-name">{{ r.name }}</text>
                  <text class="r-fav">❤️</text>
                </view>
                <view class="r-tags">
                  <text class="r-tag kcal-tag">🔥 {{ r.kcal }}kcal</text>
                  <text class="r-tag type-tag">{{ r.type }}</text>
                </view>
                <view class="r-footer">
                  <text class="r-tip">适合您的{{ currentMember.goalType }}目标</text>
                </view>
              </view>
            </view>
          </view>
        </view>

    <view class="footer-safe"></view>
      </view>
    </scroll-view>
    
    <!-- 记录体重弹窗 -->
    <view class="modal-mask" v-if="showWeightModal" @click="showWeightModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">记录今日体重</text>
        <view class="input-group">
          <input class="modal-input" type="digit" v-model="tempWeight" placeholder="输入当前体重" focus />
          <text class="input-unit">kg</text>
        </view>
        <view class="modal-btns">
          <view class="m-btn cancel" @click="showWeightModal = false">取消</view>
          <view class="m-btn confirm" @click="saveWeight">确认保存</view>
        </view>
      </view>
    </view>

    <!-- 修改目标弹窗 -->
    <view class="modal-mask" v-if="showGoalModal" @click="showGoalModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">设置健康目标</text>
        <view class="picker-section">
          <text class="p-label">目标类型</text>
          <view class="type-tags">
            <text 
              v-for="t in ['健康减脂', '维持体态', '增肌塑形', '均衡成长']" 
              :key="t"
              class="type-tag"
              :class="{ active: tempGoalType === t }"
              @click="tempGoalType = t"
            >{{ t }}</text>
          </view>
        </view>
        <view class="input-section">
          <text class="p-label">目标体重</text>
          <view class="input-group">
            <input class="modal-input" type="digit" v-model="tempTargetWeight" placeholder="输入目标体重" />
            <text class="input-unit">kg</text>
          </view>
        </view>
        <view class="modal-btns">
          <view class="m-btn cancel" @click="showGoalModal = false">取消</view>
          <view class="m-btn confirm" @click="saveGoal">保存修改</view>
        </view>
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-btn" @click="openWeightModal">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const currentMemberIdx = ref(0)
const themeStyle = ref('')

const members = ref([
  { 
    nick: '爸爸', 
    avatar: 'https://pic.rmb.bdstatic.com/bjh/240813/dump/2f9e7e45efdb1b9134b9c9af309ffe33.png',
    height: 175, weight: 75.5, age: 35, gender: '男',
    bmi: 24.7, targetWeight: 70, startWeight: 78,
    goalType: '健康减脂',
    history: [78, 77.5, 77, 76.5, 76, 75.8, 75.5]
  },
  { 
    nick: '妈妈', 
    avatar: 'https://pic.rmb.bdstatic.com/bjh/240813/dump/2f9e7e45efdb1b9134b9c9af309ffe33.png',
    height: 162, weight: 52, age: 32, gender: '女',
    bmi: 19.8, targetWeight: 50, startWeight: 54,
    goalType: '维持体态',
    history: [54, 53.5, 53, 52.8, 52.5, 52.2, 52]
  },
  { 
    nick: '宝宝', 
    avatar: 'https://pic.rmb.bdstatic.com/bjh/240813/dump/2f9e7e45efdb1b9134b9c9af309ffe33.png',
    height: 110, weight: 18, age: 5, gender: '男',
    bmi: 14.9, targetWeight: 20, startWeight: 17,
    goalType: '均衡成长',
    history: [17, 17.2, 17.5, 17.6, 17.8, 17.9, 18]
  }
])

console.log('Health.vue script initialized. members count:', members.value.length)

const currentMember = computed(() => {
  if (currentMemberIdx.value < 0 || currentMemberIdx.value >= members.value.length) return null
  return members.value[currentMemberIdx.value]
})

const goalProgress = computed(() => {
  const m = currentMember.value
  if (!m) return 0
  const total = Math.abs(m.startWeight - m.targetWeight)
  if (total === 0) return 100
  const current = Math.abs(m.startWeight - m.weight)
  return Math.min(100, Math.round((current / total) * 100))
})

const recommendedRecipes = ref([
  { name: '西蓝花虾仁炒蛋', kcal: 320, type: '减脂/高蛋白', image: 'https://img-blog.csdnimg.cn/20240110133807328.png' },
  { name: '清蒸柠檬鱼', kcal: 280, type: '低卡/清淡', image: 'https://img-blog.csdnimg.cn/20240110133807328.png' },
  { name: '五谷糙米饭', kcal: 150, type: '优质碳水', image: 'https://img-blog.csdnimg.cn/20240110133807328.png' }
])

const getBmiStatus = (bmi) => {
  if (bmi < 18.5) return '偏轻'
  if (bmi < 24) return '健康'
  if (bmi < 28) return '超重'
  return '肥胖'
}

const getBmiStatusClass = (bmi) => {
  if (bmi < 18.5) return 'under'
  if (bmi < 24) return 'normal'
  if (bmi < 28) return 'over'
  return 'obese'
}

const applyTheme = () => {
  try {
    const themes = [
      { color: '#FF6B8B' }, { color: '#4DB88F' }, { color: '#5B89E5' }, { color: '#F2A13B' }
    ]
    let idx = uni.getStorageSync('current_theme')
    idx = (idx === undefined || idx === null || idx >= themes.length) ? 0 : parseInt(idx)
    themeStyle.value = `--primary: ${themes[idx].color};`
    console.log('Health Page Theme Applied:', themes[idx].color)
  } catch (e) {
    console.error('Apply Theme Failed:', e)
    themeStyle.value = '--primary: #FF6B8B;'
  }
}

onMounted(() => {
  console.log('Health Page Mounted')
  applyTheme()
})

const trendType = ref('week')
const showWeightModal = ref(false)
const showGoalModal = ref(false)
const tempWeight = ref('')
const tempTargetWeight = ref('')
const tempGoalType = ref('')

const displayedHistory = computed(() => {
  const history = currentMember.value.history
  if (trendType.value === 'week') return history.slice(-7)
  return history // 演示用，全量展示
})

const getBarHeight = (v) => {
  // 简单高度映射：假设 40-100kg
  const min = 40, max = 100
  const percent = ((v - min) / (max - min)) * 100
  return Math.max(10, Math.min(100, percent)) + '%'
}

const getBarLabel = (idx) => {
  if (trendType.value === 'week') return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][idx]
  return `${idx + 1}日`
}

const openWeightModal = () => {
  tempWeight.value = currentMember.value.weight
  showWeightModal.value = true
}

const saveWeight = () => {
  const val = parseFloat(tempWeight.value)
  if (isNaN(val) || val <= 0) return uni.showToast({ title: '请输入有效体重', icon: 'none' })
  
  currentMember.value.weight = val
  currentMember.value.history.push(val)
  // 更新BMI
  const h = currentMember.value.height / 100
  currentMember.value.bmi = (val / (h * h)).toFixed(1)
  
  showWeightModal.value = false
  uni.showToast({ title: '记录成功', icon: 'success' })
}

const openGoalModal = () => {
  tempTargetWeight.value = currentMember.value.targetWeight
  tempGoalType.value = currentMember.value.goalType
  showGoalModal.value = true
}

const saveGoal = () => {
  const val = parseFloat(tempTargetWeight.value)
  if (isNaN(val) || val <= 0) return uni.showToast({ title: '请输入有效目标', icon: 'none' })
  
  currentMember.value.targetWeight = val
  currentMember.value.goalType = tempGoalType.value
  
  showGoalModal.value = false
  uni.showToast({ title: '目标已更新', icon: 'success' })
}
</script>

<style lang="less" scoped>
.health-page {
  background: #F8F9FB;
  min-height: 100vh;
}

// .status-bar-safe { height: env(safe-area-inset-top); padding-top: 40rpx; }

/* 1. 成员导航 */
.member-nav {
  background: #fff; padding: 30rpx 0;
  border-radius: 0 0 60rpx 60rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  margin-bottom: 20rpx;

  .member-list {
    display: flex; gap: 40rpx; padding: 10px 40rpx;
    .member-item {
      display: flex; flex-direction: column; align-items: center; gap: 12rpx;
      opacity: 0.35; transition: all 0.4s cubic-bezier(0.2, 1, 0.3, 1);
      
      &.active { 
        opacity: 1; transform: scale(1.1); 
        .m-avatar { border-color: var(--primary); box-shadow: 0 8rpx 20rpx var(--primary-shadow); }
        .m-name { color: #2C3E50; font-weight: 900; }
      }
      
      .m-avatar { 
        width: 80rpx; height: 80rpx; border-radius: 50%; 
        border: 4rpx solid #fff; transition: all 0.3s;
      }
      .m-name { font-size: 22rpx; font-weight: 600; color: #BDC3C7; }
    }
  }
}

.main-scroll { height: calc(100vh - 240rpx); }
.content-body { padding: 30rpx 40rpx 100rpx; }

/* 通用卡片样式 */
.card-common {
  background: #fff; border-radius: 48rpx; padding: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.03);
  margin-bottom: 40rpx;
}

/* 2. BMI 卡片 */
.bmi-card {
  .card-common();
  background: linear-gradient(135deg, #F0F9F4 0%, #FFFFFF 100%);
  border: 2rpx solid rgba(77, 184, 143, 0.1);
  
  .bmi-header {
    display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50rpx;
    .bmi-main {
      .bmi-label { font-size: 24rpx; color: #7F8C8D; font-weight: 600; margin-bottom: 8rpx; display: block; }
      .bmi-val { font-size: 88rpx; font-weight: 900; color: #2E7D32; line-height: 1; letter-spacing: -2rpx; }
    }
    .bmi-tag {
      padding: 6rpx 20rpx; border-radius: 100rpx; font-size: 20rpx; font-weight: 800; opacity: 0.6;
      &.normal { background: #E8F5E9; color: #2E7D32; }
      &.under { background: #E3F2FD; color: #1976D2; }
      &.over { background: #FFF3E0; color: #EF6C00; }
      &.obese { background: #FFEBEE; color: #C62828; }
    }
  }
  
  .data-grid {
    display: flex; justify-content: space-between; align-items: center; padding: 10rpx 0;
    .data-item {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      .d-val { font-size: 40rpx; font-weight: 900; color: #2C3E50; 
        .d-unit { font-size: 20rpx; margin-left: 4rpx; color: #BDC3C7; }
      }
      .d-label { font-size: 22rpx; color: #95A5A6; font-weight: 600; margin-top: 6rpx; }
    }
    .d-sep { width: 2rpx; height: 50rpx; background: rgba(0,0,0,0.05); }
  }
}

/* 3. 健康目标 */
.goal-card {
  .card-common();
  .goal-info {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx;
    .goal-tag { background: #E8F5E9; color: #2E7D32; font-size: 22rpx; font-weight: 900; padding: 10rpx 24rpx; border-radius: 100rpx; }
    .goal-desc { font-size: 32rpx; color: #2C3E50; font-weight: 900; }
  }
  .progress-container {
    .progress-bar {
      height: 16rpx; background: #F5F6F7; border-radius: 100rpx; margin-bottom: 20rpx; overflow: hidden;
      .progress-fill { height: 100%; background: linear-gradient(to right, #68CBA6, #45A57F); border-radius: 100rpx; }
    }
    .progress-labels {
      display: flex; justify-content: space-between; font-size: 22rpx; color: #BDC3C7; font-weight: 600;
    }
  }
}

/* 4. 体重趋势 */
.trend-card {
  .card-common();
  .chart-bars {
    height: 240rpx; display: flex; align-items: flex-end; justify-content: space-between; padding: 20rpx 0;
    .bar-col {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 16rpx;
      .bar-track {
        flex: 1; width: 14rpx; background: #F8F9FA; border-radius: 100rpx; display: flex; align-items: flex-end;
        .bar-fill { width: 100%; background: #4DB88F; border-radius: 100rpx; opacity: 0.5; transition: height 0.6s ease; }
      }
      .bar-label { font-size: 20rpx; color: #BDC3C7; font-weight: 600; }
    }
  }
}

/* 5. 推荐菜谱 */
.section-box {
  margin-bottom: 40rpx;
  .section-title {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 28rpx; padding: 0 10rpx;
    .t-text { font-size: 32rpx; font-weight: 900; color: #2C3E50; }
    .t-action { font-size: 24rpx; color: #BDC3C7; font-weight: 600; }
    .more-link { color: var(--primary); font-weight: 800; }
    .t-tabs {
      display: flex; background: #F0F2F5; padding: 6rpx; border-radius: 100rpx;
      .t-tab {
        padding: 8rpx 28rpx; font-size: 22rpx; font-weight: 800; color: #95A5A6;
        &.active { background: #fff; color: #2C3E50; border-radius: 100rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }
      }
    }
  }
}

.recipe-grid {
  display: flex; flex-direction: column; gap: 30rpx;
  .recipe-card {
    background: #fff; border-radius: 40rpx; overflow: hidden; box-shadow: 0 12rpx 30rpx rgba(0,0,0,0.03);
    .r-img { width: 100%; height: 300rpx; background: #f0f0f0; }
    .r-content {
      padding: 30rpx;
      .r-header { 
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx;
        .r-name { font-size: 34rpx; font-weight: 900; color: #2C3E50; }
        .r-fav { font-size: 32rpx; opacity: 0.1; }
      }
      .r-tags {
        display: flex; gap: 16rpx; margin-bottom: 20rpx;
        .r-tag { padding: 6rpx 20rpx; border-radius: 100rpx; font-size: 20rpx; font-weight: 800; }
        .kcal-tag { background: #FFF9F0; color: #F2A13B; }
        .type-tag { background: #F0F9F4; color: #4DB88F; }
      }
      .r-footer {
        border-top: 2rpx solid #F8F9FA; padding-top: 20rpx;
        .r-tip { font-size: 22rpx; color: #BDC3C7; font-weight: 600; }
      }
    }
    &:active { transform: scale(0.98); opacity: 0.9; }
  }
}

.fab-btn {
  position: fixed; right: 40rpx; bottom: 60rpx;
  width: 110rpx; height: 110rpx; border-radius: 50%;
  background: var(--primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 12rpx 30rpx var(--primary-shadow);
  .fab-icon { font-size: 52rpx; }
  &:active { transform: scale(0.9); }
}

.footer-safe { height: env(safe-area-inset-bottom); padding-bottom: 60rpx; }

/* 弹窗样式 */
.modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4); z-index: 3000;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(8px);
}

.modal-content {
  width: 600rpx; background: #fff; border-radius: 56rpx; padding: 50rpx;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.1);
  
  .modal-title { font-size: 34rpx; font-weight: 900; color: #2C3E50; margin-bottom: 40rpx; display: block; text-align: center; }
  
  .p-label { font-size: 24rpx; color: #95A5A6; font-weight: 800; margin-bottom: 20rpx; display: block; }
  
  .input-group {
    display: flex; align-items: flex-end; gap: 10rpx; background: #F8F9FA; padding: 30rpx; border-radius: 32rpx; margin-bottom: 40rpx;
    .modal-input { flex: 1; font-size: 48rpx; font-weight: 900; color: var(--primary); height: 60rpx; }
    .input-unit { font-size: 24rpx; color: #BDC3C7; font-weight: 800; margin-bottom: 8rpx; }
  }
  
  .type-tags {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 20rpx; margin-bottom: 40rpx;
    .type-tag {
      background: #F8F9FA; color: #95A5A6; font-size: 24rpx; font-weight: 800; padding: 24rpx; text-align: center; border-radius: 24rpx;
      &.active { background: var(--primary-light); color: var(--primary); border: 2rpx solid var(--primary); }
    }
  }
  
  .modal-btns {
    display: flex; gap: 20rpx; margin-top: 20rpx;
    .m-btn {
      flex: 1; height: 90rpx; display: flex; align-items: center; justify-content: center; border-radius: 100rpx; font-size: 28rpx; font-weight: 900;
      &.cancel { background: #F8F9FA; color: #BDC3C7; }
      &.confirm { background: var(--primary-grad); color: #fff; box-shadow: 0 8rpx 20rpx var(--primary-shadow); }
    }
  }
}
</style>

<!-- 健康管理组件 -->
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
            <image class="m-avatar" :src="m.avatarUrl ? (m.avatarUrl.startsWith('http') ? m.avatarUrl : config.imgBaseUrl + m.avatarUrl) : config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbqsd7_0d13d785d123.jpg'" mode="aspectFill" />
            <text class="m-name">{{ m.name || '干饭人' }}</text>
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
              <text class="bmi-val">{{ currentMember.bmi || '21.0' }}</text>
            </view>
            <view class="bmi-tag" :class="getBmiStatusClass(currentMember.bmi)">
              {{ getBmiStatus(currentMember.bmi) }}
            </view>
          </view>
          <view class="data-grid">
            <view class="data-item">
              <text class="d-val">{{ currentMember.weight || '--' }}<text class="d-unit">kg</text></text>
              <text class="d-label">当前体重</text>
            </view>
            <view class="d-sep"></view>
            <view class="data-item">
              <text class="d-val">{{ currentMember.height || '--' }}<text class="d-unit">cm</text></text>
              <text class="d-label">身高</text>
            </view>
            <view class="d-sep"></view>
            <view class="data-item">
              <text class="d-val">{{ currentMember.age || '--' }}<text class="d-unit">岁</text></text>
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
              <view class="goal-tag">{{ currentMember.goalType || '维持体态' }}</view>
              <text class="goal-desc">目标体重：{{ currentMember.targetWeight || '--' }}kg</text>
            </view>
            <view class="progress-container">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: goalProgress + '%' }"></view>
              </view>
              <view class="progress-labels">
                <!-- <text>起始 {{ currentMember.startWeight || '--' }}kg</text> -->
                <text>还差 {{ Math.max(0, (currentMember.weight || 0) - (currentMember.targetWeight || 0)).toFixed(1) }}kg</text>
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
            <view class="chart-bars" v-if="displayedHistory.length > 0">
              <view class="bar-col" v-for="(v, i) in displayedHistory" :key="i">
                <view class="bar-track">
                  <view class="bar-fill" :style="{ height: getBarHeight(v) }"></view>
                </view>
                <text class="bar-label">{{ v.label || getBarLabel(i) }}</text>
              </view>
            </view>
            <view class="trend-empty" v-else>
              <text class="empty-tip">暂无体重统计趋势记录，去添加一条吧 🍏</text>
            </view>
          </view>
        </view>

        <!-- 5. 推荐餐单 -->
        <view class="section-box">
          <view class="section-title">
            <text class="t-text">专属健康推荐</text>
            <text class="t-action more-link" @click="goToRecipes">查看更多 →</text>
          </view>
          <view class="recipe-grid">
            <view 
              class="recipe-card" 
              v-for="(r, i) in recommendedRecipes" 
              :key="i"
              @click="viewRecipe(r)"
            >
              <image class="r-img" :src="r.image || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'" mode="aspectFill" />
              <view class="r-content">
                <view class="r-header">
                  <text class="r-name">{{ r.name || '干饭人' }}</text>
                  <text class="r-fav">❤️</text>
                </view>
                <view class="r-tags">
                  <text class="r-tag kcal-tag">🔥 {{ r.kcal || '200' }}kcal</text>
                  <text class="r-tag type-tag">{{ r.type || '营养均衡' }}</text>
                </view>
                <view class="r-footer">
                  <text class="r-tip">适合您的{{ currentMember.goalType || '健康' }}目标</text>
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
            <!-- '健康减脂', '维持体态', '增肌塑形', '均衡成长', '提升耐力', '健康饮食' -->
            <text 
              v-for="t in ['健康减脂', '维持体态', '增肌塑形', '均衡成长', '提升耐力', '健康饮食']" 
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

        <view class="input-section" style="margin-top: 20rpx;">
          <text class="p-label">身高</text>
          <view class="input-group">
            <input class="modal-input" type="digit" v-model="tempHeight" placeholder="输入当前身高" />
            <text class="input-unit">cm</text>
          </view>
        </view>

        <view class="input-section" style="margin-top: 20rpx;">
          <text class="p-label">年龄</text>
          <view class="input-group">
            <input class="modal-input" type="number" v-model="tempAge" placeholder="输入当前年龄" />
            <text class="input-unit">岁</text>
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
import { ref, computed, watch, onMounted } from 'vue'
import familyApi from '@/common/api/family.js'
import { onShow } from '@dcloudio/uni-app'
import config from '@/common/config'

const familyCode = uni.getStorageSync('family_code')

const currentMemberIdx = ref(0)
const themeStyle = ref('')

const members = ref([])
const trendHistory = ref([])
const recommendedRecipes = ref([])

onShow(() => {
  loadFamilyMembers()
})

const loadFamilyMembers = async () => {
  try {
    const res = await familyApi.getHealthMembers(familyCode)
    if (res && res.data) {
      members.value = res.data || []
      // 找出自己
      members.value.forEach(m => {
        if (m.deviceId === uni.getStorageSync('device_id')) {
          m.isSelf = true
        } else {
          m.isSelf = false
        }
      })
      // 自己排到第一位，管理员第二，其他顺延
      members.value.sort((a, b) => {
        const scoreA = (a.isSelf ? 10 : 0) + (a.role === 'owner' ? 5 : 0)
        const scoreB = (b.isSelf ? 10 : 0) + (b.role === 'owner' ? 5 : 0)
        return scoreB - scoreA
      })

      // 默认加载第一个健康成员的详情
      if (members.value.length > 0) {
        await loadCurrentMemberDetail()
      }
    }
  } catch (err) {
    console.error('获取家庭健康成员列表失败:', err)
  }
}

const currentMember = computed(() => {
  if (currentMemberIdx.value < 0 || currentMemberIdx.value >= members.value.length) return null
  return members.value[currentMemberIdx.value]
})

// 监听当前选中的成员变化以刷新详情
watch(currentMemberIdx, () => {
  loadCurrentMemberDetail()
})

const loadCurrentMemberDetail = async () => {
  const m = currentMember.value
  if (!m) return
  uni.showLoading({ title: '加载健康信息...', mask: true })
  try {
    const resDetail = await familyApi.getFamilyHealthMember(familyCode, m.memberId)
    if (resDetail && resDetail.data) {
      // 合并详细数据至当前选中成员对象中
      Object.assign(m, {
        height: resDetail.data.height || 170,
        weight: resDetail.data.weight || 60,
        age: resDetail.data.age || 25,
        bmi: resDetail.data.bmi || '20.8',
        targetWeight: resDetail.data.targetWeight || 55,
        startWeight: resDetail.data.startWeight || 60,
        goalType: resDetail.data.goalType || '维持体态'
      })
    }
    
    // 并行拉取体重趋势和食谱推荐
    await Promise.all([
      loadCurrentMemberTrend(),
      loadCurrentMemberRecommendations()
    ])
  } catch (err) {
    console.error('加载成员详细指标失败:', err)
  } finally {
    uni.hideLoading()
  }
}

const loadCurrentMemberTrend = async () => {
  const m = currentMember.value
  console.log('loadCurrentMemberTrend', m)
  if (!m) return
  try {
    const resTrend = await familyApi.getFamilyHealthMemberTrend(familyCode, m.memberId, trendType.value)
    if (resTrend && resTrend.data) {
      trendHistory.value = resTrend.data.history || []
    } else {
      trendHistory.value = []
    }
  } catch (err) {
    console.error('获取体重趋势失败:', err)
    trendHistory.value = []
  }
}

const loadCurrentMemberRecommendations = async () => {
  const m = currentMember.value
  if (!m) return
  try {
    const resRec = await familyApi.getFamilyHealthMemberRecommendations(familyCode, m.memberId, 'recommend')
    if (resRec && resRec.data) {
      recommendedRecipes.value = resRec.data.recommendations || []
    } else {
      recommendedRecipes.value = []
    }
  } catch (err) {
    console.error('获取专属推荐失败:', err)
    recommendedRecipes.value = []
  }
}

const goalProgress = computed(() => {
  const m = currentMember.value
  if (!m) return 0
  const start = m.startWeight || 60
  const target = m.targetWeight || 55
  const current = m.weight || 60
  const total = Math.abs(start - target)
  if (total === 0) return 100
  const progressed = Math.abs(start - current)
  return Math.min(100, Math.round((progressed / total) * 100))
})

const getBmiStatus = (bmi) => {
  const val = parseFloat(bmi)
  if (isNaN(val)) return '健康'
  if (val < 18.5) return '偏轻'
  if (val < 24) return '健康'
  if (val < 28) return '超重'
  return '肥胖'
}

const getBmiStatusClass = (bmi) => {
  const val = parseFloat(bmi)
  if (isNaN(val)) return 'normal'
  if (val < 18.5) return 'under'
  if (val < 24) return 'normal'
  if (val < 28) return 'over'
  return 'obese'
}

const applyTheme = () => {
  try {
    const themes = [
      { color: '#FF6B8B' }, { color: '#4DB88F' }, { color: '#5B89E5' }, { color: '#F2A13B' }
    ]
    let idx = uni.getStorageSync('current_theme')
    idx = (idx === undefined || idx === null || idx >= themes.length) ? 0 : parseInt(idx)
    const color = themes[idx].color
    themeStyle.value = `
      --primary: ${color};
      --primary-grad: linear-gradient(135deg, ${color} 0%, ${color}ee 100%);
      --primary-shadow: ${color}33;
      --primary-light: ${color}14;
    `
  } catch (e) {
    themeStyle.value = `
      --primary: #FF6B8B;
      --primary-grad: linear-gradient(135deg, #FF6B8B 0%, #FF6B8Bee 100%);
      --primary-shadow: #FF6B8B33;
      --primary-light: #FF6B8B14;
    `
  }
}

onMounted(() => {
  applyTheme()
})

const trendType = ref('week')
const showWeightModal = ref(false)
const showGoalModal = ref(false)
const tempWeight = ref('')
const tempTargetWeight = ref('')
const tempGoalType = ref('')
const tempHeight = ref('')
const tempAge = ref('')

// 监听趋势统计类型变化
watch(trendType, () => {
  loadCurrentMemberTrend()
})

const displayedHistory = computed(() => {
  return trendHistory.value
})

const getBarHeight = (v) => {
  const val = typeof v === 'object' && v !== null ? v.weight : parseFloat(v)
  if (isNaN(val) || val <= 0) return '0%'
  const min = 40, max = 100
  const percent = ((val - min) / (max - min)) * 100
  return Math.max(10, Math.min(100, percent)) + '%'
}

const getBarLabel = (idx) => {
  if (trendType.value === 'week') return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][idx] || `${idx + 1}`
  return `${idx + 1}日`
}

const openWeightModal = () => {
  tempWeight.value = currentMember.value ? currentMember.value.weight : ''
  showWeightModal.value = true
}

const saveWeight = async () => {
  const val = parseFloat(tempWeight.value)
  if (isNaN(val) || val <= 0) return uni.showToast({ title: '请输入有效体重', icon: 'none' })
  
  const m = currentMember.value
  if (!m) return
  
  uni.showLoading({ title: '正在记录体重...', mask: true })
  try {
    await familyApi.recordFamilyHealthMemberWeight(familyCode, m.memberId, val)
    uni.showToast({ title: '记录成功', icon: 'success' })
    showWeightModal.value = false
    await loadCurrentMemberDetail()
  } catch (err) {
    console.error('记录体重失败:', err)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const openGoalModal = () => {
  const m = currentMember.value
  if (!m) return
  tempTargetWeight.value = m.targetWeight || ''
  tempGoalType.value = m.goalType || '健康减脂'
  tempHeight.value = m.height || ''
  tempAge.value = m.age || ''
  showGoalModal.value = true
}

const saveGoal = async () => {
  const val = parseFloat(tempTargetWeight.value)
  if (isNaN(val) || val <= 0) return uni.showToast({ title: '请输入有效目标体重', icon: 'none' })
  
  const heightVal = parseFloat(tempHeight.value)
  if (isNaN(heightVal) || heightVal <= 0) return uni.showToast({ title: '请输入有效身高', icon: 'none' })
  
  const ageVal = parseInt(tempAge.value)
  if (isNaN(ageVal) || ageVal <= 0) return uni.showToast({ title: '请输入有效年龄', icon: 'none' })
  
  const m = currentMember.value
  if (!m) return
  
  uni.showLoading({ title: '正在保存健康目标...', mask: true })
  try {
    await familyApi.updateFamilyHealthMemberGoal(
      familyCode,
      m.memberId,
      val,
      heightVal,
      ageVal,
      tempGoalType.value
    )
    uni.showToast({ title: '保存成功', icon: 'success' })
    showGoalModal.value = false
    await loadCurrentMemberDetail()
  } catch (err) {
    console.error('更新健康目标失败:', err)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const goToRecipes = () => {
  uni.switchTab({
    url: '/pages/recipe/recipe'
  })
}

const viewRecipe = (r) => {
  if (r.id) {
    uni.navigateTo({
      url: `/pages/recipe/detail?id=${r.id}`
    })
  } else {
    uni.navigateTo({
      url: `/pages/recipe/search?keyword=${encodeURIComponent(r.name)}`
    })
  }
}
</script>

<style lang="less" scoped>
.health-page {
  background: #F8F9FB;
  min-height: 100vh;
}

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
  .trend-empty {
    height: 240rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    .empty-tip {
      font-size: 24rpx;
      color: #95A5A6;
      font-style: italic;
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
  max-height: 85vh;
  overflow-y: auto;
  
  .modal-title { font-size: 34rpx; font-weight: 900; color: #2C3E50; margin-bottom: 40rpx; display: block; text-align: center; }
  
  .p-label { font-size: 24rpx; color: #95A5A6; font-weight: 800; margin-bottom: 20rpx; display: block; }
  
  .input-group {
    display: flex; align-items: flex-end; gap: 10rpx; background: #F8F9FA; padding: 20rpx 30rpx; border-radius: 32rpx; margin-bottom: 20rpx;
    .modal-input { flex: 1; font-size: 40rpx; font-weight: 900; color: var(--primary); height: 60rpx; }
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
    display: flex; gap: 20rpx; margin-top: 40rpx;
    .m-btn {
      flex: 1; height: 90rpx; display: flex; align-items: center; justify-content: center; border-radius: 100rpx; font-size: 28rpx; font-weight: 900;
      &.cancel { background: #F8F9FA; color: #BDC3C7; }
      &.confirm { background: var(--primary-grad); color: #fff; box-shadow: 0 8rpx 20rpx var(--primary-shadow); }
    }
  }
}
</style>

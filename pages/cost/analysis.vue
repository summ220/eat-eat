<template>
  <custom-header title="账本数据分析" icon="📊" :back="true" />
  <view class="page" :style="themeStyle">
    
    <!-- 头部月份与日期筛选切换栏 -->
    <view class="month-selector-wrap">
      <view class="month-selector">
        <picker 
          mode="date" 
          :fields="filterMode === 'month' || filterMode === 'week' ? 'year' : 'month'" 
          :value="pickerValue" 
          @change="handlePickerChange"
        >
          <view class="month-text-box">
            <text class="month-text">{{ displayDateString }}</text>
            <text class="calendar-icon">📅</text>
          </view>
        </picker>
      </view>
      
      <!-- 月/周/天 分段胶囊 -->
      <view class="mode-capsule">
        <view 
          class="mode-btn" 
          :class="{ active: filterMode === 'month' }" 
          @click="switchFilterMode('month')"
        >月</view>
        <view 
          class="mode-btn" 
          :class="{ active: filterMode === 'week' }" 
          @click="switchFilterMode('week')"
        >周</view>
        <view 
          class="mode-btn" 
          :class="{ active: filterMode === 'day' }" 
          @click="switchFilterMode('day')"
        >天</view>
      </view>
    </view>

    <!-- 总花费统计卡片 -->
    <view class="header-card">
      <text class="title">{{ summaryTitle }}总花费</text>
      <text class="total-money">¥{{ totalCost }}</text>
      <view class="ratio-wrap" v-if="dominantCategoryText">
        <text class="ratio-text">{{ dominantCategoryText }}</text>
      </view>
    </view>

    <!-- 趋势图表区 (使用 100% 兼容的 HTML/CSS 直方图柱状图渲染) -->
    <view class="chart-section" v-if="trendData.length > 0">
      <text class="section-title">📈 花费变化趋势<text class="sub-title-tip">（点击下方柱状图可查看单项占比分析）</text></text>
      <scroll-view scroll-x class="trend-scroll" :show-scrollbar="false">
        <view class="trend-chart-box" :style="{ width: trendChartWidth }">
          <view class="bar-chart-body">
            <!-- 纵向刻度虚线 -->
            <view class="grid-line" style="top: 0%"></view>
            <view class="grid-line" style="top: 50%"></view>
            <view class="grid-line" style="top: 100%"></view>
            
            <!-- 柱子容器 -->
            <view class="bars-container">
              <view 
                class="bar-item" 
                :class="{ active: selectedTrendIndex === idx }"
                v-for="(item, idx) in trendData" 
                :key="idx"
                @click="selectTrendBar(idx)"
              >
                <!-- 气泡提示数值 -->
                <text class="bar-val" v-if="item.val > 0">¥{{ Math.round(item.val) }}</text>
                <view class="bar-col-wrap">
                  <view 
                    class="bar-col" 
                    :style="{ 
                      height: item.heightPercentage + '%', 
                      background: item.val > 0 ? 'var(--primary-grad)' : '#EAEAEA'
                    }"
                  ></view>
                </view>
                <text class="bar-label">{{ item.label }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="scroll-tip" v-if="filterMode === 'day' || filterMode === 'week'">左右滑动可查看完整趋势 ◀▶</view>
    </view>

    <!-- 类型占比分析图表区 (使用 CSS 渐变环及横向精细进度条展现) -->
    <view class="chart-section" v-if="categoryData.length > 0">
      <view class="section-title-row">
        <text class="section-title">🍰 {{ selectedPeriodLabel }}各分类花费占比 (¥{{ periodTotalCost }})</text>
        <text v-if="selectedTrendIndex !== -1" class="reset-btn" @click="selectedTrendIndex = -1">返回全部</text>
      </view>
      
      <view class="category-breakdown">
        <view class="cat-row" v-for="(item, idx) in categoryData" :key="idx">
          <view class="cat-row-info">
            <view class="cat-lbl">
              <view class="cat-dot" :style="{ backgroundColor: item.color }"></view>
              <text class="cat-name">{{ item.name }}</text>
            </view>
            <view class="cat-val-group">
              <text class="cat-val">¥{{ item.value.toFixed(2) }}</text>
              <text class="cat-ratio">{{ item.ratio.toFixed(1) }}%</text>
            </view>
          </view>
          <!-- 进度条 -->
          <view class="progress-track">
            <view 
              class="progress-fill" 
              :style="{ width: item.ratio + '%', background: 'linear-gradient(90deg, ' + item.color + 'EE, ' + item.color + ')' }"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">📂</text>
      <text class="empty-txt">当前筛选区间下暂无账目记录</text>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import shopApi from '@/common/api/shop.js'
import costApi from '@/common/api/cost.js'

let familyCode = uni.getStorageSync('family_code') || ''

// ---- 主题系统 ----
const themes = [
  { name: '温柔粉', color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
  { name: '清新绿', color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
  { name: '雾霾蓝', color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
  { name: '暖杏黄', color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
]
const currentTheme = ref(uni.getStorageSync('current_theme') || 0)
const themeStyle = computed(() => {
  const t = themes[currentTheme.value]
  return `
    --primary: ${t.color};
    --primary-grad: ${t.gradient};
    --primary-light: ${t.light};
    --primary-shadow: ${t.shadow};
  `
})

// ---- 筛选状态与日期切换 ----
const filterMode = ref('month') // 'month' | 'week' | 'day'
const currentDate = ref(new Date())
const rawList = ref([])
const categories = ref([])
const selectedTrendIndex = ref(-1) // 选中的柱子索引，-1 表示未选择（显示全部）

// 计算当前日期在一年中的周数 (ISO 周数)
const getWeekNumber = (date) => {
  const d = typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : new Date(date)
  if (isNaN(d.getTime())) return 1
  const utcDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7)
  return weekNo
}

// 计算当前日期是其所在月的第几周
const getWeekOfMonth = (date) => {
  const d = typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : new Date(date)
  if (isNaN(d.getTime())) return 1
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1)
  const dayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay()
  const offset = dayOfWeek - 1
  const day = d.getDate()
  return Math.ceil((day + offset) / 7)
}

const getChineseWeekStr = (num) => {
  const arr = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  return `第${arr[num] || num}周`
}

const displayDateString = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth() + 1
  if (filterMode.value === 'month' || filterMode.value === 'week') {
    return `${y}年`
  } else {
    return `${y}年${m}月`
  }
})

const pickerValue = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  return filterMode.value === 'month' || filterMode.value === 'week' ? `${y}` : `${y}-${m}`
})

const currentMonthKey = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
})

const summaryTitle = computed(() => {
  const t = new Date()
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth() + 1
  if (filterMode.value === 'month' || filterMode.value === 'week') {
    if (t.getFullYear() === y) {
      return '本年'
    }
    return `${y}年`
  } else {
    if (t.getFullYear() === y && t.getMonth() + 1 === m) {
      return '本月'
    }
    return `${y}年${m}月`
  }
})

// ---- 数据读取与格式化 ----
const formatUtcToBeijingDate = (dateStr) => {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const utc8Time = date.getTime() + (8 * 60 * 60 * 1000)
  const utc8Date = new Date(utc8Time)
  const y = utc8Date.getUTCFullYear()
  const m = String(utc8Date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(utc8Date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const loadCategories = async () => {
  try {
    const res = await shopApi.getFamilyShoppingCategories(familyCode)
    categories.value = res.data.categories || []
  } catch (e) {
    console.error('加载分类失败', e)
  }
}

const loadData = async () => {
  try {
    uni.showLoading({ title: '加载统计中...' })
    
    let startTime = ''
    let endTime = ''
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    
    if (filterMode.value === 'month' || filterMode.value === 'week') {
      startTime = `${year}-01-01`
      endTime = `${year}-12-31`
    } else {
      startTime = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const lastDay = new Date(year, month + 1, 0).getDate()
      endTime = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    }
    
    const params = { startTime, endTime }
    const res = await costApi.getFamilyConsumptionRecords(familyCode, params)
    const records = res.data?.items || res.data?.records || res.data || []
    
    rawList.value = records.map(item => {
      const cName = item.categoryName || item.category || categories.value.find(c => c.id === item.categoryId)?.name || '其他'
      return {
        id: item.id || item._id,
        price: item.price,
        name: item.name,
        date: formatUtcToBeijingDate(item.date),
        category: cName,
        categoryId: item.categoryId
      }
    })
  } catch (e) {
    console.error('加载账本数据失败', e)
  } finally {
    uni.hideLoading()
  }
}

// 筛选对应周期的具体账目项（用于计算总花费与分类）
const currentPeriodItems = computed(() => {
  const year = currentDate.value.getFullYear()
  if (filterMode.value === 'month' || filterMode.value === 'week') {
    return rawList.value.filter(item => item.date.startsWith(String(year)))
  } else {
    return rawList.value.filter(item => item.date.startsWith(currentMonthKey.value))
  }
})

// 根据选中的具体柱子再次过滤出的具体账目项
const selectedPeriodItems = computed(() => {
  const baseItems = currentPeriodItems.value
  if (selectedTrendIndex.value === -1) {
    return baseItems
  }
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const idx = selectedTrendIndex.value
  
  if (filterMode.value === 'month') {
    const mStr = `${year}-${String(idx + 1).padStart(2, '0')}`
    return baseItems.filter(item => item.date.startsWith(mStr))
  } else if (filterMode.value === 'week') {
    return baseItems.filter(item => getWeekNumber(item.date) === idx + 1)
  } else {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(idx + 1).padStart(2, '0')}`
    return baseItems.filter(item => item.date === dStr)
  }
})

// 计算总花费
const totalCost = computed(() => {
  let total = 0
  currentPeriodItems.value.forEach(item => {
    total += parseFloat(item.price || 0)
  })
  return total.toFixed(2)
})

// 计算选中周期花费（当选中了某个柱子时）
const periodTotalCost = computed(() => {
  let total = 0
  selectedPeriodItems.value.forEach(item => {
    total += parseFloat(item.price || 0)
  })
  return total.toFixed(2)
})

// 核心占比分析文本
const dominantCategoryText = computed(() => {
  const items = currentPeriodItems.value
  if (items.length === 0) return ''
  let acc = 0
  const map = {}
  items.forEach(item => {
    const p = parseFloat(item.price || 0)
    acc += p
    if (!map[item.category]) map[item.category] = 0
    map[item.category] += p
  })
  if (acc === 0) return ''
  const sorted = Object.keys(map).map(cat => {
    return { cat, ratio: Math.round((map[cat] / acc) * 100) }
  }).filter(c => c.ratio > 0).sort((a, b) => b.ratio - a.ratio)
  
  if (sorted.length === 0) return ''
  if (sorted.length === 1) return `主要花费明细：${sorted[0].cat} ${sorted[0].ratio}%`
  return `主要花费：${sorted[0].cat} ${sorted[0].ratio}%，${sorted[1].cat} ${sorted[1].ratio}%`
})

// ---- 趋势数据计算 (CSS 直方图专用) ----
const trendData = computed(() => {
  const items = rawList.value
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  let result = []
  
  if (filterMode.value === 'month') {
    // 按 1月 - 12月 统计
    const monthsData = Array(12).fill(0)
    items.forEach(item => {
      const parts = item.date.split('-')
      if (parts.length === 3 && parseInt(parts[0], 10) === year) {
        const mIdx = parseInt(parts[1], 10) - 1 // 0-11
        if (mIdx >= 0 && mIdx < 12) {
          monthsData[mIdx] += parseFloat(item.price || 0)
        }
      }
    })
    
    const maxVal = Math.max(...monthsData, 10)
    result = monthsData.map((val, idx) => ({
      val,
      label: `${idx + 1}月`,
      heightPercentage: (val / maxVal) * 85 + 5
    }))
  } else if (filterMode.value === 'week') {
    // 按本年共计的周数（52或53周）进行统计
    const yearEnd = new Date(year, 11, 31)
    const totalWeeks = getWeekNumber(yearEnd)
    const weeksData = Array(totalWeeks).fill(0)
    
    items.forEach(item => {
      const parts = item.date.split('-')
      if (parts.length === 3 && parseInt(parts[0], 10) === year) {
        const wIdx = getWeekNumber(item.date) - 1 // 0-based
        if (wIdx >= 0 && wIdx < totalWeeks) {
          weeksData[wIdx] += parseFloat(item.price || 0)
        }
      }
    })
    
    const maxVal = Math.max(...weeksData, 10)
    result = weeksData.map((val, idx) => ({
      val,
      label: `第${idx + 1}周`,
      heightPercentage: (val / maxVal) * 85 + 5
    }))
  } else {
    // 按本月所有天数统计
    const lastDay = new Date(year, month + 1, 0).getDate()
    const daysData = Array(lastDay).fill(0)
    
    items.forEach(item => {
      const parts = item.date.split('-')
      if (parts.length === 3 && parseInt(parts[0], 10) === year && parseInt(parts[1], 10) === month + 1) {
        const dayNum = parseInt(parts[2], 10)
        if (dayNum >= 1 && dayNum <= lastDay) {
          daysData[dayNum - 1] += parseFloat(item.price || 0)
        }
      }
    })
    
    const maxVal = Math.max(...daysData, 10)
    result = daysData.map((val, idx) => ({
      val,
      label: `${idx + 1}日`,
      heightPercentage: (val / maxVal) * 85 + 5
    }))
  }
  
  return result
})

const trendChartWidth = computed(() => {
  if (filterMode.value === 'day') {
    return '1200rpx' // 30天在横向scroll-view里面排开
  } else if (filterMode.value === 'week') {
    return '2200rpx' // 53周横向展开，可左右滑动浏览全年走势
  }
  return '100%' // 12个月完美填满一屏
})

// ---- 分类数据占比计算 (CSS 横条进度图) ----
const categoryData = computed(() => {
  const items = selectedPeriodItems.value
  const map = {}
  let total = 0
  
  items.forEach(item => {
    const val = parseFloat(item.price || 0)
    total += val
    const cat = item.category || '其他'
    if (!map[cat]) map[cat] = 0
    map[cat] += val
  })
  
  if (total === 0) return []
  
  const sorted = Object.keys(map).map(cat => {
    return {
      name: cat,
      value: map[cat],
      ratio: (map[cat] / total) * 100
    }
  }).sort((a, b) => b.value - a.value)
  
  const colorPalette = [
    '#FF6B8B', '#4DB88F', '#5B89E5', '#F2A13B', 
    '#A87FE6', '#E67F9B', '#4DC7B8', '#9BCE7F', '#ECA0A0'
  ]
  
  return sorted.map((item, idx) => ({
    ...item,
    color: colorPalette[idx % colorPalette.length]
  }))
})

// 选中的细分维度标题
const selectedPeriodLabel = computed(() => {
  if (selectedTrendIndex.value === -1) {
    return summaryTitle.value
  }
  return trendData.value[selectedTrendIndex.value]?.label || ''
})

// ---- 日历/模式切换事件 ----
const switchFilterMode = (mode) => {
  filterMode.value = mode
  selectedTrendIndex.value = -1 // 切换模式时重置选中柱子
  loadData()
}

const handlePickerChange = (e) => {
  const val = e.detail.value
  const parts = val.split('-')
  const nd = new Date(currentDate.value)
  
  if (parts.length === 1) {
    // 年 picker (月模式)
    nd.setFullYear(parseInt(parts[0], 10))
  } else if (parts.length === 2) {
    // 年-月 picker (天模式)
    nd.setFullYear(parseInt(parts[0], 10))
    nd.setMonth(parseInt(parts[1], 10) - 1)
  } else if (parts.length === 3) {
    // 年-月-日 picker (周模式)
    nd.setFullYear(parseInt(parts[0], 10))
    nd.setMonth(parseInt(parts[1], 10) - 1)
    nd.setDate(parseInt(parts[2], 10))
  }
  
  currentDate.value = nd
  selectedTrendIndex.value = -1 // 切换日期时重置选中柱子
  loadData()
}

const selectTrendBar = (idx) => {
  if (selectedTrendIndex.value === idx) {
    selectedTrendIndex.value = -1 // 重复点击已选中的则取消选择
  } else {
    selectedTrendIndex.value = idx
  }
}

onShow(async () => {
  familyCode = uni.getStorageSync('family_code') || 'default_family'
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  selectedTrendIndex.value = -1 // 重新显示时默认重置
  await loadCategories()
  await loadData()
})
</script>

<style lang="less" scoped>
.page {
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 100%);
  background-color: var(--primary-light);
  min-height: ~"calc(100vh - 120rpx)";
  padding: 30rpx 24rpx 60rpx;
}

// 头部月份与日期切换栏
.month-selector-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 30rpx;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 40rpx;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.03);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.month-selector {
  display: flex;
  align-items: center;
  
  .month-text-box {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }
  
  .month-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
  }
  
  .calendar-icon {
    font-size: 30rpx;
  }
}

.mode-capsule {
  display: flex;
  background: #EDEDED;
  padding: 4rpx;
  border-radius: 30rpx;
  
  .mode-btn {
    padding: 8rpx 24rpx;
    font-size: 24rpx;
    color: #666666;
    border-radius: 26rpx;
    transition: all 0.2s;
    
    &.active {
      background: #ffffff;
      color: var(--primary);
      font-weight: bold;
      box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
    }
  }
}

// 本月总额卡片
.header-card {
  background: var(--primary-grad);
  border-radius: 32rpx;
  padding: 40rpx;
  color: #ffffff;
  margin-bottom: 30rpx;
  box-shadow: 0 12rpx 30rpx var(--primary-shadow);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    right: -40rpx;
    bottom: -40rpx;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }

  .title {
    font-size: 24rpx;
    opacity: 0.85;
    margin-bottom: 12rpx;
    font-weight: 500;
  }

  .total-money {
    font-size: 56rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  .ratio-wrap {
    background: rgba(255, 255, 255, 0.2);
    padding: 8rpx 16rpx;
    border-radius: 16rpx;
    align-self: flex-start;
    
    .ratio-text {
      font-size: 20rpx;
      font-weight: bold;
    }
  }
}

// 通用卡片容器
.chart-section {
  background: #ffffff;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.015);
  border: 1rpx solid rgba(0, 0, 0, 0.02);

  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333333;
    display: inline-block;
  }
  
  .sub-title-tip {
    font-size: 20rpx;
    color: #999999;
    font-weight: normal;
    margin-left: 6rpx;
  }

  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;
    width: 100%;
    
    .reset-btn {
      font-size: 22rpx;
      color: var(--primary);
      background: var(--primary-light);
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      font-weight: bold;
      transition: all 0.2s;
      
      &:active {
        opacity: 0.8;
      }
    }
  }
}

// 趋势变化直方图
.trend-scroll {
  width: 100%;
  overflow: hidden;
}

.trend-chart-box {
  height: 240rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.bar-chart-body {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  
  .grid-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1rpx;
    border-top: 1rpx dashed #f2f2f2;
    z-index: 1;
  }
  
  .bars-container {
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    z-index: 2;
    width: 100%;
  }
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  padding: 0 4rpx;
  transition: all 0.2s ease;
  
  .bar-val {
    font-size: 16rpx;
    color: #888888;
    margin-bottom: 6rpx;
    text-align: center;
    font-weight: 500;
  }
  
  .bar-col-wrap {
    height: 140rpx;
    width: 16rpx;
    background: #F9F9F9;
    border-radius: 10rpx;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    border: 1rpx solid transparent;
    transition: all 0.2s ease;
  }
  
  .bar-col {
    width: 100%;
    border-radius: 10rpx;
    transition: height 0.3s ease-out;
  }
  
  .bar-label {
    font-size: 18rpx;
    color: #999999;
    margin-top: 10rpx;
    white-space: nowrap;
    transition: all 0.2s ease;
  }
  
  // 被选中状态下的样式高亮
  &.active {
    transform: translateY(-4rpx);
    
    .bar-col-wrap {
      border-color: var(--primary);
      box-shadow: 0 4rpx 12rpx var(--primary-shadow);
    }
    
    .bar-label {
      color: var(--primary);
      font-weight: bold;
    }
  }
}

.scroll-tip {
  font-size: 18rpx;
  color: #bbbbbb;
  text-align: center;
  margin-top: 16rpx;
}

// 分类进度列表
.category-breakdown {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.cat-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.cat-row-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .cat-lbl {
    display: flex;
    align-items: center;
    gap: 12rpx;
    
    .cat-dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
    }
    
    .cat-name {
      font-size: 24rpx;
      color: #555555;
      font-weight: 500;
    }
  }
  
  .cat-val-group {
    display: flex;
    align-items: center;
    gap: 16rpx;
    
    .cat-val {
      font-size: 24rpx;
      font-weight: bold;
      color: #333333;
    }
    
    .cat-ratio {
      font-size: 20rpx;
      color: #999999;
      min-width: 60rpx;
      text-align: right;
    }
  }
}

.progress-track {
  height: 12rpx;
  background: #F5F5F5;
  border-radius: 6rpx;
  width: 100%;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

// 缺省状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  background: #ffffff;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.015);
  border: 1rpx solid rgba(0, 0, 0, 0.02);
  
  .empty-icon {
    font-size: 64rpx;
    margin-bottom: 20rpx;
    opacity: 0.6;
  }
  
  .empty-txt {
    font-size: 24rpx;
    color: #999999;
  }
}
</style>

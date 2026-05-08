<template>
  <view class="calendar-page" :style="themeStyle">
    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="i">◀</text>
      </view>
      <view class="month-selector">
        <view class="month-nav-btn" @click="changeMonth(-1)">
          <text class="i">◀</text>
        </view>
        <text class="title">{{ currentMonthLabel }}</text>
        <view class="month-nav-btn" @click="changeMonth(1)">
          <text class="i">▶</text>
        </view>
      </view>
      <view class="nav-placeholder"></view>
    </view>

    <view class="calendar-container">
      <!-- 星期头部 -->
      <view class="week-header">
        <text v-for="w in weeks" :key="w" class="week-day">{{ w }}</text>
      </view>

      <!-- 日历网格 -->
      <view class="calendar-grid" v-if="days.length > 0">
        <view 
          v-for="(item, index) in days" 
          :key="index" 
          class="day-cell"
          :class="{ 
            'other-month': !item.isCurrentMonth, 
            'is-today': item.isToday,
            'selected': isSelected(item)
          }"
          @click="selectDate(item)"
        >
          <view class="cell-content">
            <text class="solar-day">{{ item.day }}</text>
            <text class="lunar-day" :class="{ 'is-term': item.isTerm, 'is-holiday': item.isHoliday }">
              {{ item.lunarLabel }}
            </text>
            <view class="dot" v-if="item.isTerm || item.isHoliday"></view>
          </view>
        </view>
      </view>
      <view class="loading-box" v-else>
        <text>正在加载万年历...</text>
      </view>
    </view>

    <view class="calendar-footer">
      <view class="today-btn" @click="resetToToday">回到今天</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import calendar from '@/uni_modules/uni-calendar/components/uni-calendar/calendar.js'

const weeks = ['日', '一', '二', '三', '四', '五', '六']
const days = ref([])
const currentDate = ref(new Date())
const selectedDate = ref(null)
const themeStyle = ref('')

const currentMonthLabel = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth() + 1
  return `${y}年${m}月`
})

const changeMonth = (offset) => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + offset)
  currentDate.value = d
  initCalendar()
}

onMounted(() => {
  console.log('Calendar Page Mounted')
  applyTheme()
  initCalendar()
})

const applyTheme = () => {
  try {
    const themes = [
      { color: '#FF6B8B' }, { color: '#4DB88F' }, { color: '#5B89E5' }, { color: '#F2A13B' }
    ]
    let idx = uni.getStorageSync('current_theme')
    idx = (idx === undefined || idx === null || idx >= themes.length) ? 0 : parseInt(idx)
    themeStyle.value = `--primary: ${themes[idx].color};`
  } catch (e) {
    console.error('Apply Theme Failed:', e)
    themeStyle.value = '--primary: #FF6B8B;'
  }
}

const initCalendar = () => {
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth()
  
  console.log('Initializing Calendar for:', y, m + 1)
  
  const firstDay = new Date(y, m, 1).getDay()
  const lastDate = new Date(y, m + 1, 0).getDate()
  const prevLastDate = new Date(y, m, 0).getDate()

  console.log(`FirstDay: ${firstDay}, LastDate: ${lastDate}, PrevLastDate: ${prevLastDate}`)

  const tempDays = []
  for (let i = firstDay - 1; i >= 0; i--) {
    tempDays.push(generateDay(y, m - 1, prevLastDate - i, false))
  }
  for (let i = 1; i <= lastDate; i++) {
    tempDays.push(generateDay(y, m, i, true))
  }
  const remain = 42 - tempDays.length
  for (let i = 1; i <= remain; i++) {
    tempDays.push(generateDay(y, m + 1, i, false))
  }

  days.value = tempDays
  console.log('Calendar Grid Populated, total days:', days.value.length)
}

const generateDay = (y, m, d, isCurrentMonth) => {
  try {
    const date = new Date(y, m, d)
    const fy = date.getFullYear()
    const fm = date.getMonth() + 1
    const fd = date.getDate()
    
    const res = calendar.solar2lunar(fy, fm, fd)
    if (!res) throw new Error('Solar2Lunar failed')

    const today = new Date()
    const isToday = fy === today.getFullYear() && fm === (today.getMonth() + 1) && fd === today.getDate()

    const solarHolidays = { '1-1': '元旦', '5-1': '劳动节', '10-1': '国庆节' }
    const lunarHolidays = { '正月-初一': '春节', '正月-十五': '元宵节', '五月-初五': '端午节', '八月-十五': '中秋节' }
    
    const sH = solarHolidays[`${fm}-${fd}`]
    const lH = lunarHolidays[`${res.IMonthCn}-${res.IDayCn}`]
    
    return {
      year: fy,
      month: fm,
      day: fd,
      isCurrentMonth,
      isToday,
      lunarLabel: sH || lH || res.Term || res.IDayCn,
      isTerm: !!res.Term,
      isHoliday: !!(sH || lH)
    }
  } catch (e) {
    console.error('Generate Day Error:', e)
    return {
      year: y, month: m, day: d, isCurrentMonth, isToday: false, lunarLabel: d, isTerm: false, isHoliday: false
    }
  }
}

const isSelected = (item) => {
  if (!selectedDate.value) return false
  return item.year === selectedDate.value.year && item.month === selectedDate.value.month && item.day === selectedDate.value.day
}

const selectDate = (item) => {
  selectedDate.value = item
  // 触发全局事件并返回
  uni.$emit('calendar-select-date', {
    year: item.year,
    month: item.month,
    day: item.day
  })
  uni.navigateBack()
}

const resetToToday = () => {
  currentDate.value = new Date()
  initCalendar()
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="less" scoped>
.calendar-page {
  min-height: 100vh;
  background: #FFF5F7;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  padding: 100rpx 40rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .back-btn {
    width: 80rpx; height: 80rpx; border-radius: 50%;
    background: rgba(255,255,255,0.8);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    .i { font-size: 28rpx; color: #2C3E50; }
  }
  
  .month-selector {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30rpx;
    
    .month-nav-btn {
      width: 60rpx; height: 60rpx; border-radius: 50%;
      background: rgba(255,255,255,0.5);
      display: flex; align-items: center; justify-content: center;
      .i { font-size: 32rpx; color: #95A5A6; }
      &:active { opacity: 0.7; transform: scale(0.9); }
    }
    
    .title { font-size: 36rpx; font-weight: 900; color: #2C3E50; min-width: 200rpx; text-align: center; }
  }

  .nav-placeholder { width: 80rpx; }
}

.calendar-container {
  margin: 0 30rpx;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 48rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.02);
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 20rpx;
  .week-day {
    text-align: center;
    font-size: 24rpx;
    color: #95A5A6;
    font-weight: 800;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10rpx;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 24rpx;
  transition: all 0.2s;

  .cell-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
  }

  .solar-day { font-size: 30rpx; font-weight: 900; color: #2C3E50; }
  .lunar-day { 
    font-size: 18rpx; color: #BDC3C7; font-weight: 600; 
    &.is-term { color: #4DB88F; }
    &.is-holiday { color: #FF6B8B; }
  }
  
  .dot {
    position: absolute; bottom: 10rpx; width: 6rpx; height: 6rpx;
    border-radius: 50%; background: var(--primary);
  }

  &.other-month { opacity: 0.3; }
  &.is-today {
    background: #fff;
    border: 2rpx solid var(--primary);
    .solar-day { color: var(--primary); }
  }
  &.selected {
    background: var(--primary);
    .solar-day, .lunar-day { color: #fff !important; }
  }
  
  &:active { transform: scale(0.9); background: rgba(255,255,255,0.8); }
}

.calendar-footer {
  margin-top: 60rpx;
  display: flex;
  justify-content: center;
  .today-btn {
    padding: 20rpx 60rpx;
    background: #fff;
    border-radius: 100rpx;
    font-size: 26rpx;
    font-weight: 900;
    color: var(--primary);
    box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.05);
  }
}

.loading-box {
  padding: 100rpx 0;
  display: flex;
  justify-content: center;
  text { font-size: 24rpx; color: #95A5A6; }
}
</style>

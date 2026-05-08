<template>
  <view class="month-popup-mask" v-if="visible" @tap="close" @touchmove.stop.prevent>
    <view class="month-popup-content" @tap.stop :class="{ 'show': showAnimate }" :style="themeStyle">
      <view class="popup-handle"></view>
      
      <view class="popup-header">
        <view class="month-selector">
          <view class="nav-btn" @click="changeMonth(-1)">◀</view>
          <text class="current-month">{{ currentMonthLabel }}</text>
          <view class="nav-btn" @click="changeMonth(1)">▶</view>
        </view>
        <view class="today-btn" @click="resetToToday">今</view>
      </view>

      <view class="calendar-body">
        <view class="week-header">
          <text v-for="w in weeks" :key="w" class="week-day">{{ w }}</text>
        </view>
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
            </view>
          </view>
        </view>
      </view>
      
      <view class="popup-footer-safe"></view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import calendar from '@/uni_modules/uni-calendar/components/uni-calendar/calendar.js'

const props = defineProps({
  show: Boolean,
  initialDate: { type: Date, default: () => new Date() }
})

const emit = defineEmits(['close', 'select'])

const visible = ref(false)
const showAnimate = ref(false)
const currentDate = ref(new Date())
const days = ref([])
const themeStyle = ref('')

const weeks = ['日', '一', '二', '三', '四', '五', '六']

const currentMonthLabel = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth() + 1
  return `${y}年${m}月`
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    visible.value = true
    currentDate.value = new Date(props.initialDate)
    applyTheme()
    initCalendar()
    setTimeout(() => { showAnimate.value = true }, 50)
  } else {
    showAnimate.value = false
    setTimeout(() => { visible.value = false }, 300)
  }
})

const applyTheme = () => {
  const themes = [{ color: '#FF6B8B' }, { color: '#4DB88F' }, { color: '#5B89E5' }, { color: '#F2A13B' }]
  const idx = uni.getStorageSync('current_theme') || 0
  themeStyle.value = `--primary: ${themes[idx].color};`
}

const changeMonth = (offset) => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + offset)
  currentDate.value = d
  initCalendar()
}

const initCalendar = () => {
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth()
  const firstDay = new Date(y, m, 1).getDay()
  const lastDate = new Date(y, m + 1, 0).getDate()
  const prevLastDate = new Date(y, m, 0).getDate()
  const tempDays = []
  for (let i = firstDay - 1; i >= 0; i--) tempDays.push(generateDay(y, m - 1, prevLastDate - i, false))
  for (let i = 1; i <= lastDate; i++) tempDays.push(generateDay(y, m, i, true))
  const remain = 42 - tempDays.length
  for (let i = 1; i <= remain; i++) tempDays.push(generateDay(y, m + 1, i, false))
  days.value = tempDays
}

const generateDay = (y, m, d, isCurrentMonth) => {
  const date = new Date(y, m, d)
  const fy = date.getFullYear(); const fm = date.getMonth() + 1; const fd = date.getDate()
  const res = calendar.solar2lunar(fy, fm, fd)
  const today = new Date()
  const isToday = fy === today.getFullYear() && fm === (today.getMonth() + 1) && fd === today.getDate()
  const sH = { '1-1': '元旦', '5-1': '劳动节', '10-1': '国庆节' }[`${fm}-${fd}`]
  const lH = { '正月-初一': '春节', '正月-十五': '元宵节', '五月-初五': '端午节', '八月-十五': '中秋节' }[`${res.IMonthCn}-${res.IDayCn}`]
  return {
    year: fy, month: fm, day: fd, isCurrentMonth, isToday,
    lunarLabel: sH || lH || res.Term || res.IDayCn,
    isTerm: !!res.Term, isHoliday: !!(sH || lH)
  }
}

const isSelected = (item) => {
  const d = props.initialDate
  return item.year === d.getFullYear() && item.month === (d.getMonth() + 1) && item.day === d.getDate()
}

const selectDate = (item) => {
  emit('select', { year: item.year, month: item.month, day: item.day })
  close()
}

const resetToToday = () => {
  currentDate.value = new Date()
  initCalendar()
}

const close = () => {
  showAnimate.value = false
  setTimeout(() => {
    visible.value = false
    emit('close')
  }, 300)
}
</script>

<style lang="less" scoped>
.month-popup-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3); z-index: 2000;
  display: flex; flex-direction: column; justify-content: flex-end;
  backdrop-filter: blur(4px);
}

.month-popup-content {
  width: 100%; background: #fff; border-radius: 48rpx 48rpx 0 0;
  transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.2, 1, 0.3, 1);
  padding: 20rpx 40rpx; box-sizing: border-box;
  &.show { transform: translateY(0); }
}

.popup-handle {
  width: 80rpx; height: 8rpx; background: #eee; border-radius: 100rpx;
  margin: 0 auto 30rpx;
}

.popup-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx;
  .month-selector {
    display: flex; align-items: center; gap: 40rpx;
    .nav-btn { font-size: 36rpx; color: #95A5A6; padding: 10rpx; }
    .current-month { font-size: 32rpx; font-weight: 900; color: #2C3E50; }
  }
  .today-btn {
    font-size: 24rpx; font-weight: 900; color: var(--primary);
    padding: 10rpx 30rpx; border-radius: 100rpx; background: #f8f8f8;
  }
}

.calendar-body {
  .week-header {
    display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 20rpx;
    .week-day { text-align: center; font-size: 22rpx; color: #BDC3C7; font-weight: 800; }
  }
  .calendar-grid {
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 10rpx;
  }
}

.day-cell {
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  border-radius: 20rpx; transition: all 0.2s;
  .cell-content { display: flex; flex-direction: column; align-items: center; }
  .solar-day { font-size: 28rpx; font-weight: 900; color: #2C3E50; }
  .lunar-day { font-size: 16rpx; color: #BDC3C7; font-weight: 600; 
    &.is-term { color: #4DB88F; } &.is-holiday { color: #FF6B8B; }
  }
  &.other-month { opacity: 0.2; }
  &.is-today { border: 2rpx solid var(--primary); .solar-day { color: var(--primary); } }
  &.selected { background: var(--primary); .solar-day, .lunar-day { color: #fff !important; } }
  &:active { transform: scale(0.9); background: #f0f0f0; }
}

.popup-footer-safe { height: env(safe-area-inset-bottom); padding-bottom: 40rpx; }
</style>

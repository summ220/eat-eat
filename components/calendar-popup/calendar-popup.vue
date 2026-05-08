<template>
  <view class="calendar-popup-mask" v-if="visible" @tap="handleClosePopup" @touchmove.stop.prevent>
    <view class="calendar-popup-content" @tap.stop :class="{ 'show-up': showAnimate }" :style="themeStyle">
      <!-- 顶部拉手 -->
      <view class="popup-handle-bar">
        <view class="handle" @tap="handleClosePopup"></view>
      </view>
      
      <scroll-view scroll-y class="popup-scroll-area" :show-scrollbar="false">
        <view class="popup-body">
        <!-- 1. 顶部日期信息 -->
        <view class="date-header-card">
                    <!-- 日期切换操作 -->
          <view class="date-nav-ops">
            <view class="nav-btn left" @click="changeDate(-1)">
              <text class="i">◀</text>
            </view>
            <view class="back-today" v-if="!isToday" @click="resetToToday">今</view>
            <view class="nav-btn right" @click="changeDate(1)">
              <text class="i">▶</text>
            </view>
          </view>

          <view class="solar-row" @click="goToCalendar">
            <text class="day-num">{{ solarDate.day }}</text>
            <view class="date-right">
              <text class="month-year">{{ solarDate.year }}年{{ solarDate.month }}月</text>
              <view class="week-row">
                <text class="week-name">{{ solarDate.week }}</text>
                <text class="holiday-tag" v-if="holidayName">{{ holidayName }}</text>
              </view>
            </view>
          </view>
          
          <!-- 新增：右上角抽签入口 -->
          <view class="draw-lottery-trigger" @click.stop="drawLottery">
            <text class="draw-icon">🎋</text>
            <text class="draw-text">摇一签</text>
          </view>
          
          <view class="lunar-info-box">
            <view class="lunar-text-row">
              <text class="l-main-text">农历{{ lunarData.IMonthCn }}{{ lunarData.IDayCn }}</text>
              <view class="l-divider"></view>
              <text class="l-sub-text">{{ lunarData.gzYear }}年 {{ lunarData.Animal }} · {{ lunarData.gzMonth }}月 {{ lunarData.gzDay }}日</text>
            </view>
            
            <view class="extra-info-row">
              <text class="info-item">✨ {{ solarDate.zodiac }}</text>
              <view class="info-sep"></view>
              <text class="info-item">🌅 {{ astronomy.sunrise }} 日出</text>
              <view class="info-sep"></view>
              <text class="info-item">🌇 {{ astronomy.sunset }} 日落</text>
            </view>

            <view class="term-capsule">
              <text class="t-icon">🍃</text>
              <view class="t-content">
                <view class="t-top">
                  <text class="t-val">{{ termInfo.desc }}</text>
                  <text class="t-advice">{{ termInfo.advice }}</text>
                </view>
                <text class="t-intro" v-if="termInfo.intro">{{ termInfo.intro }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="luck-section">
          <view class="luck-main">
            <view class="section-title">
                <text class="title-text">今日干饭运势</text>
                <view class="luck-stars">
                  <text class="star" v-for="s in 5" :key="s" :class="{ active: s <= luckLevel }">★</text>
              </view>
            </view>
            <view class="luck-content">
              <text class="luck-desc">{{ luckDesc }}</text>
            </view>
          </view>
          <view class="luck-tags">
            <view class="mini-tag color">
              <text class="mt-label">幸运色</text>
              <text class="mt-val">{{ luckData.color }}</text>
            </view>
            <view class="mini-tag number">
              <text class="mt-label">幸运数字</text>
              <text class="mt-val">{{ luckData.number }}</text>
            </view>
          </view>
        </view>

        <view class="almanac-card">
          <view class="a-row yi">
            <view class="a-header"><view class="a-label">宜</view></view>
            <view class="a-tags">
              <view class="a-tag" v-for="(t, i) in alamanac.yi" :key="i">
                <text class="tag-icon">{{ getAlmanacIcon(t) }}</text>
                <text class="tag-text" :class="{ 'highlight': t === '烹饪' }">{{ t }}</text>
              </view>
            </view>
          </view>
          <view class="a-row ji">
            <view class="a-header"><view class="a-label">忌</view></view>
            <view class="a-tags">
              <view class="a-tag" v-for="(t, i) in alamanac.ji" :key="i">
                <text class="tag-icon">{{ getAlmanacIcon(t) }}</text>
                <text class="tag-text">{{ t }}</text>
              </view>
            </view>
          </view>
          <view class="a-footer">
            <text class="a-tip">“宜烹饪”的日子，做出来的菜更好吃哦~</text>
            <text class="a-source-hint" :class="{ 'is-api': !isLocalAlmanac }">
              {{ isLocalAlmanac ? '（数据由本地历法计算生成）' : '（数据由和风天气权威提供）' }}
            </text>
          </view>
        </view>

        <!-- <view class="almanac-card food-luck-card">
          <view class="a-row yi">
            <view class="a-header"><text class="a-label food">宜吃</text></view>
            <view class="a-tags">
              <view class="a-tag food" v-for="f in foodLuck.yi" :key="f">
                <text class="tag-text">{{ f }}</text>
              </view>
            </view>
          </view>
          <view class="a-row ji">
            <view class="a-header"><text class="a-label food">少吃</text></view>
            <view class="a-tags">
              <view class="a-tag food-ji" v-for="f in foodLuck.ji" :key="f">
                <text class="tag-text">{{ f }}</text>
              </view>
            </view>
          </view>
        </view> -->

        <view class="food-tip-card">
          <view class="card-title">
            <text class="t-icon">🍱</text>
            <text class="t-text">饮食方案</text>
          </view>
          <view class="tip-content">
            <text class="tip-text">{{ foodAdvice.text }}</text>
            <text class="tip-quote">—— {{ foodAdvice.quote }}</text>
          </view>
        </view>

        <!-- <view class="action-bar-grid">
          <button class="action-btn recipe" @click="goToRecipes">查看推荐做法</button>
          <button class="action-btn cart" @click="addToShoppingList">加入购物清单</button>
        </view> -->
        
        <view class="footer-safe"></view>
        </view>
      </scroll-view>

      <!-- 月份选择弹窗 -->
      <month-calendar-popup 
        :show="monthCalendarVisible" 
        :initial-date="currentDate"
        @close="monthCalendarVisible = false"
        @select="handleMonthSelect"
      />

      <!-- 抽签动画遮罩层 -->
      <view class="lottery-overlay" v-if="lotteryVisible" @touchmove.stop.prevent>
        <view class="lottery-container" v-if="!fortuneResult">
          <view class="lottery-box" :class="{ 'shake': isShaking }">
            <view class="lottery-tube">
              <view class="stick" v-for="i in 6" :key="i"></view>
            </view>
          </view>
          <text class="lottery-hint">{{ isShaking ? '诚心祈求今日美食...' : '点击下方按钮开始摇签' }}</text>
          <button class="shake-trigger" v-if="!isShaking" @click="startShake">诚心摇签</button>
          <view class="lottery-close" v-if="!isShaking" @click="lotteryVisible = false">✕</view>
        </view>

        <!-- 签文结果卷轴 -->
        <view class="fortune-scroll-wrap" v-else>
          <view class="fortune-scroll" :class="{ 'fade-in': fortuneResult }">
            <view class="f-header">
              <text class="f-no">第 {{ fortuneResult.no }} 签</text>
              <text class="f-level" :class="fortuneResult.levelClass">{{ fortuneResult.level }}</text>
            </view>
            <view class="f-body">
              <text class="f-title">{{ fortuneResult.title }}</text>
              <view class="f-v-divider"></view>
              <text class="f-text">{{ fortuneResult.content }}</text>
            </view>
            <view class="f-footer">
              <text class="f-inte-label">【解曰】</text>
              <text class="f-inte-text">{{ fortuneResult.interpretation }}</text>
            </view>
          </view>
          
          <view class="f-actions">
            <view class="f-act-btn secondary" @click="resetLottery">再摇一次</view>
            <view class="f-act-btn primary" @click="goToRecipes">去菜谱看看</view>
            <view class="f-close" @click="lotteryVisible = false">✕</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import calendar from '@/uni_modules/uni-calendar/components/uni-calendar/calendar.js'
import request from '@/common/request.js'
import MonthCalendarPopup from './month-calendar-popup.vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const visible = ref(false)
const showAnimate = ref(false)
const themeStyle = ref('')

const solarDate = ref({
  year: '',
  month: '',
  day: '',
  week: '',
  zodiac: ''
})

const lunarData = ref({
  IMonthCn: '正月',
  IDayCn: '初一',
  gzYear: '甲辰',
  gzMonth: '丙寅',
  gzDay: '戊子',
  Animal: '龙',
  Term: ''
})
const alamanac = ref({
  yi: ['烹饪', '纳采', '祭祀', '开光', '安床'],
  ji: ['动土', '开市', '作灶', '修坟', '安葬']
})

const foodAdvice = ref({
  text: '今日宜烹饪，适合炖煮一锅香气四溢的红烧肉，暖胃又暖心。',
  quote: '人间烟火味，最抚凡人心。'
})

const luckLevel = ref(5)
const luckDesc = ref('')
const termInfo = ref({
  desc: '',
  advice: '',
  intro: ''
})
const luckData = ref({ color: '薄荷绿', number: '8' })
const astronomy = ref({ sunrise: '05:20', sunset: '18:50' })
const foodLuck = ref({ yi: ['火锅', '时令水果'], ji: ['冰镇饮品'] })
const loadingAPI = ref(false)
const isLocalAlmanac = ref(true)
const currentDate = ref(new Date())

const lotteryVisible = ref(false)
const isShaking = ref(false)
const fortuneResult = ref(null)
const holidayName = ref('')
const monthCalendarVisible = ref(false)

const isToday = computed(() => {
  const today = new Date()
  const d = currentDate.value
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()
})

// 关闭弹窗
const handleClosePopup = () => {
  showAnimate.value = false
  setTimeout(() => {
    visible.value = false
    emit('close')
  }, 300)
}

const getZodiacSign = (m, d) => {
  const signs = ['摩羯', '水瓶', '双鱼', '白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手']
  const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22]
  return signs[d < dates[m - 1] ? (m - 1 + 11) % 12 : m - 1] + '座'
}

const getAlmanacIcon = (tag) => {
  const map = {
    '烹饪': '👨‍🍳', '纳采': '💍', '祭祀': '🙏', '开光': '✨', '安床': '🛏️',
    '出行': '🚗', '祈福': '🧧', '扫舍': '🧹', '安葬': '⚰️', '开市': '💰',
    '动土': '🏗️', '作灶': '🔥', '修坟': '⛰️', '移徙': '📦', '伐木': '🌳', '破土': '⛏️', '求医': '🏥', '祭祀': '🕯️'
  }
  return map[tag] || '•'
}

const goToRecipes = () => {
  uni.switchTab({ url: '/pages/recipe/recipe' })
  handleClosePopup()
}

const addToShoppingList = () => {
  uni.showToast({ title: '已加入购物清单', icon: 'success' })
}

const changeDate = (offset) => {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + offset)
  currentDate.value = d
  initDate(d)
}

const resetToToday = () => {
  const d = new Date()
  currentDate.value = d
  initDate(d)
}

const themes = [
  { color: '#FF6B8B', light: '#FFE8EE', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', shadow: 'rgba(255,90,121,0.3)' },
  { color: '#4DB88F', light: '#E6F7F0', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', shadow: 'rgba(77,184,143,0.3)' },
  { color: '#5B89E5', light: '#E8F0FE', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', shadow: 'rgba(91,137,229,0.3)' },
  { color: '#F2A13B', light: '#FEF4E8', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', shadow: 'rgba(242,161,59,0.3)' }
]

const applyTheme = () => {
  const currentThemeIdx = uni.getStorageSync('current_theme') || 0
  const t = themes[currentThemeIdx]
  themeStyle.value = `--primary: ${t.color}; --primary-light: ${t.light}; --primary-grad: ${t.gradient}; --primary-shadow: ${t.shadow};`
}

onMounted(() => {
  uni.$on('calendar-select-date', (data) => {
    const d = new Date(data.year, data.month - 1, data.day)
    currentDate.value = d
    initDate(d)
  })
})

onUnmounted(() => {
  uni.$off('calendar-select-date')
  lotteryVisible.value = false
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    visible.value = true
    applyTheme()
    currentDate.value = new Date()
    initDate(currentDate.value)
    setTimeout(() => {
      showAnimate.value = true
    }, 60)
  } else {
    showAnimate.value = false
    lotteryVisible.value = false
    setTimeout(() => {
      visible.value = false
    }, 300)
  }
})

const initDate = (dateObj) => {
  const now = dateObj || new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const d = now.getDate()
  const w = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
  
  solarDate.value = {
    year: y,
    month: m,
    day: d,
    week: w,
    zodiac: getZodiacSign(m, d)
  }
  
  const res = calendar.solar2lunar(y, m, d)
  lunarData.value = res
  
  initLuck(now)
  initTermInfo(y, m, d, res.Term)
  initExtraInfo(y, m, d)
  initLocalAlmanac(y, m, d)
  initHoliday(y, m, d, res.IMonthCn, res.IDayCn)
  isLocalAlmanac.value = true
  updateFoodAdvice(res.Term, d)

  fetchLunarAPI(`${y}-${m}-${d}`)
}

const goToCalendar = () => {
  monthCalendarVisible.value = true
}

const handleMonthSelect = (data) => {
  const d = new Date(data.year, data.month - 1, data.day)
  currentDate.value = d
  initDate(d)
  monthCalendarVisible.value = false
}

const initHoliday = (y, m, d, lm, ld) => {
  const solarHolidays = { '1-1': '元旦', '5-1': '劳动节', '10-1': '国庆节', '12-25': '圣诞节' }
  const lunarHolidays = { '正月-初一': '春节', '正月-十五': '元宵节', '五月-初五': '端午节', '七月-初七': '七夕节', '八月-十五': '中秋节', '九月-初九': '重阳节', '腊月-三十': '除夕' }
  holidayName.value = solarHolidays[`${m}-${d}`] || lunarHolidays[`${lm}-${ld}`] || ''
}

const drawLottery = () => {
  lotteryVisible.value = true
  fortuneResult.value = null
  isShaking.value = false
}

const startShake = () => {
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
    const levels = [
      { name: '上上签', class: 'level-ss', weight: 10 },
      { name: '上吉签', class: 'level-sj', weight: 30 },
      { name: '中平签', class: 'level-zp', weight: 40 },
      { name: '提醒签', class: 'level-tx', weight: 20 }
    ]
    if (alamanac.value.yi.includes('烹饪')) {
      levels[0].weight += 15
      levels[1].weight += 15
    }
    const totalWeight = levels.reduce((s, l) => s + l.weight, 0)
    let rand = Math.random() * totalWeight
    let levelObj = levels[0]
    for (const l of levels) {
      if (rand < l.weight) { levelObj = l; break }
      rand -= l.weight
    }
    const fortunePool = {
      '上上签': [
        { title: '厨神入世', content: '今日下厨，火候自成，盐量精算，每一口都是巅峰。', interpretation: '宜大张旗鼓，宴请四方，必得满堂彩。' },
        { title: '饕餮附体', content: '胃口大开，千杯不醉，今日所食皆为珍馐。', interpretation: '身体倍儿棒，吃嘛嘛香，适合尝试硬菜。' }
      ],
      '上吉签': [
        { title: '五味调和', content: '生活有滋有味，今日即便简单小食，亦有惊喜发现。', interpretation: '平常心待三餐，必有回甘。' },
        { title: '邻里飘香', content: '厨房烟火气升腾，幸福感随香气弥漫全屋。', interpretation: '宜与家人共享，气氛极佳。' }
      ],
      '中平签': [
        { title: '食之淡泊', content: '三餐准时，营养均衡，平凡之中见真章。', interpretation: '宜清淡饮食，给胃放个小假。' },
        { title: '火候尚可', content: '厨艺发挥稳定，虽无惊艳，但胜在温馨踏实。', interpretation: '按部就班，不疾不徐。' }
      ],
      '提醒签': [
        { title: '过犹不及', content: '贪多嚼不烂，今日饮食宜节制，莫要暴饮暴食。', interpretation: '注意肠胃负担，少油少盐为妙。' },
        { title: '外卖克星', content: '今日外卖运势一般，不如亲自下厨，更显诚意。', interpretation: '谨防重口味，多喝白开水。' }
      ]
    }
    const pool = fortunePool[levelObj.name]
    const item = pool[Math.floor(Math.random() * pool.length)]
    fortuneResult.value = {
      no: Math.floor(Math.random() * 99) + 1,
      level: levelObj.name,
      levelClass: levelObj.class,
      title: item.title,
      content: item.content,
      interpretation: item.interpretation
    }
  }, 1200)
}

const resetLottery = () => {
  fortuneResult.value = null
  startShake()
}

const fetchLunarAPI = async (dateStr) => {
  if (loadingAPI.value) return
  loadingAPI.value = true
  try {
    const res = await request('/lunar/day', 'GET', {
      location: '101010100',
      date: dateStr.replace(/-/g, '')
    })

    if (res && res.lunar) {
      isLocalAlmanac.value = false
      const l = res.lunar
      lunarData.value = {
        ...lunarData.value,
        IMonthCn: l.lunarMonthCn,
        IDayCn: l.lunarDayCn,
        gzYear: l.ganzhiYear,
        gzMonth: l.ganzhiMonth,
        gzDay: l.ganzhiDay,
        Animal: l.animal,
        Term: l.solarTerm
      }
      
      if (l.yi) {
        let yiArr = l.yi.split('.').slice(0, 5)
        if (!yiArr.includes('烹饪')) yiArr[0] = '烹饪'
        alamanac.value.yi = yiArr
      }
      if (l.ji) {
        alamanac.value.ji = l.ji.split('.').slice(0, 3)
      }
    }
  } catch (e) {
    console.error('API Fetch Failed:', e)
    isLocalAlmanac.value = true
  } finally {
    loadingAPI.value = false
  }
}

const initLocalAlmanac = (y, m, d) => {
  const dateStr = `${y}-${m}-${d}`
  const getHashSeed = (str) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0 }
    return Math.abs(hash)
  }
  const seed = getHashSeed(dateStr)
  const yiPool = ['烹饪', '纳采', '安床', '出行', '祭祀', '祈福', '扫舍', '求医', '竖柱', '上梁', '裁衣', '会亲友', '入学']
  const jiPool = ['动土', '开市', '移徙', '伐木', '作灶', '修坟', '安葬', '破土', '盖屋', '纳畜', '栽种', '乘船']
  
  const pickFromPool = (pool, count, startSeed) => {
    const result = []
    const tempPool = [...pool]
    let s = startSeed
    for (let i = 0; i < count; i++) {
      s = (s * 9301 + 49297) % 233280
      const idx = Math.floor((s / 233280) * tempPool.length)
      result.push(tempPool.splice(idx, 1)[0])
    }
    return result
  }
  
  const yiCount = (seed % 2) + 3 
  const jiCount = (seed % 2) + 2 
  alamanac.value.yi = pickFromPool(yiPool, yiCount, seed)
  alamanac.value.ji = pickFromPool(jiPool, jiCount, seed + 100)
  
  if (!alamanac.value.yi.includes('烹饪')) {
    alamanac.value.yi[0] = '烹饪'
  }
}

const initExtraInfo = (y, m, d) => {
  const seed = y + m + d
  const colors = ['樱花粉', '薄荷绿', '天空蓝', '琥珀橙', '奶油白', '葡萄紫', '柠檬黄']
  luckData.value = {
    color: colors[seed % colors.length],
    number: (seed % 9) + 1
  }
  
  const sunOffsets = [60, 45, 30, 15, 0, -15, -30, -15, 0, 15, 30, 45]
  const baseRise = 360
  const baseSet = 1080
  const offset = sunOffsets[m-1]
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60)
    const min = minutes % 60
    return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
  }
  astronomy.value = {
    sunrise: formatTime(baseRise + offset),
    sunset: formatTime(baseSet - offset)
  }
  
  const yiPool = ['火锅', '清蒸鱼', '凉拌菜', '老火靓汤', '时令蔬果', '手工点心', '五谷杂粮', '酸汤肥牛']
  const jiPool = ['冰镇饮品', '辛辣刺激', '过量甜食', '生冷海鲜', '油炸食品', '隔夜剩菜']
  foodLuck.value = {
    yi: [yiPool[seed % yiPool.length], yiPool[(seed + 2) % yiPool.length]],
    ji: [jiPool[seed % jiPool.length]]
  }
}

const initLuck = (dateObj) => {
  const val = dateObj.getFullYear() + dateObj.getMonth() + dateObj.getDate()
  luckLevel.value = (val % 3) + 3
  const descs = [
    '今天适合大吃一顿，胃口大开！',
    '适合尝试新菜谱，会有惊喜发现。',
    '干饭魂燃烧！今天吃什么都很香。',
    '适合邀家人共进晚餐，氛围极佳。'
  ]
  luckDesc.value = descs[val % descs.length]
}

const initTermInfo = (y, m, d, currentTerm) => {
  if (currentTerm) {
    termInfo.value.desc = `今日「${currentTerm}」`
    const info = getTermDetails(currentTerm)
    termInfo.value.advice = info.advice
    termInfo.value.intro = info.intro
  } else {
    const next = getNextTerm(y, m, d)
    termInfo.value.desc = `距离「${next.name}」还有 ${next.days} 天`
    termInfo.value.advice = `即将进入${next.name}，建议多补充水分。`
    termInfo.value.intro = ''
  }
}

const getTermDetails = (term) => {
  const detailsMap = {
    '立春': { advice: '宜食韭菜、荠菜。', intro: '春季之始，万物复苏，注意养肝。' },
    '雨水': { advice: '宜多吃山药、薏米。', intro: '降水增多，注意调理脾胃。' },
    '惊蛰': { advice: '宜食梨润肺。', intro: '春雷始鸣，惊醒蛰伏动物。' },
    '春分': { advice: '宜吃春菜、马兰头。', intro: '昼夜等长，注意平衡阴阳。' },
    '清明': { advice: '宜吃青团、螺蛳。', intro: '万物洁齐，正是春耕好时节。' },
    '谷雨': { advice: '宜喝谷雨茶。', intro: '雨生百谷，降水明显增多。' },
    '立夏': { advice: '宜食红豆、苦瓜。', intro: '夏季之始，注意养心护阳。' },
    '小满': { advice: '宜吃"苦"，清热祛湿。', intro: '麦类饱满但未熟，注意防湿。' },
    '芒种': { advice: '宜食梅子、桑椹。', intro: '气温显著升高，注意防暑。' },
    '夏至': { advice: '宜吃清凉凉面。', intro: '白昼最长，注意防晒解暑。' },
    '小暑': { advice: '宜食藕片、绿豆。', intro: '暑气渐升，注意静心养生。' },
    '大暑': { advice: '宜喝绿豆汤、仙草。', intro: '一年最热时，注意补水排毒。' },
    '立秋': { advice: '宜吃西瓜，补肺润燥。', intro: '秋季之始，暑气未消，注意贴秋膘。' },
    '处暑': { advice: '宜食鸭肉、百合。', intro: '暑气将尽，气温逐渐下降。' },
    '白露': { advice: '宜食红薯、芝麻。', intro: '天凉露凝，注意防秋燥。' },
    '秋分': { advice: '宜食螃蟹、秋菜。', intro: '秋色平分，注意保暖防寒。' },
    '寒露': { advice: '宜喝菊花茶。', intro: '露气寒冷，注意足部保暖。' },
    '霜降': { advice: '宜食柿子、牛肉。', intro: '气温骤降，注意防寒补冬。' },
    '立冬': { advice: '宜食羊肉、萝卜。', intro: '冬季之始，注意避寒就温。' },
    '小雪': { advice: '宜多吃黑色食物。', intro: '气温下降，注意闭藏养生。' },
    '大雪': { advice: '宜食羊肉山药粥。', intro: '降大雪概率增多，注意补肾。' },
    '冬至': { advice: '宜吃饺子或汤圆。', intro: '白昼最短，注意早睡晚起。' }
  }
  return detailsMap[term] || { advice: '顺应天时，清淡饮食。', intro: '保持心情愉快，规律作息。' }
}

const getNextTerm = (y, m, d) => {
  const termNames = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至']
  
  for (let i = 0; i < 3; i++) {
    let checkM = m + i
    let checkY = y
    if (checkM > 12) { checkM -= 12; checkY++ }
    
    const t1Day = calendar.getTerm(checkY, checkM * 2 - 1)
    const t2Day = calendar.getTerm(checkY, checkM * 2)
    
    if (checkM === m) {
      if (t1Day > d) return { name: termNames[m * 2 - 2], days: t1Day - d }
      if (t2Day > d) return { name: termNames[m * 2 - 1], days: t2Day - d }
    } else {
      return { name: termNames[checkM * 2 - 2], days: t1Day + (calendar.solarDays(y, m) - d) }
    }
  }
  return { name: '立春', days: 10 }
}

const updateFoodAdvice = (term, day) => {
  const advises = [
    { text: '今日宜烹饪，推荐制作一道家常红烧肉，口感软糯。', quote: '生活需要烟火气，厨房有爱。' },
    { text: '今日适宜清淡饮食，推荐拍黄瓜或清蒸鱼，清爽开胃。', quote: '简单的一日三餐，最是不平凡。' },
    { text: '气候宜人，宜煲一锅暖汤，推荐排骨莲藕汤。', quote: '胃暖了，心也就踏实了。' },
    { text: '今日宜进补，推荐尝试红烧羊肉，温补御寒。', quote: '每一个努力生活的人，都值得被美食温柔对待。' }
  ]
  const idx = day % advises.length; let finalAdvice = { ...advises[idx] }
  if (holidayName.value) {
    const holidayFood = { '春节': '饺子', '元宵节': '汤圆', '端午节': '粽子', '中秋节': '月饼', '腊月-三十': '年夜饭' }
    const food = holidayFood[holidayName.value] || '特色菜'
    finalAdvice.text = `今日逢「${holidayName.value}」，宜全家共享${food}，其乐融融。`
  } else if (term) {
    const termFood = { '立春': '春饼', '夏至': '凉面', '立秋': '西瓜', '冬至': '饺子', '大暑': '绿豆汤' }
    const food = termFood[term]
    if (food) finalAdvice.text = `今日正值「${term}」，俗话说“${term}吃${food}”，今天安排上吧！`
    else finalAdvice.text = `今日正值「${term}」，${finalAdvice.text}`
  }
  foodAdvice.value = finalAdvice
}
</script>

<style lang="less" scoped>
.calendar-popup-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.calendar-popup-content {
  width: 100%;
  height: 85vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  border-radius: 64rpx 64rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.2, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1001;
  
  &.show-up {
    transform: translateY(0);
  }
}

.popup-scroll-area {
  flex: 1;
  height: 100%;
}

.popup-handle-bar {
  padding: 30rpx 0;
  display: flex;
  justify-content: center;
  .handle {
    width: 90rpx; height: 10rpx;
    background: rgba(0,0,0,0.08);
    border-radius: 100rpx;
  }
}

.popup-body {
  padding: 0 44rpx 80rpx;
}

.date-header-card {
  background: var(--primary-grad);
  border-radius: 48rpx;
  padding: 44rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 20rpx 48rpx var(--primary-shadow);
  color: #fff;
  position: relative;
  overflow: hidden;
  
  .date-side-nav {
    position: absolute; top: 0; bottom: 0; width: 100rpx;
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
    &.prev { left: 0; }
    &.next { right: 0; }
    .nav-arrow { font-size: 40rpx; opacity: 0.3; font-weight: bold; }
    &:active .nav-arrow { opacity: 0.8; }
  }
  
  .date-nav-ops {
    position: absolute;
    top: 30rpx; left: 30rpx; right: 30rpx;
    display: flex; justify-content: space-between; align-items: center;
    .nav-btn {
      width: 60rpx; height: 60rpx; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      .i { font-size: 24rpx; }
      &:active { background: rgba(255,255,255,0.4); }
    }
    .back-today {
      font-size: 22rpx; font-weight: 900; color: #fff;
      padding: 6rpx 20rpx; border-radius: 100rpx;
      background: rgba(255,255,255,0.25);
      border: 2rpx solid rgba(255,255,255,0.4);
    }
  }
  
  .solar-row {
    display: flex; align-items: center; margin: 40rpx 0 30rpx;
    .day-num { font-size: 140rpx; font-weight: 900; line-height: 1; margin-right: 24rpx; text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1); }
    .date-right {
      display: flex; flex-direction: column; gap: 4rpx;
      .month-year { font-size: 28rpx; font-weight: 600; opacity: 0.8; }
      .week-name { font-size: 36rpx; font-weight: 900; }
    }
  }

  .draw-lottery-trigger {
    position: absolute;
    top: 32%; right: 80rpx;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.2);
    border: 1rpx solid rgba(255,255,255,0.3);
    padding: 12rpx 18rpx; border-radius: 24rpx;
    display: flex; flex-direction: column; align-items: center; gap: 4rpx;
    backdrop-filter: blur(12px);
    z-index: 15;
    
    .draw-icon { font-size: 36rpx; line-height: 1; }
    .draw-text { font-size: 16rpx; font-weight: 900; color: #fff; opacity: 0.9; }
    
    &:active { transform: translateY(-50%) scale(0.9); background: rgba(255,255,255,0.3); }
  }
  
  .lunar-info-box {
    .lunar-text-row {
      display: flex; align-items: center; gap: 16rpx; margin-bottom: 12rpx;
      .l-main-text { font-size: 28rpx; font-weight: 800; }
      .l-divider { width: 2rpx; height: 20rpx; background: rgba(255,255,255,0.3); }
      .l-sub-text { font-size: 22rpx; opacity: 0.7; font-weight: 500; }
    }

    .extra-info-row {
      display: flex; align-items: center; gap: 12rpx; margin-bottom: 30rpx;
      .info-item { font-size: 20rpx; opacity: 0.6; font-weight: 500; }
      .info-sep { width: 1rpx; height: 16rpx; background: rgba(255,255,255,0.2); }
    }
    
    .term-capsule {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 20rpx 30rpx;
      border-radius: 32rpx;
      display: flex; gap: 20rpx;
      border: 1rpx solid rgba(255,255,255,0.3);
      
      .t-icon { font-size: 32rpx; margin-top: 4rpx; }
      .t-content {
        flex: 1; display: flex; flex-direction: column; gap: 4rpx;
        .t-top {
          display: flex; align-items: center; gap: 12rpx;
          .t-val { font-size: 26rpx; font-weight: 900; white-space: nowrap; }
          .t-advice { font-size: 22rpx; color: #fff; font-weight: 500; }
        }
        .t-intro { font-size: 18rpx; opacity: 0.8; line-height: 1.4; }
      }
    }
  }
}

.luck-section {
  background: #FFF9F2; border-radius: 40rpx; padding: 30rpx 40rpx; margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(242,161,59,0.05);
  display: flex; justify-content: space-between; align-items: center;
  
  .luck-main {
    flex: 1;
    .section-title {
      display: flex; align-items: center; gap: 16rpx; margin-bottom: 8rpx;
      .title-text { font-size: 22rpx; color: #D39C5E; font-weight: 800; }
      .luck-stars {
        display: flex; gap: 4rpx;
        .star { font-size: 24rpx; color: #EAECEF; }
        .star.active { color: #FFB300; }
      }
    }
    .luck-content {
      .luck-desc { font-size: 26rpx; color: #5D4037; font-weight: 900; }
    }
  }
  
  .luck-tags {
    display: flex; flex-direction: column; gap: 8rpx;
    .mini-tag {
      background: rgba(255,255,255,0.6);
      padding: 4rpx 16rpx; border-radius: 100rpx;
      display: flex; align-items: center; gap: 8rpx;
      .mt-label { font-size: 18rpx; color: #9E9E9E; }
      .mt-val { font-size: 18rpx; font-weight: 900; color: #5D4037; }
    }
  }
}

.almanac-card {
  background: #fff; border-radius: 40rpx; padding: 40rpx; margin-bottom: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.02);
  
  &.food-luck-card {
    padding: 30rpx 40rpx;
    .a-row { margin-bottom: 12rpx; &:last-child { margin-bottom: 0; } }
  }
  
  .a-row {
    display: flex; gap: 30rpx; margin-bottom: 24rpx;
    .a-header {
      width: 64rpx;
      .a-label {
        width: 60rpx; height: 60rpx; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 28rpx; font-weight: 900;
        
        &.food {
          width: auto; height: auto; border-radius: 0;
          font-size: 20rpx; color: #9E9E9E; font-weight: 800;
        }
      }
    }
    .a-tags {
      flex: 1; display: flex; flex-wrap: wrap; gap: 16rpx;
      .a-tag {
        padding: 10rpx 24rpx; border-radius: 100rpx;
        display: flex; align-items: center; gap: 8rpx;
        
        .tag-icon { font-size: 24rpx; }
        .tag-text { font-size: 24rpx; font-weight: 800; }
        .tag-text.highlight { color: var(--primary); }
        
        &.food { background: #E1F5FE; color: #0288D1; font-size: 20rpx; padding: 6rpx 20rpx; }
        &.food-ji { background: #FFF3E0; color: #F57C00; font-size: 20rpx; padding: 6rpx 20rpx; }
      }
    }
    
    &.yi {
      .a-label:not(.food) { background: #E8F5E9; color: #2E7D32; }
      .a-tag:not(.food) { background: #F1F8E9; color: #388E3C; }
    }
    &.ji {
      .a-label:not(.food) { background: #FFEBEE; color: #C62828; }
      .a-tag:not(.food) { background: #FFEBEE; color: #D32F2F; }
    }
  }
  
  .a-footer {
    border-top: 2rpx solid #F8F9FA; padding-top: 20rpx; margin-top: 10rpx; 
    display: flex; flex-direction: column; align-items: center; gap: 4rpx;
    .a-tip { font-size: 20rpx; color: #BDC3C7; font-weight: 500; font-style: italic; }
    .a-source-hint { 
      font-size: 18rpx; color: #D5DBDB; 
    }
  }
}

.food-tip-card {
  background: #fff; border-radius: 40rpx; padding: 36rpx 40rpx; margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  
  .card-title {
    display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx;
    .t-icon { font-size: 32rpx; }
    .t-text { font-size: 26rpx; font-weight: 900; color: #95A5A6; }
  }
  
  .tip-content {
    display: flex; flex-direction: column; gap: 12rpx;
    .tip-text { font-size: 28rpx; color: #2C3E50; line-height: 1.6; font-weight: 800; }
    .tip-quote { font-size: 24rpx; color: #BDC3C7; align-self: flex-end; }
  }
}

.action-bar-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx;
  margin-top: 20rpx;
  
  .action-btn {
    height: 90rpx; line-height: 90rpx; border-radius: 45rpx;
    font-size: 26rpx; font-weight: 900; border: none;
    
    &.recipe {
      background: var(--primary-grad); color: #fff;
      box-shadow: 0 10rpx 20rpx var(--primary-shadow);
    }
    &.cart {
      background: #fff; color: var(--primary);
      border: 2rpx solid var(--primary);
    }
    
    &:active { opacity: 0.8; transform: scale(0.96); }
  }
}

.footer-safe { height: env(safe-area-inset-bottom); padding-bottom: 40rpx; }

/* 抽签动画样式 */
.lottery-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 2000;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  backdrop-filter: blur(10px); border-radius: 64rpx 64rpx 0 0;
}

.lottery-container {
  display: flex; flex-direction: column; align-items: center; gap: 40rpx;
  position: relative;
}

.lottery-hint { font-size: 24rpx; color: rgba(255,255,255,0.6); font-weight: 600; }

.shake-trigger {
  background: #C0392B; color: #fff; padding: 20rpx 80rpx; border-radius: 100rpx;
  font-size: 28rpx; font-weight: 900; border: none; box-shadow: 0 10rpx 40rpx rgba(192,57,43,0.4);
  &:active { transform: scale(0.95); }
}

.lottery-close {
  position: absolute; bottom: -120rpx; width: 80rpx; height: 80rpx;
  border-radius: 50%; background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 32rpx;
}

.lottery-box {
  &.shake { animation: shakeLottery 0.15s infinite; }
}

@keyframes shakeLottery {
  0% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-10rpx) rotate(5deg); }
  100% { transform: translateY(0) rotate(-5deg); }
}

.lottery-tube {
  width: 160rpx; height: 260rpx; background: #C0392B;
  border-radius: 20rpx 20rpx 40rpx 40rpx; position: relative;
  border: 10rpx solid #A93226; box-shadow: 0 20rpx 50rpx rgba(0,0,0,0.3);
  .stick {
    position: absolute; top: -80rpx; width: 14rpx; height: 200rpx;
    background: #F1C40F; border-radius: 6rpx; box-shadow: 2rpx 0 5rpx rgba(0,0,0,0.1);
    &:nth-child(1) { left: 15%; transform: rotate(-12deg); }
    &:nth-child(2) { left: 35%; transform: rotate(-4deg); }
    &:nth-child(3) { left: 55%; transform: rotate(4deg); }
    &:nth-child(4) { left: 75%; transform: rotate(12deg); }
    &:nth-child(5) { left: 25%; transform: rotate(-8deg); top: -90rpx; }
    &:nth-child(6) { left: 65%; transform: rotate(8deg); top: -85rpx; }
  }
}

.fortune-scroll-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 50rpx; width: 100%;
}

.fortune-scroll {
  background: #FFFBF2; width: 480rpx; min-height: 600rpx; padding: 60rpx 40rpx;
  border-radius: 20rpx; box-shadow: 0 30rpx 80rpx rgba(0,0,0,0.4);
  position: relative; border: 2rpx solid #F3E5AB;
  display: flex; flex-direction: column;
  
  &.fade-in { animation: scrollUnfold 0.8s cubic-bezier(0.2, 1, 0.3, 1); }
  
  .f-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx;
    .f-no { font-size: 22rpx; color: #8B4513; font-weight: 900; opacity: 0.6; }
    .f-level { 
      font-size: 24rpx; font-weight: 900; padding: 4rpx 16rpx; border-radius: 8rpx;
      &.level-ss { background: #C0392B; color: #fff; }
      &.level-sj { background: #E67E22; color: #fff; }
      &.level-zp { background: #7F8C8D; color: #fff; }
      &.level-tx { background: #2C3E50; color: #fff; }
    }
  }
  
  .f-body {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 30rpx;
    .f-title { font-size: 48rpx; font-weight: 900; color: #333; writing-mode: vertical-rl; letter-spacing: 10rpx; }
    .f-v-divider { width: 4rpx; height: 60rpx; background: #C0392B; margin: 10rpx 0; }
    .f-text { font-size: 32rpx; color: #444; font-weight: 800; line-height: 1.8; text-align: center; }
  }
  
  .f-footer {
    margin-top: 50rpx; padding-top: 30rpx; border-top: 1rpx dashed #D4AF37;
    .f-inte-label { font-size: 22rpx; color: #C0392B; font-weight: 900; display: block; margin-bottom: 8rpx; }
    .f-inte-text { font-size: 24rpx; color: #7F8C8D; font-weight: 600; line-height: 1.6; }
  }
}

@keyframes scrollUnfold {
  from { transform: scaleY(0.1) scaleX(0.8); opacity: 0; }
  to { transform: scaleY(1) scaleX(1); opacity: 1; }
}

.f-actions {
  display: flex; gap: 24rpx; align-items: center;
  .f-act-btn {
    padding: 24rpx 48rpx; border-radius: 100rpx; font-size: 26rpx; font-weight: 900;
    &.primary { background: #C0392B; color: #fff; box-shadow: 0 10rpx 30rpx rgba(192,57,43,0.3); }
    &.secondary { background: #fff; color: #C0392B; border: 2rpx solid #C0392B; }
    &:active { transform: scale(0.95); opacity: 0.9; }
  }
  .f-close {
    width: 80rpx; height: 80rpx; background: rgba(255,255,255,0.2);
    border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center;
    font-size: 32rpx; margin-left: 10rpx;
  }
}
</style>
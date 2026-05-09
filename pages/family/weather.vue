<!-- 天气详情页面 - 独立页面版 -->
<template>
  <custom-header title="天气详情" :icon="getWeatherEmoji(weather.now.icon)" :back="true" />
  <view class="weather-page" :style="themeStyle">
    <scroll-view scroll-y class="page-scroll-area" :show-scrollbar="false">
      <view class="scroll-content-wrap">
        
        <!-- 1. 顶部核心信息区 -->
        <view class="top-info-section">
          <view class="city-row">
            <text class="city-name">{{ weather.city }}</text>
            <text class="top-weather-icon">{{ getWeatherEmoji(weather.now.icon) }}</text>
          </view>
          <view class="temp-row">
            <text class="temp-num">{{ weather.now.temp || '--' }}</text>
            <text class="temp-unit">°C</text>
          </view>
          <view class="status-row">
            <text class="status-text">{{ weather.now.text || '加载中' }}</text>
            <view class="c-divider"></view>
            <text class="feels-like">体感 {{ weather.now.feelsLike || '--' }}°</text>
            <view class="c-divider" v-if="weather.daily[0]"></view>
            <text class="range-temp" v-if="weather.daily[0]">
              {{ weather.daily[0].tempMin }}° / {{ weather.daily[0].tempMax }}°
            </text>
          </view>
          <view class="cooking-tip-row">
            <text class="tip-text">{{ lifestyleTip }}</text>
          </view>
        </view>

        <!-- 2. 详细数据宫格 -->
        <view class="detail-grid">
          <view class="grid-card" v-for="(item, idx) in detailItems" :key="idx">
            <view class="g-icon-box" :class="item.colorClass">
              <text class="g-icon">{{ item.icon }}</text>
            </view>
            <view class="g-info">
              <text class="g-label">{{ item.label }}</text>
              <text class="g-val">{{ item.val }}<text class="g-unit">{{ item.unit }}</text></text>
            </view>
          </view>
        </view>

        <!-- 3. 降水概率卡片 -->
        <view class="card precip-card">
          <view class="card-header">
            <view class="card-title-box">
              <text class="card-icon">☔</text>
              <text class="card-title">降水概率</text>
            </view>
            <text class="card-val">{{ weather.pop }}%</text>
          </view>
          <view class="progress-box">
            <view class="progress-bg">
              <view class="progress-fill" :style="{ width: weather.pop + '%' }"></view>
            </view>
          </view>
          <text class="precip-desc">{{ precipTip }}</text>
        </view>

        <!-- 4. 未来7日预报 -->
        <view class="forecast-section">
          <view class="section-header">
            <text class="card-title">未来7日预报</text>
          </view>
          <scroll-view scroll-x class="forecast-scroll" :show-scrollbar="false">
            <view class="forecast-list">
              <view 
                class="forecast-item" 
                v-for="(f, idx) in weather.daily" 
                :key="idx"
                :class="{ 'is-today': idx === 0 }"
              >
                <text class="f-date">{{ getDayLabel(idx, f.fxDate) }}</text>
                <text class="f-icon">{{ getWeatherEmoji(f.iconDay) }}</text>
                <view class="f-temp-box">
                  <text class="f-temp-max">{{ f.tempMax }}°</text>
                  <text class="f-temp-min">{{ f.tempMin }}°</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 5. 生活指数 -->
        <view class="indices-section">
          <view class="section-header">
            <text class="card-title">生活指数建议</text>
          </view>
          <view class="indices-list">
            <view class="index-card" v-for="(idx, i) in filteredIndices" :key="i">
              <view class="index-left">
                <view class="level-circle" :style="{ borderColor: getLevelColor(idx.level) }">
                  <text class="l-num" :style="{ color: getLevelColor(idx.level) }">{{ idx.level }}</text>
                </view>
                <text class="l-label">级</text>
              </view>
              <view class="index-right">
                <view class="idx-header">
                  <text class="idx-name">{{ idx.name }}</text>
                  <text class="idx-category">{{ idx.category }}</text>
                </view>
                <text class="idx-desc">{{ idx.text }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="footer-safe"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/common/request.js'

// 腾讯地图 KEY
const TENCENT_MAP_KEY = 'PUXBZ-SGFLZ-DFUXY-TJJYY-GF7ZS-VQBV3'

const weather = ref({
  now: {},
  daily: [],
  indices: [],
  pop: 0,
  city: '获取中...',
})

const themes = [
  { name: '温柔粉', color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
  { name: '清新绿', color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
  { name: '雾霾蓝', color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
  { name: '暖杏黄', color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
]

const themeStyle = ref('')
const location = ref('')
const loading = ref(false)

// 获取并应用主题
const applyTheme = (idx) => {
  const t = themes[idx]
  themeStyle.value = `--primary: ${t.color}; --primary-light: ${t.light}; --primary-grad: ${t.gradient}; --primary-shadow: ${t.shadow};`
  uni.setNavigationBarColor({
    frontColor: '#000000',
    backgroundColor: '#F6F7F9'
  })
}

const initTheme = () => {
  const currentThemeIdx = uni.getStorageSync('current_theme') || 0
  applyTheme(currentThemeIdx)
}

onLoad((options) => {
  initTheme()
  if (options.location) {
    location.value = options.location
    fetchData()
  } else {
    initLocation()
  }
})

const initLocation = () => {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      location.value = `${res.longitude.toFixed(6)},${res.latitude.toFixed(6)}`
      fetchData()
    },
    fail: () => {
      location.value = '116.40,39.90' // 默认北京
      fetchData()
    }
  })
}

// 用于腾讯地图API防并发和节流
const pendingCityReqs = new Map()
let lastCityReqTime = 0

// 使用腾讯地图逆地址解析获取城市名
const getCityNameByTencent = (loc) => {
  if (!loc) return Promise.resolve(null)
  
  const [lngStr, latStr] = loc.split(',')
  if (!lngStr || !latStr) return Promise.resolve(null)

  // 坐标保留2位小数(约1.1km)，做缓存Key，同一范围内移动共用缓存
  const lng = parseFloat(lngStr).toFixed(2)
  const lat = parseFloat(latStr).toFixed(2)
  const cacheKey = `tencent_city_str_${lat}_${lng}`

  // 1. 本地缓存（6小时）
  try {
    const cached = uni.getStorageSync(cacheKey)
    if (cached && cached.expireTime > Date.now()) {
      return Promise.resolve(cached.data)
    }
  } catch (e) {}

  // 2. 防并发控制
  if (pendingCityReqs.has(cacheKey)) {
    return pendingCityReqs.get(cacheKey)
  }

  // 3. 节流：3秒内限1次API真实调用
  const now = Date.now()
  if (now - lastCityReqTime < 3000) {
    return Promise.resolve(null)
  }
  lastCityReqTime = now

  const reqPromise = new Promise((resolve) => {
    uni.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        location: `${latStr},${lngStr}`, // API真实请求使用精确坐标
        key: TENCENT_MAP_KEY,
        output: 'json'
      },
      success: (res) => {
        console.log('腾讯地图逆地址解析结果:', res)
        if (res.data && res.data.status === 0 && res.data.result) {
          let city = res.data.result.address_component.city || res.data.result.address_component.district
          if (city) {
            const cityName = city.replace('市', '')
            // 写入本地缓存 6小时
            try {
              uni.setStorageSync(cacheKey, {
                data: cityName,
                expireTime: Date.now() + 6 * 60 * 60 * 1000
              })
            } catch (e) {}
            resolve(cityName)
            return
          }
        }
        resolve(null)
      },
      fail: () => resolve(null),
      complete: () => {
        pendingCityReqs.delete(cacheKey)
      }
    })
  })

  pendingCityReqs.set(cacheKey, reqPromise)
  return reqPromise
}

const fetchData = async () => {
  if (loading.value) return
  loading.value = true
  uni.showLoading({ title: '加载中...' })
  
  try {
    const loc = location.value
    
    const [cityName, nowRes, dailyRes, indicesRes, hourlyRes] = await Promise.all([
      getCityNameByTencent(loc),
      request('/weather/now', 'GET', { location: loc }).catch(() => null),
      request('/weather/7d', 'GET', { location: loc }).catch(() => null),
      request('/indices/1d', 'GET', { location: loc, type: '1,2,3,5' }).catch(() => null),
      request('/weather/24h', 'GET', { location: loc }).catch(() => null)
    ])

    weather.value.city = cityName || '未知位置'

    if (nowRes && nowRes.now) weather.value.now = nowRes.now
    if (dailyRes && dailyRes.daily) weather.value.daily = dailyRes.daily
    if (indicesRes && indicesRes.daily) weather.value.indices = indicesRes.daily
    if (hourlyRes && hourlyRes.hourly?.[0]) weather.value.pop = hourlyRes.hourly[0].pop || 0
    
  } catch (e) {
    console.error('Fetch Weather Error:', e)
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

const getWeatherEmoji = (iconCode) => {
  const emojiMap = {
    // 晴天
    '100': '☀️', '150': '🌙', '152': '☁️🌙',
    // 多云阴天
    '101': '⛅', '102': '🌤️', '103': '⛅', '104': '☁️',
    '151': '☁️🌙', '153': '🌙',
    // 雨
    '300': '🌦️', '301': '🌧️', '302': '⛈️', '303': '⛈️',
    '304': '🌩️', '305': '🌧️', '306': '🌧️', '307': '🌧️',
    '308': '🌊🌧️', '309': '🌧️', '310': '🌧️', '311': '🌧️',
    '312': '🌧️', '313': '🧊🌧️', '399': '🌧️',
    // 雪
    '400': '❄️', '401': '❄️', '402': '❄️', '403': '❄️',
    '404': '🌨️', '405': '🌨️', '406': '❄️', '499': '❄️',
    // 雾霾沙尘
    '500': '🌫️', '501': '🌫️', '502': '😷', '503': '🏜️',
    '504': '🏜️', '505': '🏜️', '506': '🌪️', '507': '🌫️',
    '508': '🌫️', '509': '😷', '510': '😷', '511': '😷',
    '512': '😷', '513': '🌫️', '514': '🌫️', '515': '🌧️🌫️'
  }
  return emojiMap[String(iconCode)] || '🌤️'
}

// 详细数据宫格项
const detailItems = computed(() => [
  { icon: '💧', label: '湿度', val: weather.value.now.humidity || '--', unit: '%', colorClass: 'bg-blue' },
  { icon: '🧭', label: '风向', val: weather.value.now.windDir || '--', unit: '', colorClass: 'bg-orange' },
  { icon: '🚀', label: '风速', val: weather.value.now.windSpeed || '--', unit: 'km/h', colorClass: 'bg-orange' },
  { icon: '⏲️', label: '气压', val: weather.value.now.pressure || '--', unit: 'hPa', colorClass: 'bg-purple' },
  { icon: '👁️', label: '能见度', val: weather.value.now.vis || '--', unit: 'km', colorClass: 'bg-blue' },
  { icon: '☀️', label: '紫外线', val: getUVLevelText(weather.value.indices), unit: '', colorClass: 'bg-purple' }
])



const precipTip = computed(() => {
  const p = weather.value.pop
  if (p < 20) return '今天基本无雨，非常适合洗晒衣物。'
  if (p < 50) return '可能有零星小雨，出门建议带把伞。'
  return '降水概率较大，记得关好窗户并减少外出。'
})

const lifestyleTip = computed(() => {
  if (!weather.value.now.text) return '获取建议中...'
  const text = weather.value.now.text || ''
  const temp = parseInt(weather.value.now.temp) || 20
  if (text.includes('雨')) return '今天雨天，宜在家煲一锅暖暖的汤 🍲'
  if (text.includes('晴') && temp > 25) return '阳光正好，非常适合晾晒被子 ☀️'
  if (temp < 10) return '天气寒冷，记得加衣，宜吃热乎火锅 🥘'
  return '天气宜人，适合下厨做几道拿手好菜 👨‍🍳'
})

const filteredIndices = computed(() => {
  if (!weather.value.indices || !weather.value.indices.length) return []
  const targetTypes = ['1', '2', '3', '5']
  const res = weather.value.indices.filter(item => targetTypes.includes(item.type))
  res.push(getCookingIndex())
  return res.slice(0, 5).map(item => ({ ...item, category: getIndexCategory(item.type) }))
})

const getCookingIndex = () => {
  const text = weather.value.now.text || ''
  const temp = parseInt(weather.value.now.temp) || 20
  let level = '3'
  let advice = '今日气候宜人，推荐尝试制作新菜谱。'
  if (text.includes('雨')) { 
    level = '5'
    advice = '雨天湿气重，推荐：山药排骨汤、当归鸡汤，暖身祛湿。' 
  } else if (temp > 30) { 
    level = '4'
    advice = '天气炎热，推荐：拍黄瓜、绿豆沙、凉拌面，清爽消暑。' 
  } else if (temp < 5) { 
    level = '5'
    advice = '寒冷冬日，推荐：红烧羊肉、老鸭汤，温补御寒。' 
  }
  return { type: '99', name: '烹饪与饮食', level: level, text: advice }
}

const getIndexCategory = (type) => {
  const map = { '1': '生活', '2': '出行', '3': '健康', '5': '健康', '99': '美食' }
  return map[type] || '建议'
}

const getLevelColor = (level) => {
  const l = parseInt(level)
  if (isNaN(l)) return '#4DB88F'
  if (l <= 2) return '#4DB88F'
  if (l <= 3) return '#F2A13B'
  return '#FF6B8B'
}

const getUVLevelText = (indices) => {
  if (!indices || !indices.length) return '--'
  const uv = indices.find(i => i.type === '5')
  return uv ? uv.level + '级' : '--'
}

const getDayLabel = (idx, date) => {
  if (idx === 0) return '今日'
  if (idx === 1) return '明天'
  if (!date) return '第' + (idx + 1) + '天'
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weeks[new Date(date).getDay()]
}
</script>

<style lang="less" scoped>
.weather-page {
  min-height: 100vh;
  background-color: #F6F7F9;
}

.page-scroll-area {
  height: 100vh;
}

.scroll-content-wrap {
  padding: 30rpx 30rpx calc(60rpx + env(safe-area-inset-bottom));
}

/* 顶部信息 */
.top-info-section {
  text-align: center;
  background: var(--primary-grad);
  border-radius: 48rpx;
  padding: 30rpx 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 16rpx 40rpx var(--primary-shadow);
  transition: all 0.5s ease;
  
  .city-row {
    display: flex; align-items: center; justify-content: center; gap: 16rpx;
    margin-bottom: 20rpx;
    .city-name { font-size: 44rpx; font-weight: 800; color: #fff; }
    .top-weather-icon { font-size: 64rpx; }
  }
  .temp-row {
    display: flex; align-items: baseline; justify-content: center; margin-bottom: 16rpx;
    .temp-num { font-size: 120rpx; font-weight: bold; color: #fff; line-height: 1; }
    .temp-unit { font-size: 40rpx; margin-left: 8rpx; color: rgba(255,255,255,0.6); }
  }
  .status-row {
    display: flex; align-items: center; justify-content: center; gap: 24rpx;
    margin-bottom: 40rpx;
    .status-text { font-size: 36rpx; font-weight: 600; color: #fff; }
    .c-divider { width: 2rpx; height: 24rpx; background: rgba(255,255,255,0.4); }
    .feels-like { font-size: 28rpx; color: rgba(255,255,255,0.9); font-weight: 600; }
    .range-temp { font-size: 28rpx; color: rgba(255,255,255,0.9); font-weight: 600; }
  }
  .cooking-tip-row {
    background: rgba(255,255,255,0.25);
    border: 2rpx solid rgba(255,255,255,0.4);
    padding: 24rpx 44rpx;
    border-radius: 100rpx;
    display: inline-flex; align-items: center;
    backdrop-filter: blur(12px);
    .tip-text { font-size: 26rpx; color: #fff; font-weight: 600; }
  }
}

/* 通用卡片 */
.card {
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.02);
}
.card-title { 
  font-size: 32rpx; 
  font-weight: 800; 
  color: #2C3E50; 
  position: relative;
  padding-left: 20rpx;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 28rpx;
    background: var(--primary);
    border-radius: 10rpx;
    transition: background 0.5s ease;
  }
}
.section-header { margin-bottom: 30rpx; }

/* 详细网格 */
.detail-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 24rpx;
  margin-bottom: 30rpx;
}
.grid-card {
  background: #fff;
  padding: 34rpx; border-radius: 40rpx;
  display: flex; align-items: center; gap: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
  transition: all 0.3s;
  
  .g-icon-box {
    width: 72rpx; height: 72rpx; 
    border-radius: 24rpx; 
    display: flex; align-items: center; justify-content: center;
    transition: background 0.5s ease;
    &.bg-blue { background: #E8F4FF; color: #3B82F6; }
    &.bg-orange { background: #FFF4ED; color: #F97316; }
    &.bg-purple { background: #F3E8FF; color: #A855F7; }
    .g-icon { font-size: 36rpx; }
  }
  .g-info {
    display: flex; flex-direction: column;
    .g-label { font-size: 22rpx; color: #95A5A6; font-weight: 600; margin-bottom: 4rpx; }
    .g-val { font-size: 32rpx; color: #2C3E50; font-weight: 800; }
    .g-unit { font-size: 22rpx; margin-left: 4rpx; color: #95A5A6; }
  }
}

/* 降水 */
.precip-card {
  border-radius: 40rpx;
  .card-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx;
    .card-title-box { display: flex; align-items: center; gap: 12rpx; }
    .card-icon { font-size: 32rpx; }
    .card-val { font-size: 40rpx; font-weight: 900; color: var(--primary); transition: color 0.5s ease;}
  }
  .progress-box {
    height: 16rpx; background: #EAECEF;
    border-radius: 100rpx; overflow: hidden; margin-bottom: 24rpx;
    .progress-fill { height: 100%; border-radius: 100rpx; transition: width 1s ease; background: linear-gradient(90deg, #3B82F6, #FBBF24, #F97316); }
  }
  .precip-desc { font-size: 24rpx; color: #7F8C8D; font-weight: 600; text-align: center; display: block; margin-top: 10rpx; }
}

/* 预报 */
.forecast-section {
  background: #fff; border-radius: 40rpx; padding: 40rpx; margin-bottom: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.02);
}
.forecast-scroll { width: 100%; }
.forecast-list { display: flex; gap: 24rpx; padding-bottom: 10rpx; }
.forecast-item {
  min-width: 160rpx; padding: 36rpx 20rpx;
  background: #F8F9FA; border: 4rpx solid transparent; border-radius: 36rpx;
  display: flex; flex-direction: column; align-items: center; gap: 24rpx;
  transition: transform 0.2s ease, background 0.3s ease;
  
  &:active { transform: scale(0.95); }
  &.is-today {
    border-color: var(--primary);
    background: var(--primary-light);
  }
  .f-date { font-size: 24rpx; color: #7F8C8D; font-weight: 600; }
  .f-icon { font-size: 54rpx; }
  .f-temp-box {
    display: flex; flex-direction: column; align-items: center;
    .f-temp-max { font-size: 32rpx; font-weight: 800; color: #2C3E50; }
    .f-temp-min { font-size: 24rpx; color: #95A5A6; font-weight: 600; }
  }
}

/* 指数 */
.indices-section {
  .section-header { margin-bottom: 30rpx; }
}
.indices-list { display: flex; flex-direction: column; gap: 24rpx; }
.index-card {
  background: #fff; border-radius: 40rpx; padding: 36rpx;
  display: flex; align-items: center; gap: 36rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
  .index-left {
    display: flex; flex-direction: column; align-items: center; gap: 6rpx;
    .level-circle {
      width: 84rpx; height: 84rpx; border-radius: 50%;
      border: 6rpx solid #EAECEF; display: flex; align-items: center; justify-content: center;
      .l-num { font-size: 34rpx; font-weight: 900; }
    }
    .l-label { font-size: 20rpx; color: #95A5A6; font-weight: 800; }
  }
  .index-right {
    flex: 1; display: flex; flex-direction: column; gap: 16rpx;
    .idx-header { display: flex; justify-content: space-between; align-items: center; }
    .idx-name { font-size: 28rpx; font-weight: 800; color: #2C3E50; }
    .idx-category { font-size: 20rpx; padding: 6rpx 20rpx; border-radius: 100rpx; background: var(--primary-light); color: var(--primary); font-weight: bold; transition: all 0.5s ease; }
    .idx-desc { font-size: 24rpx; color: #95A5A6; line-height: 1.6; font-weight: 500; }
  }
}

.footer-safe { height: 60rpx; }
</style>
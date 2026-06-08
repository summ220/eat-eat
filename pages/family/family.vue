<template>
  <view class="page-container" :style="themeStyle" @click="dietPreferencesRef?.cancelEdit()">
    <gourmet-refresher :refreshing="refreshing" type="family" :theme="currentTheme" />
    <!-- 1. 顶部大卡片 -->
    <view class="top-card">
      <!-- 智能提醒跑马灯 (移至最顶部) -->
      <view class="marquee-reminder-row" v-if="reminders.length > 0" @click="showReminderModal = true">
        <view class="marquee-capsule">
          <text class="m-icon">📢</text>
          <view class="m-content-wrap">
            <view class="m-scroll-box">
              <text class="m-scroll-text">智能管家提醒：</text>
              <text class="m-scroll-text">{{ concatenatedReminders }}</text>
              <text class="m-scroll-text">{{ concatenatedReminders }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="top-header">
        <view class="user-info">
          <image class="avatar" :src="familyAvatar ? (familyAvatar.startsWith('http') ? familyAvatar : config.imgBaseUrl + familyAvatar) : config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'" mode="aspectFill" @click.stop="previewImage(familyAvatar || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg')" />
          <view class="name-box">
            <view class="family-name-wrap">
              <text class="family-name">{{ familyName }}</text>
              <view class="edit-icon-btn" @click="openEditFamilyName" v-if="familyCode === 'default_family' || familyRole === 'owner'">
                <text class="e-icon">✏️</text>
              </view>
              <!-- 如果加入了多个家庭，允许切换家庭 -->
              <view class="edit-icon-btn" @click="switchToAnotherFamily">
                <text class="e-icon">🔀</text>
              </view>
            </view>
            <text class="greeting">{{ greeting }}</text>
          </view>
        </view>
        <!-- <view class="refresh-weather-btn" :class="{ 'is-refreshing': isRefreshingWeather }" @click="refreshWeatherAndLocation">
          <text class="r-icon">🔄</text>
        </view> -->
      </view>

      <!-- 日期与天气磨砂胶囊 (独立标签) -->
      <view class="glass-capsule-row">
        <view class="glass-capsule" @click="showCompassPopup = true">
          <image class="compass-icon" src="data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%3E%3C%2Fcircle%3E%3Cpolygon%20points%3D%2216.24%207.76%2014.12%2014.12%207.76%2016.24%209.88%209.88%2016.24%207.76%22%3E%3C%2Fpolygon%3E%3C%2Fsvg%3E" />
        </view>
        <view class="glass-capsule" @click="showCalendarPopup = true">
          <text class="c-text">{{ dateInfo.gregorian }}</text>
          <view class="c-divider"></view>
          <text class="c-text">{{ dateInfo.lunar }}</text>
        </view>
        <view class="glass-capsule" @click="openWeatherDetail">
          <image class="weather-icon" :src="`https://lw.feiyuf.top/weather-icons/${dateInfo.weatherIcon}.svg`" />
          <text class="c-text">{{ dateInfo.weather }} {{ dateInfo.temp }}</text>
        </view>
      </view>
    </view>

    <view class="main-content">
      <!-- 1. 家庭成员 -->
      <view class="section members-section">
        <view class="section-title">
          <text class="title-text">家庭成员</text>
          <view class="title-actions">
            <text class="action-text" @click="familyMembersRef?.openInvite()">邀请</text>
          </view>
        </view>
        <family-members
          ref="familyMembersRef"
          :family-code="familyCode"
          :family-role="familyRole"
          @family-changed="handleFamilyMembersChanged"
          @show-switch-modal="showSwitchFamilyModal = true"
        />
      </view>

      <!-- 2. 家庭健康管理入口 -->
      <view class="section health-section" @click="goToHealth">
        <view class="section-title">
          <text class="title-text">家庭健康管理</text>
          <text class="action-text">查看 👉</text>
        </view>
        <health-card
          ref="healthCardRef"
          :family-code="familyCode"
        />
      </view>

      <!-- 3. 今日三餐 -->
      <view class="section meals-section">
        <view class="section-title with-bar">
          <text class="title-text">今日三餐</text>
          <view class="title-right-actions" style="display: flex; gap: 20rpx;">
            <text class="action-text subtle-link" @click="goToDietDiary">📓 饮食手账</text>
            <text class="action-text subtle-link" @click="mealsPlanRef?.copyMealsToTomorrow()">📅 复制到明天</text>
          </view>
        </view>
        <meals-plan
          ref="mealsPlanRef"
          :family-code="familyCode"
        />
      </view>

      <!-- 4. 家庭备忘录入口 -->
      <view class="section memo-section" @click="goToMemo">
        <view class="section-title">
          <text class="title-text">家庭备忘录</text>
          <text class="action-text">查看 👉</text>
        </view>
        <memo-card
          ref="memoCardRef"
          :family-code="familyCode"
        />
      </view>

      <!-- 5. 快捷功能宫格 -->
      <view class="section quick-section">
        <view class="section-title"><text class="title-text">快捷功能</text></view>
        <quick-features
          :family-code="familyCode"
        />
      </view>

      <!-- 6. 饮食偏好设置 -->
      <view class="section prefs-section">
        <view class="section-title"><text class="title-text">饮食偏好</text></view>
        <diet-preferences
          ref="dietPreferencesRef"
          :family-code="familyCode"
        />
      </view>

      <!-- 7. 消费趋势卡片 -->
      <view class="section trend-section">
        <view class="section-title"><text class="title-text">近7日开销</text></view>
        <spending-trend
          ref="spendingTrendRef"
          :family-code="familyCode"
        />
      </view>

      <!-- 8. 主题切换 -->
      <view class="section theme-section">
        <view class="section-title">
          <text class="title-text">个性主题</text>
        </view>
        <theme-picker
          :themes="themes"
          :current-theme="currentTheme"
          @change="switchTheme"
        />
      </view>

      <!-- 9. 底部设置模块 -->
      <view class="bottom-settings">
        <view class="set-list">
          <view class="set-item" @click="openShowFamilyCodeModal" v-if="familyCode && familyRole === 'owner'">
            <text class="set-icon">🔑</text>
            <text class="set-text">家庭编码</text>
            <text class="set-desc" style="margin-right:16rpx; color: #999;">查看并复制</text>
            <text class="set-arrow">👉</text>
          </view>
          <view class="set-item" @click="openSetSecurityModal" v-if="familyCode && familyRole === 'owner'">
            <text class="set-icon">🛡️</text>
            <text class="set-text">数据找回密保设置</text>
            <text class="set-desc" style="margin-right:16rpx; color: #999;">保障历史数据</text>
            <text class="set-arrow">👉</text>
          </view>
          <view class="set-item" @click="handleClearCache">
            <text class="set-icon">🧹</text>
            <text class="set-text">清除缓存</text>
            <text class="set-arrow"> 👉</text>
          </view>
          <view class="set-item">
            <text class="set-icon">📖</text>
            <text class="set-text">使用帮助</text>
            <text class="set-arrow"> 👉</text>
          </view>
          <view class="set-item">
            <text class="set-icon">💬</text>
            <text class="set-text">意见反馈</text>
            <text class="set-arrow"> 👉</text>
          </view>
          <view class="set-item version">
            <text class="set-icon">✨</text>
            <text class="set-text">当前版本</text>
            <text class="set-desc">v1.3.0</text>
          </view>
        </view>
        <view class="brand-info">
          <text>家庭小厨房 • 用心记录每一餐</text>
        </view>
      </view>
      <view class="footer-safe"></view>
    </view>
      
    <!-- 天气组件 -->
    <weather-popup 
      :show="showWeatherPopup" 
      :location="weatherLocation" 
      @close="showWeatherPopup = false" 
    />
    <!-- 日历组件 -->
    <calendar-popup 
      :show="showCalendarPopup" 
      @close="showCalendarPopup = false"
    />
    <!-- 指南针组件 -->
    <compass-popup 
      :show="showCompassPopup" 
      @close="showCompassPopup = false"
    />



    <!-- 加入弹窗 -->
    <join-family-popup
      :show="showJoinModal"
      @close="showJoinModal = false"
      @joined="handleJoined"
    />

    <!-- 切换家庭弹窗 -->
    <switch-family-popup
      :show="showSwitchFamilyModal || !familyCode"
      :family-code="familyCode"
      :family-name="familyName"
      :family-avatar="familyAvatar"
      :family-role="familyRole"
      @close="showSwitchFamilyModal = false"
      @join="showJoinModal = true"
    />
    <!-- 修改家庭名称弹窗 -->
    <edit-family-popup
      :show="showFamilyNameModal"
      :family-code="familyCode"
      :family-name="familyName"
      :family-avatar="familyAvatar"
      @close="showFamilyNameModal = false"
      @saved="handleFamilySaved"
      @preview="previewImage"
    />



    


    <!-- 智能管家提醒详情弹窗 -->
    <reminders-popup
      :show="showReminderModal"
      :reminders="reminders"
      @close="showReminderModal = false"
      @action="handleReminderAction"
    />


    <!-- 12. 新增：家庭编码复制弹窗 -->
    <family-code-popup
      :show="showFamilyCodeModal"
      :family-code="familyCode"
      @close="showFamilyCodeModal = false"
    />

    <!-- 13. 新增：密保找回设置弹窗 -->
    <security-setting-popup
      :show="showSecuritySettingModal"
      :family-code="familyCode"
      @close="showSecuritySettingModal = false"
      @saved="handleSecuritySaved"
    />
    
    <!-- 密保强引导弹窗 -->
    <view class="modal-mask" v-if="showSecurityGuideModal" @click="closeSecurityGuide(false)">
      <view class="modal-content security-guide-modal" @click.stop>
        <view class="shield-badge">🛡️</view>
        <text class="guide-title">设置安全密保</text>
        <text class="guide-desc">
          检测到您尚未设置找回密保。设置密保后，未来即使清空缓存或更换设备，也能凭密保一键找回所有家庭数据（食材、账本、菜单等）。
        </text>
        <view class="guide-btns">
          <button class="g-btn-later" @click="closeSecurityGuide(true)">下次提醒</button>
          <button class="g-btn-go" @click="goSetSecurity">立即设置</button>
        </view>
      </view>
    </view>

    <custom-tabbar />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import familyApi from '@/common/api/family.js'
import weatherPopup from '@/components/weather-popup/weather-popup.vue' // 天气预警弹窗
import calendarPopup from '@/components/calendar-popup/calendar-popup.vue' // 万年历弹窗
import compassPopup from '@/components/compass-popup/compass-popup.vue' // 指南针弹窗
import mealsPlan from './component/content/meals-plan.vue' // 一体化自治三餐组件
import familyMembers from './component/content/family-members.vue' // 家庭成员自治组件
import healthCard from './component/content/health-card.vue' // 家庭健康简报卡片自治组件
import memoCard from './component/content/memo-card.vue' // 家庭备忘录简报卡片自治组件
import quickFeatures from './component/content/quick-features.vue' // 快捷功能及抽菜自治组件
import switchFamilyPopup from './component/alert/switch-family-popup.vue' // 切换家庭弹窗
import securitySettingPopup from './component/alert/security-setting-popup.vue' // 密保找回设置弹窗
import familyCodePopup from './component/alert/family-code-popup.vue' // 家庭安全编码弹窗
import dietPreferences from './component/content/diet-preferences.vue' // 饮食偏好自治组件
import spendingTrend from './component/content/spending-trend.vue' // 消费趋势卡片自治组件
import themePicker from './component/content/theme-picker.vue' // 个性主题选择自治组件

import joinFamilyPopup from './component/alert/join-family-popup.vue' // 加入新家庭弹窗
import editFamilyPopup from './component/alert/edit-family-popup.vue' // 修改家庭名称弹窗
import remindersPopup from './component/alert/reminders-popup.vue' // 智能管家提醒弹窗

import config from '@/common/config'
import request from '@/common/request.js'

const refreshing = ref(false)

const refreshAllData = async () => {
  try {
    const promises = [
      loadFamily(),
      refreshWeatherAndLocation(),
      loadReminders()
    ]
    if (mealsPlanRef.value && typeof mealsPlanRef.value.loadMeals === 'function') {
      promises.push(mealsPlanRef.value.loadMeals())
    }
    if (familyMembersRef.value && typeof familyMembersRef.value.loadFamilyMembers === 'function') {
      promises.push(familyMembersRef.value.loadFamilyMembers())
    }
    if (healthCardRef.value && typeof healthCardRef.value.loadHealthSummary === 'function') {
      promises.push(healthCardRef.value.loadHealthSummary())
    }
    if (memoCardRef.value && typeof memoCardRef.value.loadMemoPreview === 'function') {
      promises.push(memoCardRef.value.loadMemoPreview())
    }
    if (dietPreferencesRef.value && typeof dietPreferencesRef.value.loadDietPreferences === 'function') {
      promises.push(dietPreferencesRef.value.loadDietPreferences())
    }
    if (spendingTrendRef.value && typeof spendingTrendRef.value.loadSpendingTrends === 'function') {
      promises.push(spendingTrendRef.value.loadSpendingTrends())
    }
    await Promise.all(promises)
  } catch (e) {
    console.error('刷新家庭数据失败:', e)
  }
}

onPullDownRefresh(async () => {
  refreshing.value = true
  try {
    await Promise.all([
      refreshAllData(),
      new Promise(resolve => setTimeout(resolve, 1500)) // 温馨小屋爱心飘浮动画时间
    ])
  } catch (e) {
    console.error('家庭下拉刷新出错:', e)
  } finally {
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
})

// 跳转至饮食日记
const goToDietDiary = () => {
  uni.navigateTo({
    url: '/pages/family/component/singlePage/diet-diary'
  })
}

// --- 一体化三餐/成员/健康组件引用 ---
const mealsPlanRef = ref(null)
const familyMembersRef = ref(null)
const healthCardRef = ref(null)
const memoCardRef = ref(null)
const dietPreferencesRef = ref(null)
const spendingTrendRef = ref(null)

// --- 数据找回与密保双重验证系统 ---
const showFamilyCodeModal = ref(false)
const showSecuritySettingModal = ref(false)

const openShowFamilyCodeModal = () => {
  showFamilyCodeModal.value = true
}

const openSetSecurityModal = () => {
  showSecuritySettingModal.value = true
}
const showCompassPopup = ref(false)
const previewImage = (url) => {
  const fullUrl = url ? (url.startsWith('http') ? url : config.imgBaseUrl + url) : ''
  if (fullUrl) {
    uni.previewImage({
      urls: [fullUrl]
    })
  }
}
const familyName = ref('')
const familyCode = ref(uni.getStorageSync('family_code'))
const familyRole = ref('owner')
const familyAvatar = ref(uni.getStorageSync('family_avatar') || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg')

// 切换家庭模态弹窗状态
const showSwitchFamilyModal = ref(false)

// 切换至另一个家庭的触发函数
const switchToAnotherFamily = () => {
  showSwitchFamilyModal.value = true
}

// 天气/日历弹窗控制
const weatherLocation = ref('')
const showWeatherPopup = ref(false)
const showCalendarPopup = ref(false)
const showReminderModal = ref(false)

// 家庭名称修改
const showFamilyNameModal = ref(false)

const openEditFamilyName = () => {
  showFamilyNameModal.value = true
}

const handleFamilySaved = ({ familyName: name, avatarUrl: avatar }) => {
  familyName.value = name
  familyAvatar.value = avatar
}

// 家庭成员功能
const showJoinModal = ref(false)

const handleJoined = async ({ code, role }) => {
  familyCode.value = code
  familyRole.value = role
  await loadFamily()
  if (familyMembersRef.value) {
    await familyMembersRef.value.loadFamilyMembers()
  }
}

// 家庭信息
const loadFamily = async () => {
  if (!familyCode.value) return
  const family = await familyApi.getFamily(familyCode.value)
  if (family && family.data) {
    familyName.value = family.data.familyName
    familyAvatar.value = family.data.avatarUrl || uni.getStorageSync('family_avatar') || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'
    if (family.data.hasSecurityQuestion || family.data.has_security) {
      uni.setStorageSync('has_set_security_' + familyCode.value, true)
    }
  }
  updateReminders()
  checkSecurityGuide()
}

// 家庭成员


// 自动问候语
const hour = new Date().getHours()
let greetingStr = '晚上好，准备明天的食材吧'
if (hour < 9) greetingStr = '早上好，记得吃一顿丰盛的早餐哦'
else if (hour < 12) greetingStr = '上午好，今天也要好好吃饭呀'
else if (hour < 14) greetingStr = '中午好，午餐吃得开心吗'
else if (hour < 19) greetingStr = '下午好，构思一下今晚的大餐吧'
const greeting = ref(greetingStr)

// 主题系统
const themes = [
  { name: '温柔粉', color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
  { name: '清新绿', color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
  { name: '雾霾蓝', color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
  { name: '暖杏黄', color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
]
const currentTheme = ref(uni.getStorageSync('current_theme') || 0)
const switchTheme = (idx) => {
  currentTheme.value = idx
  uni.setStorageSync('current_theme', idx)
  uni.setTabBarStyle({ selectedColor: themes[idx].color })
}
const themeStyle = computed(() => {
  const t = themes[currentTheme.value]
  return `
    --primary: ${t.color};
    --primary-grad: ${t.gradient};
    --primary-light: ${t.light};
    --primary-shadow: ${t.shadow};
  `
})


let lastUpdateDate = ''
onShow(() => {
  uni.hideTabBar({ animation: false })
  const code = uni.getStorageSync('family_code')
  if (!code) {
    uni.reLaunch({
      url: '/pages/welcome/welcome'
    })
    return // 熔断后续数据拉取，保障空 family_code 时的极端稳定性
  }
  
  familyCode.value = code
  
  // refreshStats()
  if (mealsPlanRef.value) {
    mealsPlanRef.value.loadMeals()
  }
  const today = new Date().toDateString()
  if (lastUpdateDate !== today) {
    initDateWeather()
    lastUpdateDate = today
  }
  loadFamily()
  if (familyMembersRef.value) {
    familyMembersRef.value.loadFamilyMembers()
  }
  if (healthCardRef.value) {
    healthCardRef.value.loadHealthSummary()
  }
  if (memoCardRef.value) {
    memoCardRef.value.loadMemoPreview()
  }
  if (dietPreferencesRef.value) {
    dietPreferencesRef.value.loadDietPreferences()
  }
  if (spendingTrendRef.value) {
    spendingTrendRef.value.loadSpendingTrends()
  }
  updateReminders()
})

// 天气与定位逻辑
const getLocation = () => {
  return new Promise((resolve) => {
    uni.getLocation({
      type: 'wgs84',
      success: (res) => {
        resolve(`${res.longitude.toFixed(2)},${res.latitude.toFixed(2)}`)
      },
      fail: (err) => {
        console.warn('定位失败，使用默认城市', err)
        resolve('116.40,39.90') // 默认北京
      }
    })
  })
}

const getWeather = async () => {
  try {
    const location = await getLocation()
    weatherLocation.value = location
    const res = await request('/weather/now', 'GET', { location })
    if (res && res.now) {
      dateInfo.value.weather = res.now.text
      dateInfo.value.temp = res.now.temp + '°C'
      dateInfo.value.weatherIcon = res.now.icon || '100'
    }
  } catch (e) {
    console.error('获取天气失败', e)
    dateInfo.value.weather = '获取失败'
  }
}

const isRefreshingWeather = ref(false)
const refreshWeatherAndLocation = async () => {
  if (isRefreshingWeather.value) return
  isRefreshingWeather.value = true
  try {
    const info = uni.getStorageInfoSync()
    info.keys.forEach(key => {
      if (key.startsWith('weather_cache_') || key.startsWith('tencent_city_')) {
        uni.removeStorageSync(key)
      }
    })
    dateInfo.value.weather = '刷新中...'
    dateInfo.value.temp = '--'
    await getWeather()
    // uni.showToast({ title: '天气已更新', icon: 'success' })
  } catch (e) {
    // uni.showToast({ title: '刷新失败', icon: 'none' })
  } finally {
    isRefreshingWeather.value = false
  }
}

const initDateWeather = () => {
  const d = new Date()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const w = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  dateInfo.value.gregorian = `${m}月${day}日 周${w}`
  
  try {
    const formatter = new Intl.DateTimeFormat('zh-u-ca-chinese', { month: 'short', day: 'numeric' })
    let lStr = formatter.format(d)
    dateInfo.value.lunar = lStr.replace(/20\d\d年/, '')
  } catch(e) {
    dateInfo.value.lunar = '农历今日'
  }
  
  getWeather()
}

// 智能提醒
const reminders = ref([])

const updateReminders = () => {
  const list = [
    { type: 'warning', icon: '⚠️', text: '库存预警：鸡蛋仅剩 2 个', action: '加购' },
    { type: 'danger', icon: '⏳', text: '过期提醒：鲜牛奶还有 2 天过期', action: '处理' },
    { type: 'info', icon: '💡', text: '今日推荐：根据天气为您推荐「冬瓜排骨汤」', action: '查看' }
  ]
  
  if (familyRole.value === 'owner' && familyCode.value && familyCode.value !== 'default_family') {
    const hasSetSecurity = uni.getStorageSync('has_set_security_' + familyCode.value)
    if (!hasSetSecurity) {
      list.unshift({
        type: 'danger',
        icon: '🛡️',
        text: '安全提醒：当前家庭尚未设置数据找回密保，请尽快配置！',
        action: '去设置'
      })
    }
  }
  
  reminders.value = list
}

// 日期与天气数据
const dateInfo = ref({
  gregorian: '',
  lunar: '',
  weather: '加载中...',
  temp: '--',
  weatherIcon: ''
})

// 快捷功能

// 监听家庭成员自治组件的状态变化以进行相应业务联动
const handleFamilyMembersChanged = ({ role }) => {
  familyRole.value = role
}





const handleClearCache = () => {
  // 第一次警告
  uni.showModal({
    title: '⚠️ 清除所有数据',
    content: '确定要清除所有缓存吗？\n\n此操作不可恢复！\n\n将清除当前家庭数据，包括：\n1.食材\n2.购物车\n3.花费\n4.菜谱\n5.备忘录\n6.主题设置等',
    confirmText: '确认清除',
    confirmColor: '#FF4444', // 红色警告
    success: (res) => {
      if (res.confirm) {
        // 第二次二次确认
        uni.showModal({
          title: '最终确认',
          content: '确定要清空所有数据吗？\n\n此操作不可恢复！\n\n请确保已经保存家庭编码并设置密保问题！',
          confirmText: '确定清空',
          confirmColor: '#FF0000',
          success: (res2) => {
            if (res2.confirm) {
              // 执行清除
              uni.clearStorageSync();
              uni.showToast({
                title: '已清空所有数据',
                icon: 'success'
              });
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/welcome/welcome'
                });
              }, 1500);
            }
          }
        })
      }
    }
  })
}

const handleReminderAction = (r) => {
  if (r.icon === '🛡️' || r.action === '去设置') {
    openSetSecurityModal()
  } else {
    if (r.action === '加购') {
      uni.switchTab({ url: '/pages/shop/shop' })
    } else if (r.action === '查看' || r.action === '处理') {
      uni.switchTab({ url: '/pages/recipe/recipe' })
    }
  }
}

const handleSecuritySaved = () => {
  if (familyCode.value) {
    uni.setStorageSync('has_set_security_' + familyCode.value, true)
    updateReminders()
  }
  loadFamily()
}

// 密保强引导逻辑
const showSecurityGuideModal = ref(false)

const checkSecurityGuide = () => {
  if (familyRole.value === 'owner' && familyCode.value && familyCode.value !== 'default_family') {
    const hasSetSecurity = uni.getStorageSync('has_set_security_' + familyCode.value)
    if (!hasSetSecurity) {
      const laterTime = uni.getStorageSync('security_remind_later_' + familyCode.value)
      const oneDay = 24 * 60 * 60 * 1000
      if (!laterTime || (Date.now() - Number(laterTime) > oneDay)) {
        showSecurityGuideModal.value = true
      }
    }
  }
}

const closeSecurityGuide = (remindLater = false) => {
  showSecurityGuideModal.value = false
  if (remindLater && familyCode.value) {
    uni.setStorageSync('security_remind_later_' + familyCode.value, Date.now())
  }
}

const goSetSecurity = () => {
  showSecurityGuideModal.value = false
  openSetSecurityModal()
}

const goToMemo = () => {
  uni.navigateTo({ url: '/pages/family/component/singlePage/memo' })
}

const goToHealth = () => {
  console.log('Attempting to navigate to health page...')
  uni.navigateTo({ 
    url: '/pages/family/component/singlePage/health',
    success: () => console.log('Navigation success'),
    fail: (err) => {
      console.error('Navigation to health page failed:', err)
      uni.showToast({ title: '页面跳转失败: ' + (err.errMsg || ''), icon: 'none' })
    }
  })
}

const openWeatherDetail = () => {
  if (!weatherLocation.value) {
    uni.showToast({ title: '正在获取定位...', icon: 'none' })
    getWeather()
    return
  }
  showWeatherPopup.value = true
}
const concatenatedReminders = computed(() => {
  // return reminders.value.map(r => `${r.icon} ${r.text} [${r.action}]`).join(' 　　 ')
  return reminders.value.map(r => `${r.icon} ${r.text}`).join(' 　　 ')
})

</script>

<style lang="less" scoped>
.page-container {
  background-color: #F6F7F9;
  min-height: ~"calc(100vh - 240rpx)";
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 密保强引导弹窗 */
.security-guide-modal {
  width: 580rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: modalScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  .shield-badge {
    font-size: 80rpx;
    margin-bottom: 24rpx;
    animation: pulse 2s infinite;
  }
  
  .guide-title {
    font-size: 34rpx;
    font-weight: 800;
    color: #2D3748;
    margin-bottom: 20rpx;
  }
  
  .guide-desc {
    font-size: 26rpx;
    color: #718096;
    line-height: 1.6;
    margin-bottom: 40rpx;
  }
  
  .guide-btns {
    display: flex;
    gap: 20rpx;
    width: 100%;
    
    button {
      flex: 1;
      height: 84rpx;
      line-height: 84rpx;
      font-size: 26rpx;
      font-weight: bold;
      border-radius: 42rpx;
      margin: 0;
      &::after { border: none; }
    }
    
    .g-btn-later {
      background: #EDF2F7;
      color: #718096;
    }
    
    .g-btn-go {
      background: var(--primary-grad);
      color: #fff;
      box-shadow: 0 8rpx 20rpx var(--primary-shadow);
    }
  }
}

@keyframes modalScaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* 1. 顶部大卡片 */
.top-card {
  min-height: 360rpx;
  box-sizing: border-box;
  background: var(--primary-grad);
  border-radius: 0 0 60rpx 60rpx;
  padding: 100rpx 40rpx 60rpx;
  box-shadow: 0 16rpx 40rpx var(--primary-shadow);
  color: #fff;
  position: relative;
  // z-index: 20;
  transition: background 0.5s ease;
  
  .top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 40rpx;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 24rpx;
    
    .avatar {
      width: 110rpx;
      height: 110rpx;
      border-radius: 50%;
      border: 6rpx solid rgba(255,255,255,0.4);
      background: #fff;
    }
    
    .name-box {
      display: flex;
      flex-direction: column;
      
      .family-name-wrap {
        display: flex;
        align-items: center;
        gap: 16rpx;
        margin-bottom: 8rpx;
        
        .family-name {
          font-size: 38rpx;
          font-weight: 900;
          color: #fff;
          text-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
        }
        
        .edit-icon-btn {
          width: 44rpx;
          height: 44rpx;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(10px);
          transition: transform 0.2s;
          &:active { transform: scale(0.9); }
          
          .e-icon {
            font-size: 22rpx;
            color: #fff;
          }
        }
      }
      
      .greeting {
        font-size: 24rpx;
        color: rgba(255,255,255,0.9);
      }
    }
  }

  .refresh-weather-btn {
    width: 70rpx;
    height: 70rpx;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    margin-right: 60rpx;
    
    &:active {
      transform: scale(0.9);
      background: rgba(255,255,255,0.3);
    }
    
    .r-icon {
      font-size: 32rpx;
      color: #fff;
      display: inline-block;
    }
    
    &.is-refreshing .r-icon {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.weather-icon {
  width: 32rpx;
  height: 32rpx;
  filter: brightness(0) invert(1);
}

/* 日期与天气磨砂胶囊 */
.glass-capsule-row {
  display: flex;
  gap: 20rpx;
  margin:18rpx 0 40rpx;
  flex-wrap: wrap;
}
.glass-capsule {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 12rpx 28rpx;
  border-radius: 100rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
  gap: 12rpx;
  pointer-events: auto;
  position: relative;
  
  &:active {
    transform: scale(0.96);
    opacity: 0.8;
  }
  
  .c-text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 500;
  }
  
  [class^="qi-"] {
    font-size: 32rpx;
    color: #fff;
    margin-right: 4rpx;
  }
  
  .c-divider {
    width: 2rpx;
    height: 20rpx;
    background: rgba(255, 255, 255, 0.5);
    margin: 0 8rpx;
  }
  .c-icon {
    font-size: 28rpx;
  }
  .compass-icon {
    width: 32rpx;
    height: 32rpx;
    display: block;
  }
}

  /* 跑马灯提醒胶囊 (全新冰川蓝风格) */
  .marquee-reminder-row {
    width: 80%;
    margin-bottom: 50rpx;
    animation: fade-in 1s ease;
  }

  .marquee-capsule {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 14rpx 28rpx;
    background: rgba(255, 255, 255, 0.15); // 冰川蓝磨砂感
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border-radius: 100rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    // height: 52rpx;
    overflow: hidden;

    .m-icon {
      font-size: 26rpx;
      z-index: 2;
    }

    .m-content-wrap {
      flex: 1;
      height: 100%;
      overflow: hidden;
      position: relative;
    }

    .m-scroll-box {
      display: flex;
      white-space: nowrap;
      width: fit-content;
      animation: marquee-anim 40s linear infinite;
    }

    .m-scroll-text {
      font-size: 22rpx;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
      padding-right: 40rpx;
      letter-spacing: 1rpx;
    }
  }


@keyframes marquee-anim {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
.main-content {
  margin-top: -60rpx;
  position: relative;
  padding: 0 30rpx;
  padding-bottom: 40rpx;
}

/* 通用模块样式 */
.section {
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.02);
}


.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  
  .title-text {
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
  
  .action-text {
    font-size: 24rpx;
    color: var(--primary);
    font-weight: bold;
    background: var(--primary-light);
    padding: 8rpx 20rpx;
    border-radius: 100rpx;
    transition: all 0.5s ease;
  }
}


.section-title .with-bar {
  position: relative;
  padding-left: 28rpx !important;
  
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 32rpx;
    background: #6190E8; 
    border-radius: 4rpx;
  }
}

.fancy-meal-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}




/* 4. 家庭成员 */
.members-section {
  .section-title {
    .title-actions {
      display: flex;
      gap: 20rpx;
    }
    .action-text.secondary {
      background: #F0F2F5;
      color: #7F8C8D;
    }
  }

}


.subtle-link {
  background: rgba(0,0,0,0.04);
  padding: 8rpx 20rpx;
  border-radius: 50rpx;
  color: #7F8C8D;
  font-weight: 500;
}


/* 11. 底部设置模块 */
.bottom-settings {
  margin-top: 40rpx;
  
  .set-list {
    background: #fff;
    border-radius: 40rpx;
    padding: 10rpx 40rpx;
    box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.02);
  }
  
  .set-item {
    display: flex;
    align-items: center;
    padding: 36rpx 0;
    border-bottom: 2rpx solid #F0F2F5;
    
    &:last-child { border-bottom: none; }
    
    .set-icon {
      font-size: 32rpx;
      margin-right: 20rpx;
    }
    
    .set-text {
      flex: 1;
      font-size: 28rpx;
      color: #2C3E50;
      font-weight: 500;
    }
    
    .set-arrow {
      color: #BDC3C7;
      font-size: 28rpx;
      font-weight: bold;
    }
    
    .set-desc {
      color: #95A5A6;
      font-size: 26rpx;
    }
    
    &.version {
      .set-text { color: #7F8C8D; }
    }
  }
  
  .brand-info {
    text-align: center;
    padding: 60rpx 0 40rpx;
    
    text {
      font-size: 22rpx;
      color: #BDC3C7;
      letter-spacing: 2rpx;
    }
  }
}

.footer-safe {
  height: 180rpx;
}

</style>
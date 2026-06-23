<template>
  <view class="page-container" :style="themeStyle" @click="dietPreferencesRef?.cancelEdit()">
    <gourmet-refresher :refreshing="refreshing" type="family" :theme="currentTheme" />
    <!-- 1. 顶部大卡片 -->
    <view class="top-card">
      <!-- 智能提醒跑马灯 (移至最顶部) -->
      <view class="marquee-reminder-row" v-if="reminders.length > 0" @click="showReminderModal = true">
        <view class="marquee-capsule">
          <view class="white-icon icon-alarm" style="width: 40rpx; height: 40rpx; flex-shrink: 0; margin-right: 12rpx;" />
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
                <view class="white-icon icon-edit" style="width: 28rpx; height: 28rpx; display: block;" />
              </view>
              <!-- 如果加入了多个家庭，允许切换家庭 -->
              <view class="edit-icon-btn" @click="switchToAnotherFamily">
                <view class="white-icon icon-switch" style="width: 36rpx; height: 36rpx; display: block;" />
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
          <view class="action-text" style="display: inline-flex; align-items: center;">查看
            <view class="theme-icon-more" style="margin-left: 6rpx;" />
          </view>
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
            <view class="action-text subtle-link" @click="goToDietDiary">
              <view class="theme-icon icon-history" style="width: 32rpx; height: 32rpx; margin-right: 8rpx;" /> 饮食手账</view>
            <view class="action-text subtle-link" @click="mealsPlanRef?.copyMealsToTomorrow()">
              <view class="theme-icon icon-calendar" style="width: 32rpx; height: 32rpx; margin-right: 8rpx;" /> 复制到明天</view>
          </view>
        </view>
        <meals-plan
          ref="mealsPlanRef"
          :family-code="familyCode"
        />
      </view>



      <!-- 5. 快捷功能宫格 -->
      <!-- <view class="section quick-section">
        <view class="section-title"><text class="title-text">快捷功能</text></view>
        <quick-features
          :family-code="familyCode"
        />
      </view> -->

      <!-- 6. 饮食偏好设置 -->
      <view class="section prefs-section">
        <view class="section-title"><text class="title-text">饮食偏好</text></view>
        <diet-preferences
          ref="dietPreferencesRef"
          :family-code="familyCode"
        />
      </view>

      <!-- 7. 消费趋势卡片 -->
      <!-- <view class="section trend-section">
        <view class="section-title"><text class="title-text">近7日开销</text></view>
        <spending-trend
          ref="spendingTrendRef"
          :family-code="familyCode"
        />
      </view> -->

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
            <view class="theme-icon icon-key" style="margin-right: 20rpx;" />
            <text class="set-text">家庭编码</text>
            <text class="set-desc" style="margin-right:16rpx; color: #999;">查看并复制</text>
            <view class="set-arrow" style="display: flex; align-items: center;">
              <view class="theme-icon icon-more" style="width: 24rpx; height: 24rpx; background-color: #BDC3C7 !important;" />
            </view>
          </view>
          <view class="set-item" @click="openSetSecurityModal" v-if="familyCode && familyRole === 'owner'">
            <view class="theme-icon icon-lock" style="margin-right: 20rpx;" />
            <text class="set-text">数据找回密保设置</text>
            <text class="set-desc" style="margin-right:16rpx; color: #999;">保障历史数据</text>
            <view class="set-arrow" style="display: flex; align-items: center;">
              <view class="theme-icon icon-more" style="width: 24rpx; height: 24rpx; background-color: #BDC3C7 !important;" />
            </view>
          </view>
          <view class="set-item" @click="handleClearCache" v-if="familyCode && familyRole === 'owner'">
            <view class="theme-icon icon-garbage" style="margin-right: 20rpx;" />
            <text class="set-text">清除缓存</text>
            <view class="set-arrow" style="display: flex; align-items: center;">
              <view class="theme-icon icon-more" style="width: 24rpx; height: 24rpx; background-color: #BDC3C7 !important;" />
            </view>
          </view>
          <view class="set-item" @click="showHelpPopup = true">
            <view class="theme-icon icon-question" style="margin-right: 20rpx;" />
            <text class="set-text">使用帮助</text>
            <view class="set-arrow" style="display: flex; align-items: center;">
              <view class="theme-icon icon-more" style="width: 24rpx; height: 24rpx; background-color: #BDC3C7 !important;" />
            </view>
          </view>
          <view class="set-item" @click="showFeedbackPopup = true">
            <view class="theme-icon icon-chat" style="margin-right: 20rpx;" />
            <text class="set-text">意见反馈</text>
            <view class="set-arrow" style="display: flex; align-items: center;">
              <view class="theme-icon icon-more" style="width: 24rpx; height: 24rpx; background-color: #BDC3C7 !important;" />
            </view>
          </view>
          <view class="set-item" @click="showAdminFeedbackPopup = true" v-if="isAdmin">
            <view class="theme-icon icon-mailbox" style="margin-right: 20rpx;" />
            <text class="set-text">馆长收信箱</text>
            <view class="set-arrow" style="display: flex; align-items: center;">
              <view class="theme-icon icon-more" style="width: 24rpx; height: 24rpx; background-color: #BDC3C7 !important;" />
            </view>
          </view>
          <view class="set-item version">
            <view class="theme-icon icon-gem" style="margin-right: 20rpx;" />
            <text class="set-text">当前版本</text>
            <text class="set-desc">v1.3.0</text>
          </view>
        </view>
        <view class="brand-info">
          <text @click="handleVersionClick">家庭小厨房 • 用心记录每一餐</text>
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
        <view class="shield-badge">
          <view class="theme-icon icon-lock" style="margin-right: 20rpx;" />
        </view>
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

    <!-- 使用帮助/指南弹窗 -->
    <help-popup
      :show="showHelpPopup"
      @close="showHelpPopup = false"
    />

    <!-- 时光邮局意见反馈弹窗 -->
    <feedback-popup
      :show="showFeedbackPopup"
      @close="showFeedbackPopup = false"
    />

    <!-- 管理员专属：馆长收信箱弹窗 -->
    <admin-feedback-popup
      :show="showAdminFeedbackPopup"
      @close="handleCloseAdminFeedback"
    />

    <!-- 悬浮和纸胶带备忘便签 -->
    <movable-area class="memo-movable-area">
      <movable-view 
        class="floating-memo-tag" 
        direction="all" 
        :out-of-bounds="false"
        :x="memoX"
        :y="memoY"
        @change="onMemoYChange"
      >
        <view 
          class="floating-memo-tag-inner" 
          :class="{ collapsed: isMemoCollapsed }"
          @click="goToMemo"
        >
          <!-- 折叠开关图标：展开时显示 ›，收起时显示 ‹ -->
          <view class="tape-btn" @click.stop="toggleMemoCollapse">
            <text class="arrow-txt">{{ isMemoCollapsed ? '‹' : '›' }}</text>
          </view>
          
          <!-- 仅在未折叠时显示备忘内容 -->
          <view class="memo-content" v-if="!isMemoCollapsed">
            <view class="memo-icon">
              <view class="theme-icon icon-memo" />
            </view>
            <text class="memo-tag-text">备忘</text>
          </view>
        </view>
      </movable-view>
    </movable-area>

    <custom-tabbar />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import familyApi from '@/common/api/family.js'
import stockApi from '@/common/api/stock.js'
import weatherPopup from '@/components/weather-popup/weather-popup.vue' // 天气预警弹窗
import calendarPopup from '@/components/calendar-popup/calendar-popup.vue' // 万年历弹窗
import compassPopup from '@/components/compass-popup/compass-popup.vue' // 指南针弹窗
import mealsPlan from './component/content/meals-plan.vue' // 一体化自治三餐组件
import familyMembers from './component/content/family-members.vue' // 家庭成员自治组件
import healthCard from './component/content/health-card.vue' // 家庭健康简报卡片自治组件
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
import helpPopup from './component/alert/help-popup.vue' // 使用帮助指南弹窗
import feedbackPopup from './component/alert/feedback-popup.vue' // 时光邮局反馈弹窗
import adminFeedbackPopup from './component/alert/admin-feedback-popup.vue' // 管理员收信箱弹窗

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
const dietPreferencesRef = ref(null)
const spendingTrendRef = ref(null)

// --- 数据找回与密保双重验证系统 ---
const showFamilyCodeModal = ref(false)
const showSecuritySettingModal = ref(false)
const showHelpPopup = ref(false)
const showFeedbackPopup = ref(false)
const showAdminFeedbackPopup = ref(false)

const isAdmin = ref(false)
const versionClickCount = ref(0)
let versionClickTimer = null

const handleVersionClick = () => {
  versionClickCount.value++
  if (versionClickCount.value === 1) {
    versionClickTimer = setTimeout(() => {
      versionClickCount.value = 0
    }, 3000)
  }
  if (versionClickCount.value >= 5) {
    clearTimeout(versionClickTimer)
    versionClickCount.value = 0
    uni.showModal({
      title: '馆长身份认证',
      placeholderText: '请输入馆长专属暗号',
      editable: true,
      success: (res) => {
        if (res.confirm) {
          const code = res.content.trim()
          if (code === '馆长驾到' || code === 'eat-eat-admin') {
            isAdmin.value = true
            uni.showToast({ title: '馆长身份已激活！', icon: 'success' })
          } else {
            uni.showToast({ title: '暗号错误，认证失败', icon: 'none' })
          }
        }
      }
    })
  }
}

const handleCloseAdminFeedback = () => {
  showAdminFeedbackPopup.value = false
  isAdmin.value = false
  uni.showToast({ title: '馆长身份已注销', icon: 'none' })
}

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
const familyName = ref(uni.getStorageSync('family_name'))
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
  familyName.value = uni.getStorageSync('family_name') || ''
  familyAvatar.value = uni.getStorageSync('family_avatar') || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'
  await loadFamily()
  if (familyMembersRef.value) {
    await familyMembersRef.value.loadFamilyMembers()
  }
}

// 家庭信息
const loadFamily = async () => {
  if (!familyCode.value) return
  try {
    const family = await familyApi.getFamily(familyCode.value)
    if (family && family.data) {
      const famInfo = family.data.family || family.data
      if (famInfo && famInfo.familyName) {
        familyName.value = famInfo.familyName
        uni.setStorageSync('family_name', famInfo.familyName)
      }
      const avatar = famInfo.avatarUrl || famInfo.avatar
      if (avatar) {
        familyAvatar.value = avatar
        uni.setStorageSync('family_avatar', avatar)
      }
      if (family.data.hasSecurityQuestion || family.data.has_security || (famInfo && (famInfo.hasSecurityQuestion || famInfo.has_security))) {
        uni.setStorageSync('has_set_security_' + familyCode.value, true)
      }
    }
  } catch (e) {
    console.error('loadFamily error:', e)
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
  familyName.value = uni.getStorageSync('family_name') || ''
  familyAvatar.value = uni.getStorageSync('family_avatar') || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'
  familyRole.value = uni.getStorageSync('family_role') || 'owner'
  
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

// 智能提醒 (纯前端真实计算与分析)
const reminders = ref([])

const updateReminders = async () => {
  const list = []

  // 1. 安全提醒：如果用户是 Owner 并且没有配置密保
  if (familyRole.value === 'owner' && familyCode.value && familyCode.value !== 'default_family') {
    const hasSetSecurity = uni.getStorageSync('has_set_security_' + familyCode.value)
    if (!hasSetSecurity) {
      list.push({
        type: 'danger',
        icon: '🛡️',
        text: '安全提醒：当前家庭尚未设置数据找回密保，请尽快配置！',
        action: '去设置'
      })
    }
  }

  // 2. 食材分析：通过接口拉取食材，计算已过期、临期与库存偏低食材
  if (familyCode.value) {
    try {
      const res = await stockApi.getFamilyIngredientItems(familyCode.value, '')
      const items = res?.data?.items || []
      
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      
      const expiredItems = []
      const nearExpiredItems = []
      const shortageItems = []
      
      items.forEach(item => {
        // 过期/临期判断
        if (item.expire_date) {
          const target = new Date(item.expire_date)
          target.setHours(0, 0, 0, 0)
          const diffTime = target.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays < 0) {
            expiredItems.push(item)
          } else if (diffDays <= 3) {
            nearExpiredItems.push(item)
          }
        }
        
        // 库存偏低判断 (比如 num <= 2)
        if (item.num !== undefined && item.num !== null) {
          const numVal = parseFloat(item.num)
          if (!isNaN(numVal) && numVal <= 2 && numVal >= 0) {
            shortageItems.push(item)
          } else {
            const numStr = String(item.num).trim()
            if (numStr && ['0', '1', '2', '少', '无', '空', '缺'].some(flag => numStr.includes(flag))) {
              shortageItems.push(item)
            }
          }
        }
      })
      
      // 过期提醒：高优
      if (expiredItems.length > 0) {
        const names = expiredItems.slice(0, 2).map(i => i.name).join('、')
        const suffix = expiredItems.length > 2 ? '等' : ''
        list.push({
          type: 'danger',
          icon: '⏳',
          text: `过期提醒：您有 ${expiredItems.length} 个食材已过期 (${names}${suffix})，建议及时清理。`,
          action: '去清理'
        })
      }
      
      // 临期提醒
      if (nearExpiredItems.length > 0) {
        const names = nearExpiredItems.slice(0, 2).map(i => i.name).join('、')
        const suffix = nearExpiredItems.length > 2 ? '等' : ''
        list.push({
          type: 'warning',
          icon: '⚠️',
          text: `临期预警：您的 ${names}${suffix} 食材即将过期，建议尽快做出美味哦。`,
          action: '去整理'
        })
      }
      
      // 缺料/库存偏低提醒
      if (shortageItems.length > 0) {
        const names = shortageItems.slice(0, 2).map(i => i.name).join('、')
        const suffix = shortageItems.length > 2 ? '等' : ''
        list.push({
          type: 'warning',
          icon: '🛒',
          text: `缺料预警：您的 ${names}${suffix} 食材库存偏低，建议提前采购补充。`,
          action: '去采购'
        })
      }
      
    } catch (e) {
      console.error('智能管家分析食材库存失败:', e)
    }
  }

  // 3. 基于天气的智能饮食推荐
  const weatherText = dateInfo.value.weather || ''
  const tempVal = parseFloat(dateInfo.value.temp)
  
  if (weatherText.includes('雨') || weatherText.includes('雪') || (!isNaN(tempVal) && tempVal < 15)) {
    list.push({
      type: 'info',
      icon: '🍲',
      text: '智能推荐：今日气温较低或有雨雪，管家建议煲一碗热气腾腾的「冬瓜排骨汤」暖胃～',
      action: '去看看'
    })
  } else if (weatherText.includes('晴') && !isNaN(tempVal) && tempVal > 30) {
    list.push({
      type: 'info',
      icon: '🍧',
      text: '智能推荐：今日天气炎热，建议吃一碗解暑的「绿豆百合甜汤」消暑降火～',
      action: '去看看'
    })
  } else {
    list.push({
      type: 'info',
      icon: '💡',
      text: '智能推荐：今日天气宜人，管家推荐做家常招牌菜「西红柿炒鸡蛋」，快去看看吧！',
      action: '去看看'
    })
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
  // 如果还有成员，不能清除缓存，需要解散家庭
  if(family.value.memberList.length > 0) {
    uni.showModal({
      title: '⚠️ 成员存在',
      content: '当前家庭还有成员，不能清除缓存。\n\n请先解散家庭，再重新创建。',
      confirmText: '知道了',
      confirmColor: '#FF4444',
    })
    return
  }
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
    if (r.action === '去采购' || r.action === '加购') {
      uni.switchTab({ url: '/pages/shop/shop' })
    } else if (r.action === '去清理' || r.action === '去整理' || r.action === '处理') {
      uni.switchTab({ url: '/pages/stock/stock' })
    } else if (r.action === '去看看' || r.action === '查看') {
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

const isMemoCollapsed = ref(uni.getStorageSync('memo_collapsed') || false)

let windowWidth = 375
try {
  const sys = uni.getSystemInfoSync()
  windowWidth = sys.windowWidth
} catch (e) {}

const getPx = (rpx) => rpx * (windowWidth / 750)
const tagSizePx = getPx(90)
const expandedX = windowWidth - tagSizePx - getPx(24) // 展开时贴右边缘（留24rpx距离）
const collapsedX = windowWidth - getPx(56) // 折叠时滑出屏幕外，只在右边缘留出56rpx，使居中圆形图标恰好露在边缘内侧

const memoX = ref(isMemoCollapsed.value ? collapsedX : expandedX)
const memoY = ref(uni.getStorageSync('memo_y') !== '' ? Number(uni.getStorageSync('memo_y')) : getPx(780))

const onMemoYChange = (e) => {
  if (e.detail.source === 'touch') {
    uni.setStorageSync('memo_y', e.detail.y)
  }
}

const toggleMemoCollapse = () => {
  isMemoCollapsed.value = !isMemoCollapsed.value
  uni.setStorageSync('memo_collapsed', isMemoCollapsed.value)
  memoX.value = isMemoCollapsed.value ? collapsedX : expandedX
}

const goToMemo = () => {
  if (isMemoCollapsed.value) {
    toggleMemoCollapse()
  } else {
    uni.navigateTo({ url: '/pages/family/component/singlePage/memo' })
  }
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

/* 悬浮和纸胶带便签拖拽区域及样式 */
.memo-movable-area {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none; /* 穿透不影响底层点击 */
  z-index: 99;
}

.floating-memo-tag {
  pointer-events: auto; /* 恢复点击 */
  width: 90rpx;
  height: 90rpx;
  
  .floating-memo-tag-inner {
    width: 100%;
    height: 100%;
    background: var(--primary-light);
    opacity: 0.9;
    border: 2rpx solid var(--primary);
    border-radius: 16rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 8rpx 20rpx var(--primary-shadow);
    // transform: rotate(-3deg); /* 手账贴纸倾斜感 */
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    
    /* 顶部半透明折叠/展开开关小圆标 */
    .tape-btn {
      position: absolute;
      top: -36rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 32rpx;
      height: 32rpx;
      // background: var(--primary); /* 半透明粉色胶带色 */
      opacity: 0.85;
      border-radius: 50%;
      box-shadow: 0 2rpx 8rpx var(--primary-shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
      
      /* 扩大触控热区，方便一键折叠 */
      &::after {
        content: '';
        position: absolute;
        top: -15rpx;
        left: -15rpx;
        right: -15rpx;
        bottom: -15rpx;
      }
      
      .arrow-txt {
        font-size: 24rpx;
        color: var(--primary);
        font-weight: bold;
        line-height: 1;
        position: relative;
        top: -2rpx; /* 文字垂直微调 */
        left: 1rpx;
      }
      
      &:active {
        opacity: 0.95;
        transform: translateX(-50%) scale(0.9);
      }
    }
    
    &:active {
      transform: scale(0.95) rotate(0deg);
    }
    
    /* 折叠状态（只在屏幕边缘留存一个向左展开的半圆气泡图标 ‹） */
    &.collapsed {
      background: transparent;
      border-color: transparent;
      box-shadow: none;
      transform: rotate(0deg);
      
      .tape-btn {
        width: 60rpx;
        height: 60rpx;
        top: 15rpx; /* (90 - 60) / 2 = 15rpx，在90rpx高度中居中 */
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary); /* 折叠后显示主题色背景 */
        opacity: 0.9;
        box-shadow: 0 4rpx 12rpx var(--primary);
        animation: tapePulse 2.5s infinite ease-in-out;
        
        .arrow-txt {
          font-size: 38rpx;
          color: #fff; /* 折叠后箭头文字变为白色，与背景形成对比 */
          left: -2rpx; /* 折缩后‹的左侧对齐微调 */
          top: -2rpx;
        }
      }
      
      &:active {
        transform: none;
      }
    }
  }
  
  .memo-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  
  .memo-icon {
    font-size: 32rpx;
    line-height: 1;
    margin-bottom: 4rpx;
    margin-top: 4rpx;
  }
  
  .memo-tag-text {
    font-size: 20rpx;
    color: var(--primary);
    font-weight: 800;
    letter-spacing: 1rpx;
    line-height: 1.2;
  }
}

@keyframes tapePulse {
  0%, 100% { opacity: 0.85; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.6; transform: translateX(-50%) scale(0.9); }
}

@import "@/static/icon_base64.css";
</style>
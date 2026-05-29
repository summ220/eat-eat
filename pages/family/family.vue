<template>
  <view class="page-container" :style="themeStyle" @click="isEditingPrefs = isEditingTaste = false">
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
        <view class="refresh-weather-btn" :class="{ 'is-refreshing': isRefreshingWeather }" @click="refreshWeatherAndLocation">
          <text class="r-icon">🔄</text>
        </view>
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
          <image class="weather-icon" :src="`http://110.42.36.7:3000/weather-icons/${dateInfo.weatherIcon}.svg`" />
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
            <text class="action-text" @click="openInvite">邀请</text>
          </view>
        </view>
        <scroll-view scroll-x class="member-scroll" :show-scrollbar="false">
          <view class="member-list">
            <view class="member-card" v-for="(m, idx) in members" :key="idx" >
              <view class="avatar-wrap">
                <image class="m-avatar" :src="m.avatarUrl ? (m.avatarUrl.startsWith('http') ? m.avatarUrl : config.imgBaseUrl + m.avatarUrl) : config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbqsd7_0d13d785d123.jpg'" mode="aspectFill" @click.stop="previewImage(m.avatarUrl || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbqsd7_0d13d785d123.jpg')" />
                <view class="edit-tag" v-if="m.isSelf" @click="handleMemberClick(m)">✏️</view>
              </view>
              <text class="m-nick">{{ m.name || '干饭人' }}{{ m.isSelf ? ' (我)' : m.role === 'owner' ? ' (管理员)' : '' }}</text>
              <view class="m-role"><text>{{ m.title || '大主厨' }}</text></view>
            </view>
          </view>
        </scroll-view>
        <view class="family-ops" v-if="members.length > 1 && familyRole != 'owner'">
          <text class="exit-btn" @click="leaveFamily">退出当前家庭</text>
        </view>
        <view class="family-ops" v-if="familyRole === 'owner'">
          <text class="exit-btn" @click="disbandFamily">{{members.length > 1 ? '解散当前家庭' : '注销当前家庭'}}</text>
        </view>
      </view>

      <!-- 2. 家庭健康管理入口 -->
      <view class="section health-section" @click="goToHealth">
        <view class="section-title">
          <text class="title-text">家庭健康管理</text>
          <text class="action-text">查看 👉</text>
        </view>
        <view class="health-card-body">
          <view class="health-info-row">
            <view class="h-stat">
              <text class="h-val">22.4</text>
              <text class="h-label">平均BMI</text>
            </view>
            <view class="h-sep"></view>
            <view class="h-stat">
              <text class="h-val">健康</text>
              <text class="h-label">状态</text>
            </view>
            <view class="h-sep"></view>
            <view class="h-stat">
              <text class="h-val">85%</text>
              <text class="h-label">目标达成</text>
            </view>
          </view>
          <view class="health-tip-box">
            <text class="h-tip-icon">🍏</text>
            <text class="h-tip-text">全家近一周饮食结构均衡，建议继续保持。</text>
          </view>
        </view>
      </view>


      <!-- 3. 今日三餐 -->
      <view class="section meals-section">
        <view class="section-title with-bar">
          <text class="title-text">今日三餐</text>
          <text class="action-text subtle-link" @click="copyMealsToTomorrow">📅 复制到明天</text>
        </view>
        <view class="fancy-meal-list">
          <view class="meal-simple-card" v-for="(m, i) in meals" :key="i" @click="openMealSelector(m)">
            <view class="sc-left-icon">
               <text>{{ m.icon }}</text>
            </view>
            <view class="sc-mid-info">
               <text class="sc-title">{{ m.name }}</text>
               <text class="sc-sub" v-if="m.recipes && m.recipes.length > 0">{{ m.recipes.join(' · ') }}</text>
               <text class="sc-sub empty" v-else>尚未安排</text>
            </view>
            <view class="sc-right-btn" @click.stop="(!m.recipes || m.recipes.length === 0) ? openMealSelector(m) : handleMakeMeal(m)">
               <block v-if="!m.recipes || m.recipes.length === 0">
                  <view class="sc-circle-add">+</view>
               </block>
               <block v-else>
                  <view class="sc-pill-go" :class="{ 'is-done': m.done }">
                     <text>{{ m.done ? '已完成' : '去制作' }}</text>
                  </view>
               </block>
            </view>
          </view>
        </view>
      </view>

      <!-- 4. 家庭备忘录入口 -->
      <view class="section memo-section" @click="goToMemo">
        <view class="section-title">
          <text class="title-text">家庭备忘录</text>
          <text class="action-text">查看 👉</text>
        </view>
        <view class="memo-preview">
          <text class="memo-desc">记录家庭琐事、重要日子或购物心愿单...</text>
        </view>
      </view>

      <!-- 5. 快捷功能宫格 -->
      <view class="section quick-section">
        <view class="quick-grid">
          <view class="quick-item" v-for="(q, i) in quickFuncs" :key="i" @click="handleSetting(q.name)">
            <view class="q-icon-wrap"><text class="q-icon">{{ q.icon }}</text></view>
            <text class="q-text">{{ q.name }}</text>
          </view>
        </view>
      </view>

      <!-- 6. 饮食偏好设置 -->
      <view class="section prefs-section">
        <view class="section-title"><text class="title-text">饮食偏好</text></view>
        <view class="pref-group">
          <text class="p-label">全家口味 (长按管理)</text>
          <view class="p-options">
            <view class="p-tag" :class="{ active: true, editing: isEditingTaste }" v-for="t in tasteOptions" :key="t.id" 
              @click.stop="selectTaste(t)"
              @longpress.stop="isEditingTaste = !isEditingTaste"
            >
              <text>{{ t.title }}</text>
              <view class="p-del" v-if="isEditingTaste" @click.stop="removeTaste(t)">×</view>
            </view>
            <view class="p-tag add-btn" @click.stop="openAddTasteModal">
              <text class="plus">+</text>
            </view>
          </view>
        </view>
        <view class="pref-group">
          <text class="p-label">忌口不吃 (长按管理)</text>
          <view class="p-options">
            <view class="p-tag" :class="{ active: true, editing: isEditingPrefs }" v-for="a in avoidOptions" :key="a.id" @click.stop="toggleAvoid(a)"
              @longpress.stop="isEditingPrefs = !isEditingPrefs"
            >
              <text>{{ a.title }}</text>
              <view class="p-del" v-if="isEditingPrefs" @click.stop="removeAvoid(a)">×</view>
            </view>
            <!-- 添加按钮 -->
            <view class="p-tag add-btn" @click.stop="openAddAvoidModal">
              <text class="plus">+</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 添加口味弹窗 -->
      <add-taste-popup
        :show="showAddTasteModal"
        :family-code="familyCode"
        :taste-options="tasteOptions"
        @close="showAddTasteModal = false"
        @saved="loadDietPreferences"
      />

      <!-- 添加忌口弹窗 -->
      <add-avoid-popup
        :show="showAddAvoidModal"
        :family-code="familyCode"
        :avoid-options="avoidOptions"
        @close="showAddAvoidModal = false"
        @saved="loadDietPreferences"
      />

      <!-- 7. 消费趋势卡片 -->
      <view class="section trend-section">
        <view class="section-title"><text class="title-text">近7日开销</text></view>
        <view class="chart-box">
          <view class="chart-bars">
            <view class="bar-col" v-for="(val, day) in trends" :key="day">
              <view class="bar-track">
                <view class="bar-fill" :style="{ height: (val / 200 * 100) + '%' }">
                  <text class="bar-val" v-if="val > 0">{{ val }}</text>
                </view>
              </view>
              <text class="bar-label">{{ day }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 8. 主题切换 -->
      <view class="section theme-section">
        <view class="section-title">
          <text class="title-text">个性主题</text>
        </view>
        <view class="theme-list">
          <view 
            class="theme-item" 
            v-for="(t, idx) in themes" 
            :key="idx"
            :class="{ active: currentTheme === idx }"
            :style="{ background: t.color }"
            @click="switchTheme(idx)"
          >
            <text class="check" v-if="currentTheme === idx">✓</text>
          </view>
        </view>
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
          <view class="set-item">
            <text class="set-icon" @click="handleClearCache">🧹</text>
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

      <!-- 邀请弹窗 -->
      <invite-family-popup
        :show="showInviteModal"
        :family-code="familyCode"
        @close="showInviteModal = false"
      />

      <!-- 加入弹窗 -->
      <join-family-popup
        :show="showJoinModal"
        @close="showJoinModal = false"
        @joined="handleJoined"
      />

      <!-- 切换家庭弹窗 -->
      <!-- 切换家庭组件 -->
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

      <!-- 修改昵称弹窗 -->
      <edit-member-popup
        :show="showNickModal"
        :family-code="familyCode"
        :member="activeMember"
        @close="showNickModal = false"
        @saved="loadFamilyMembers"
        @preview="previewImage"
      />

      <!-- 随机推荐管理弹窗 -->
      <random-menu-popup
        :show="showRandomMenuModal"
        :family-code="familyCode"
        @close="showRandomMenuModal = false"
      />

      <!-- 分类管理弹窗 -->
      <manage-categories-popup
        :show="showCatModal"
        @close="showCatModal = false"
      />

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


    <!-- 选菜组件 -->
    <meal-picker-popup
      :show="showMealPopup"
      :meal="currentMeal"
      @close="closeMealPopup"
      @confirm="confirmMealSelection"
    />

    <!-- 智能管家提醒详情弹窗 -->
    <reminders-popup
      :show="showReminderModal"
      :reminders="reminders"
      @close="showReminderModal = false"
    />

    <!-- 查看大图蒙版 -->
    <view class="big-image-mask" v-if="showBigImage" @click="closeBigImage">
      <view class="big-image-content" @click.stop>
        <image class="big-image" :src="bigImageUrl" mode="aspectFit" />
        <view class="close-big-btn" @click="closeBigImage">✕</view>
      </view>
    </view>

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
      @saved="loadFamily"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import familyApi from '@/common/api/family.js'
import recipeApi from '@/common/api/recipe.js'
import weatherPopup from '@/components/weather-popup/weather-popup.vue' // 天气预警弹窗
import calendarPopup from '@/components/calendar-popup/calendar-popup.vue' // 万年历弹窗
import compassPopup from '@/components/compass-popup/compass-popup.vue' // 指南针弹窗
import mealPickerPopup from './component/meal-picker-popup.vue' // 吃饭选择弹窗
import switchFamilyPopup from './component/switch-family-popup.vue' // 切换家庭弹窗
import securitySettingPopup from './component/security-setting-popup.vue' // 密保找回设置弹窗
import familyCodePopup from './component/family-code-popup.vue' // 家庭安全编码弹窗
import randomMenuPopup from './component/random-menu-popup.vue' // 随机抽菜池管理弹窗
import manageCategoriesPopup from './component/manage-categories-popup.vue' // 分类管理弹窗
import remindersPopup from './component/reminders-popup.vue' // 智能管家提醒详情弹窗
import addTastePopup from './component/add-taste-popup.vue' // 添加口味弹窗
import addAvoidPopup from './component/add-avoid-popup.vue' // 添加忌口弹窗
import inviteFamilyPopup from './component/invite-family-popup.vue' // 邀请家人加入弹窗
import joinFamilyPopup from './component/join-family-popup.vue' // 加入新家庭弹窗
import editFamilyPopup from './component/edit-family-popup.vue' // 修改家庭名称弹窗
import editMemberPopup from './component/edit-member-popup.vue' // 修改我的昵称/角色弹窗
import config from '@/common/config'
import request from '@/common/request.js'

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
const showBigImage = ref(false)
const bigImageUrl = ref('')

const previewImage = (url) => {
  if (!url) return
  const fullUrl = url.startsWith('http') ? url : config.imgBaseUrl + url
  bigImageUrl.value = fullUrl
  showBigImage.value = true
}
const closeBigImage = () => {
  showBigImage.value = false
  bigImageUrl.value = ''
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
const showInviteModal = ref(false)
const showJoinModal = ref(false)

const openInvite = async () => {
  console.log(familyCode.value, familyRole.value, members.value,'--------------')
  
  // 1、如果还没有创建家庭，先创建家庭
  if (familyCode.value === 'default_family') {
    const ok = await createFamily()
    if (!ok) return // 创建失败中止
  }

  showInviteModal.value = true
}

const createFamily = async () => {
  // 此操作会创建家庭，是否继续？
  const ok = await new Promise((resolve) => {
    uni.showModal({
      title: '创建家庭',
      content: '此操作会创建家庭，是否继续？',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
  if (!ok) return false
  
  const familyCode = 'default_family'
  const res = await familyApi.createFamily(familyName.value)
  
  if (res && res.data) {
    familyCode.value = res.data.family.familyCode
    familyRole.value = res.data.member.role // 更新当前响应式状态
    uni.setStorageSync('family_code', familyCode.value)
    uni.setStorageSync('family_role', familyRole.value)
    return true
  }
  
  uni.showToast({ title: '创建家庭失败', icon: 'none' })
  return false
} 

const handleJoined = async ({ code, role }) => {
  familyCode.value = code
  familyRole.value = role
  await loadFamily()
  await loadFamilyMembers()
}

// 家庭信息
const loadFamily = async () => {
  if (!familyCode.value) return
  const family = await familyApi.getFamily(familyCode.value)
  if (family && family.data) {
    familyName.value = family.data.familyName
    familyAvatar.value = family.data.avatarUrl || uni.getStorageSync('family_avatar') || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'
  }
}

// 家庭成员
const loadFamilyMembers = async () => {
  if (!familyCode.value) {
    members.value = []
    return
  }
  const res = await familyApi.getFamilyMembers(familyCode.value)
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
    // 自己排到第一位，管理员第二，其他按加入时间倒序
    members.value.sort((a, b) => {
      if (a.isSelf) return -1
      if (b.isSelf) return 1
      if (a.role === 'owner') return -1
      if (b.role === 'owner') return 1
      return 1
    })
    uni.setStorageSync('family_role', members.value.find(m => m.isSelf)?.role || 'member')
    familyRole.value = members.value.find(m => m.isSelf)?.role || 'member'
  }
}

const activeMember = ref({})
const showNickModal = ref(false)

const handleMemberClick = (m) => {
  activeMember.value = m
  showNickModal.value = true
}

const leaveFamily = () => {
  uni.showModal({
    title: '退出提醒',
    content: '确定要退出当前家庭吗？退出后将无法查看该家庭数据。',
    confirmColor: '#FF4D4F',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在退出...', mask: true })
        try {
          const resLeave = await familyApi.leaveFamily(familyCode.value)
          if (resLeave && resLeave.data) {
            uni.showToast({ title: '已退出家庭', icon: 'success' })
            
            // 查询最新的家庭列表
            const listRes = await familyApi.getMyFamilies()
            if (listRes && listRes.data && listRes.data.families && listRes.data.families.length > 0) {
              // 自动顺延到第一个可用家庭
              const newFam = listRes.data.families[0]
              uni.setStorageSync('family_code', newFam.familyCode)
              uni.setStorageSync('family_name', newFam.familyName)
              uni.setStorageSync('family_avatar', newFam.avatarUrl || '')
              uni.setStorageSync('family_role', newFam.role || 'member')
              
              familyCode.value = newFam.familyCode
              familyName.value = newFam.familyName
              familyAvatar.value = newFam.avatarUrl || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'
              familyRole.value = newFam.role || 'member'
              
              uni.showToast({ title: '已自动切换至 ' + newFam.familyName, icon: 'success' })
              setTimeout(() => {
                uni.reLaunch({ url: '/pages/family/family' })
              }, 800)
            } else {
              // 没有任何可用家庭了，重置状态
              uni.setStorageSync('family_code', '')
              uni.setStorageSync('family_name', '')
              uni.setStorageSync('family_avatar', '')
              uni.setStorageSync('family_role', '')
              
              familyCode.value = ''
              familyName.value = ''
              familyAvatar.value = ''
              familyRole.value = ''
              
              // 打开切换弹窗引导用户创建或加入
              showSwitchFamilyModal.value = true
              await loadMyFamilies()
            }
          } else {
            uni.showToast({ title: resLeave.message || '退出家庭失败,请稍后重试', icon: 'none' })
          }
        } catch (e) {
          console.error('退出家庭出错', e)
          uni.showToast({ title: '退出失败，请重试', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

const disbandFamily = () => {
  // 如果成员人数大于 1，则拦截解散/注销操作
  if (members.value.length > 1) {
    uni.showModal({
      title: '无法注销家庭',
      content: '当前家庭中还存在其他成员。为了保障大家的共有数据资产安全，请先请其他成员主动退出，仅剩您一人时方可注销当前家庭。',
      showCancel: false,
      confirmColor: '#FF4D4F'
    })
    return
  }

  uni.showModal({
    title: '注销家庭',
    content: '确定要注销当前家庭吗？注销后该家庭的全部关联数据（食材、菜谱、账本）将被彻底清除且无法恢复！',
    confirmColor: '#FF4D4F',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在注销...', mask: true })
        try {
          const resDelete = await familyApi.deleteFamily(familyCode.value)
          if (resDelete && resDelete.data) {
            uni.showToast({ title: '已注销家庭', icon: 'success' })
            
            // 查询最新的家庭列表
            const listRes = await familyApi.getMyFamilies()
            if (listRes && listRes.data && listRes.data.families && listRes.data.families.length > 0) {
              // 自动顺延到第一个可用家庭
              const newFam = listRes.data.families[0]
              uni.setStorageSync('family_code', newFam.familyCode)
              uni.setStorageSync('family_name', newFam.familyName)
              uni.setStorageSync('family_avatar', newFam.avatarUrl || '')
              uni.setStorageSync('family_role', newFam.role || 'member')
              
              familyCode.value = newFam.familyCode
              familyName.value = newFam.familyName
              familyAvatar.value = newFam.avatarUrl || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'
              familyRole.value = newFam.role || 'member'
              
              uni.showToast({ title: '已自动切换至 ' + newFam.familyName, icon: 'success' })
              setTimeout(() => {
                uni.reLaunch({ url: '/pages/family/family' })
              }, 800)
            } else {
              // 没有任何可用家庭了，重置状态
              uni.setStorageSync('family_code', '')
              uni.setStorageSync('family_name', '')
              uni.setStorageSync('family_avatar', '')
              uni.setStorageSync('family_role', '')
              
              familyCode.value = ''
              familyName.value = ''
              familyAvatar.value = ''
              familyRole.value = ''
              
              // 打开切换弹窗引导用户创建或加入
              showSwitchFamilyModal.value = true
              await loadMyFamilies()
            }
          } else {
            uni.showToast({ title: resDelete.message || '注销家庭失败,请稍后重试', icon: 'none' })
          }
        } catch (e) {
          console.error('注销家庭出错', e)
          uni.showToast({ title: '注销失败，请重试', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

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

// 数据统计
const stats = ref([
  { icon: '🍅', num: '0', label: '食材总数' },
  { icon: '🛒', num: '0', label: '待采购' },
  { icon: '💰', num: '0', label: '本月花费' },
  { icon: '❤️', num: '0', label: '收藏菜谱' },
  { icon: '🛍️', num: '0', label: '买菜次数' },
  { icon: '🥚', num: '-', label: '常用食材' }
])

// 预算
const budget = ref({ total: 3000, spent: 0 })

let lastUpdateDate = ''
onShow(() => {
  const code = uni.getStorageSync('family_code')
  if (!code) {
    uni.reLaunch({
      url: '/pages/welcome/welcome'
    })
    return // 熔断后续数据拉取，保障空 family_code 时的极端稳定性
  }
  
  familyCode.value = code
  
  // refreshStats()
  loadMeals()
  const today = new Date().toDateString()
  if (lastUpdateDate !== today) {
    initDateWeather()
    lastUpdateDate = today
  }
  loadFamily()
  loadFamilyMembers()
  loadDietPreferences()
})

// 日期与天气数据
const dateInfo = ref({
  gregorian: '',
  lunar: '',
  weather: '加载中...',
  temp: '--',
  weatherIcon: ''
})

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
    // 强制清理关于天气和定位的缓存
    const info = uni.getStorageInfoSync()
    info.keys.forEach(key => {
      if (key.startsWith('weather_cache_') || key.startsWith('tencent_city_')) {
        uni.removeStorageSync(key)
      }
    })
    dateInfo.value.weather = '刷新中...'
    dateInfo.value.temp = '--'
    await getWeather()
    uni.showToast({ title: '天气已更新', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '刷新失败', icon: 'none' })
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
const reminders = ref([
  { type: 'warning', icon: '⚠️', text: '库存预警：鸡蛋仅剩 2 个', action: '加购' },
  { type: 'danger', icon: '⏳', text: '过期提醒：鲜牛奶还有 2 天过期', action: '处理' },
  { type: 'info', icon: '💡', text: '今日推荐：根据天气为您推荐「冬瓜排骨汤」', action: '查看' }
])

// 三餐逻辑
const meals = ref([])
const showMealPopup = ref(false)
const currentMeal = ref(null)
const customMealName = ref('')
const saveToCommon = ref(true)

const commonMenus = ref(uni.getStorageSync('common_menus') || {
  '早餐': ['燕麦牛奶', '包子豆浆', '葱香煎蛋', '三明治'],
  '午餐': ['番茄炒蛋', '红烧肉', '青椒肉丝', '紫菜蛋花汤'],
  '晚餐': ['清炒时蔬', '小米粥', '蔬菜沙拉', '煎鸡胸肉']
})

// 三餐选择弹窗所用状态 (交由子组件自给自足)

const initEmptyMeals = () => [
  { name: '早餐', icon: '🥛', recipes: [], done: false },
  { name: '午餐', icon: '🍱', recipes: [], done: false },
  { name: '晚餐', icon: '🥗', recipes: [], done: false }
]

const loadMeals = async () => {
  const today = new Date().toISOString().split('T')[0]
  
  // 1. 首屏优先展示本地缓存数据，极速响应防止渲染空白
  let todayData = uni.getStorageSync('daily_meals_' + today)
  if (todayData) {
    meals.value = todayData
  } else {
    const stored = uni.getStorageSync('daily_meals')
    if (stored && stored.date === today) {
      meals.value = stored.data
      uni.setStorageSync('daily_meals_' + today, stored.data)
    } else {
      meals.value = initEmptyMeals()
    }
  }

  // 2. 发起云端 API 请求以获取及校准最新三餐数据
  if (!familyCode.value) return
  try {
    const res = await familyApi.getDailyMeals(familyCode.value, today)
    if (res && res.data) {
      const serverMeals = res.data.meals || res.data || []
      if (serverMeals.length > 0) {
        const localMeals = initEmptyMeals()
        localMeals.forEach(lm => {
          const match = serverMeals.find(sm => (sm.mealName || sm.meal_name || sm.name) === lm.name)
          if (match) {
            lm.recipes = match.recipes || []
            lm.done = match.done === true || match.done === 1 || match.done === '1'
          }
        })
        meals.value = localMeals
        // 更新本地缓存
        uni.setStorageSync('daily_meals_' + today, meals.value)
        uni.setStorageSync('daily_meals', { date: today, data: meals.value })
      }
    }
  } catch (e) {
    console.error('从云端加载三餐数据失败', e)
  }
}

const saveMeals = async () => {
  const today = new Date().toISOString().split('T')[0]
  uni.setStorageSync('daily_meals_' + today, meals.value)
  uni.setStorageSync('daily_meals', { date: today, data: meals.value }) // 兼容老数据

  // 同步保存至云端服务器
  if (!familyCode.value) return
  try {
    const formattedMeals = meals.value.map(m => ({
      meal_name: m.name,
      done: m.done ? 1 : 0,
      recipes: m.recipes || []
    }))
    await familyApi.saveDailyMeals(familyCode.value, today, formattedMeals)
  } catch (e) {
    console.error('同步保存三餐至云端出错', e)
  }
}

const copyMealsToTomorrow = () => {
  uni.showModal({
    title: '复制到明天',
    content: '将把今天云端的三餐计划和临时安排菜品复制到明天，并在明日生效，是否确认？',
    success: async (res) => {
      if (res.confirm) {
        if (!familyCode.value) {
          return uni.showToast({ title: '未关联家庭，无法同步', icon: 'none' })
        }
        
        const today = new Date().toISOString().split('T')[0]
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split('T')[0]
        
        uni.showLoading({ title: '正在复制...', mask: true })
        try {
          // 1. 从云端拉取今日的最真实的三餐安排数据
          let todayMeals = []
          try {
            const resDaily = await familyApi.getDailyMeals(familyCode.value, today)
            const list = resDaily.data?.meals || resDaily.data || []
            if (list.length > 0) {
              const localMeals = initEmptyMeals()
              localMeals.forEach(lm => {
                const match = list.find(sm => (sm.mealName || sm.meal_name || sm.name) === lm.name)
                if (match) {
                  lm.recipes = match.recipes || []
                  lm.done = false // 复制到明天一律初始化为未完成
                }
              })
              todayMeals = localMeals
            } else {
              todayMeals = meals.value.map(m => ({ ...m, done: false }))
            }
          } catch (err) {
            console.error('云端获取今日三餐出错，降级使用当前本地数据', err)
            todayMeals = meals.value.map(m => ({ ...m, done: false }))
          }

          // (a) 同步正式三餐计划到明天云端
          const formattedMeals = todayMeals.map(m => ({
            meal_name: m.name,
            done: 0,
            recipes: m.recipes || []
          }))
          await familyApi.saveDailyMeals(familyCode.value, tomorrowStr, formattedMeals)
          
          // (b) 更新明天的三餐计划本地缓存
          uni.setStorageSync('daily_meals_' + tomorrowStr, todayMeals)
          
          // 2. 从云端拉取今日最真实的临时安排池数据
          let todayTempPool = {}
          try {
            const resTemp = await familyApi.getDailyTempPool(familyCode.value, today)
            if (resTemp && resTemp.data.plan) {
              if (Array.isArray(resTemp.data.plan)) {
                const listObj = {}
                resTemp.data.plan.forEach(item => {
                  const tabName = item.mealName || item.meal_name || '早餐'
                  if (!listObj[tabName]) listObj[tabName] = []
                  listObj[tabName].push(item.recipeName || item.recipe_name)
                })
                todayTempPool = listObj
              } else {
                todayTempPool = resTemp.data.plan || {}
              }
            }
          } catch (err) {
            console.error('云端获取今日临时安排出错，降级使用当前本地数据', err)
            todayTempPool = uni.getStorageSync('daily_temp_pool_' + today) || {}
          }
          
          // (c) 遍历并同步所有临时菜品安排到明天云端临时池中
          for (const mealName in todayTempPool) {
            const list = todayTempPool[mealName] || []
            for (const recipeName of list) {
              try {
                await familyApi.addDailyTempRecipe(familyCode.value, tomorrowStr, mealName, recipeName)
              } catch (err) {
                console.error('云端同步明天临时安排出错', err)
              }
            }
          }
          
          // (d) 更新明天的本地缓存临时安排池
          uni.setStorageSync('daily_temp_pool_' + tomorrowStr, todayTempPool)
          
          uni.showToast({ title: '已成功复制', icon: 'success' })
        } catch (e) {
          console.error('同步复制到明天出错', e)
          uni.showToast({ title: '同步失败，请重试', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 已应要求移除 calcIngredientStatus 逻辑

const openMealSelector = async (m) => {
  if (m.done) {
    uni.showToast({ title: '本餐已完成', icon: 'none' })
    return
  }
  currentMeal.value = m
  showMealPopup.value = true
}

const closeMealPopup = () => {
  showMealPopup.value = false
  currentMeal.value = null
}

// const checkAndAddMissingIngredients = async (recipesList) => {
//   try {
//     const fId = familyCode.value || 'default_family'
//     const allRecipes = await eatCo.getRecipeList(fId)
//     const currentStocks = await eatCo.getStockList(fId)
//     const currentShops = await eatCo.getShopList(fId)
    
//     let addedToShopCount = 0
//     for (let rName of recipesList) {
//       const matchR = allRecipes.find(r => r.name === rName)
//       if (matchR && matchR.ingredients && matchR.ingredients.length > 0) {
//         for (let ing of matchR.ingredients) {
//           const hasInStock = currentStocks.some(s => s.name === ing.name && s.has)
//           if (!hasInStock) {
//             const inShop = currentShops.some(s => s.name === ing.name && !s.done)
//             if (!inShop) {
//               await eatCo.addShop({
//                 name: ing.name,
//                 num: ing.num || '1',
//                 category: '食材',
//                 done: false,
//                 price: '',
//                 family_code: fId
//               })
//               addedToShopCount++
//               currentShops.push({ name: ing.name, done: false })
//             }
//           }
//         }
//       }
//     }
//     if (addedToShopCount > 0) {
//       uni.showToast({ title: `已自动加入 ${addedToShopCount} 项缺失食材到清单`, icon: 'none', duration: 3000 })
//     }
//   } catch (e) {
//     console.error('检查食材异常', e)
//   }
// }

const confirmMealSelection = async (selectedRecipes) => {
  if (currentMeal.value) {
    // const newlyAdded = selectedRecipes.filter(r => !(currentMeal.value.recipes || []).includes(r))
    currentMeal.value.recipes = [...selectedRecipes]
    currentMeal.value.done = false
    saveMeals()
    
    // if (newlyAdded.length > 0) {
    //   checkAndAddMissingIngredients(newlyAdded)
    // }
    closeMealPopup()
  }
}

const markMealDone = async (m) => {
  m.done = true
  saveMeals()
  
  // 额外专门上报打卡状态 API 确保即使总体保存遇到波动，核心打卡操作依然上报成功
  if (!familyCode.value) return
  try {
    const today = new Date().toISOString().split('T')[0]
    await familyApi.updateMealStatus(familyCode.value, today, m.name, 1)
    uni.showToast({ title: '已打卡', icon: 'success' })
  } catch (e) {
    console.error('同步打卡状态至云端失败', e)
  }
}

const handleMakeMeal = (m) => {
  if (m.done) {
    uni.showToast({ title: '本餐已完成', icon: 'none' })
    return
  }
  uni.showActionSheet({
    itemList: ['去查看菜谱', '完成打卡'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 多选情况默认去搜第一个菜
        // const target = m.recipes && m.recipes.length > 0 ? m.recipes[0] : ''
        // if(target) goRecipe(target)
        uni.switchTab({
          url: `/pages/recipe/recipe`
        })
      } else if (res.tapIndex === 1) {
        markMealDone(m)
      }
    }
  })
}

// 快捷功能
const quickFuncs = ref([
  { icon: '🎲', name: '抽菜配置' },
  { icon: '🧺', name: '随手记' },
  { icon: '🗑️', name: '每日计划' },
  { icon: '💵', name: '清空花费' },
  { icon: '🧹', name: '清理数据' },
  { icon: '📤', name: '个性主题' },
  { icon: '📥', name: '饮食偏好' },
  { icon: '📊', name: '开销统计' }
])

// 家庭成员
const members = ref([
  { nick: '干饭人', role: '大主厨', avatar: config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbqsd7_0d13d785d123.jpg', isSelf: true },
  // { nick: '妈妈', role: '采购总监', avatar: 'https://pic.rmb.bdstatic.com/bjh/240813/dump/2f9e7e45efdb1b9134b9c9af309ffe33.png', isSelf: false },
  // { nick: '宝宝', role: '干饭人', avatar: 'https://pic.rmb.bdstatic.com/bjh/240813/dump/2f9e7e45efdb1b9134b9c9af309ffe33.png', isSelf: false }
])

// 消费趋势
const trends = ref({
  '一': 120, '二': 45, '三': 180, '四': 0, '五': 80, '六': 150, '日': 110
})

// 偏好
const prefs = ref({
  taste: [],
  avoid: []
})
const tasteOptions = ref([])
const avoidOptions = ref([])
const isEditingPrefs = ref(false)
const isEditingTaste = ref(false)
const showAddAvoidModal = ref(false)
const showAddTasteModal = ref(false)

const loadDietPreferences = async () => {
  try {
    const resTaste = await familyApi.getFamilyDietPreferences(familyCode.value, 'family_taste')
    tasteOptions.value = resTaste.data?.preferences || []
    
    const resAvoid = await familyApi.getFamilyDietPreferences(familyCode.value, 'avoid_food')
    avoidOptions.value = resAvoid.data?.preferences || []
    
    // 如果该家庭尚未配置过任何口味和忌口，启动温情静默预置常见口味与忌口
    if (tasteOptions.value.length === 0 && avoidOptions.value.length === 0) {
      await initDefaultDietPreferences()
    }
  } catch (e) {
    console.error('加载饮食偏好失败', e)
  }
}

const initDefaultDietPreferences = async () => {
  try {
    const defaultTastes = ['清淡', '适中', '重口']
    for (const title of defaultTastes) {
      await familyApi.saveFamilyDietPreference(familyCode.value, JSON.stringify({
        title,
        type: 'family_taste'
      }))
    }
    
    const defaultAvoids = ['海鲜', '香菜']
    for (const title of defaultAvoids) {
      await familyApi.saveFamilyDietPreference(familyCode.value, JSON.stringify({
        title,
        type: 'avoid_food'
      }))
    }
    
    // 初始化后重新拉取
    const resTaste = await familyApi.getFamilyDietPreferences(familyCode.value, 'family_taste')
    tasteOptions.value = resTaste.data?.preferences || []
    const resAvoid = await familyApi.getFamilyDietPreferences(familyCode.value, 'avoid_food')
    avoidOptions.value = resAvoid.data?.preferences || []
  } catch (e) {
    console.error('初始化默认偏好出错', e)
  }
}

const selectTaste = (t) => {
  if (isEditingTaste.value) return
  uni.showToast({ title: '💡 长按可删除该口味', icon: 'none' })
}

const openAddTasteModal = () => {
  showAddTasteModal.value = true
}

const removeTaste = async (t) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除“${t.title}”口味偏好吗？`,
    confirmColor: '#FF4D6D',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在删除...', mask: true })
        try {
          await familyApi.deleteFamilyDietPreference(familyCode.value, t.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          
          const resTaste = await familyApi.getFamilyDietPreferences(familyCode.value, 'family_taste')
          tasteOptions.value = resTaste.data?.preferences || []
          
          if (tasteOptions.value.length === 0) isEditingTaste.value = false
        } catch (e) {
          console.error('删除口味失败', e)
          uni.showToast({ title: '删除失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

const toggleAvoid = (a) => {
  if (isEditingPrefs.value) return
  uni.showToast({ title: '💡 长按可删除该忌口', icon: 'none' })
}

const openAddAvoidModal = () => {
  showAddAvoidModal.value = true
}

const removeAvoid = async (a) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除忌口“${a.title}”吗？`,
    confirmColor: '#FF4D6D',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在删除...', mask: true })
        try {
          await familyApi.deleteFamilyDietPreference(familyCode.value, a.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          
          const resAvoid = await familyApi.getFamilyDietPreferences(familyCode.value, 'avoid_food')
          avoidOptions.value = resAvoid.data?.preferences || []
          
          if (avoidOptions.value.length === 0) isEditingPrefs.value = false
        } catch (e) {
          console.error('删除忌口失败', e)
          uni.showToast({ title: '删除失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 随机抽菜菜单配置===========================
const showRandomMenuModal = ref(false)
// ===========================================

// 分类管理
const showCatModal = ref(false)


const handleSetting = (name) => {
  if (name === '抽菜配置') {
    showRandomMenuModal.value = true
  } else if (name === '随手记') {
    uni.navigateTo({
      url: '/pages/family/component/memo?type=personal'
    })
  } else {
    uni.showToast({ title: `功能「${name}」开发中...`, icon: 'none' })
  }
}

const handleClearCache = () => {
  // 第一次警告
  uni.showModal({
    title: '⚠️ 清除所有数据',
    content: '清除缓存后将永久删除：食材、购物车、花费、菜谱、备忘录、主题设置，无法恢复！',
    confirmText: '确认清除',
    confirmColor: '#FF4444', // 红色警告
    success: (res) => {
      if (res.confirm) {
        // 第二次二次确认
        uni.showModal({
          title: '最终确认',
          content: '确定要清空所有数据吗？此操作不可恢复！',
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
            }
          }
        })
      }
    }
  })
}

const goToMemo = () => {
  uni.navigateTo({ url: '/pages/family/component/memo' })
}

const goToHealth = () => {
  console.log('Attempting to navigate to health page...')
  uni.navigateTo({ 
    url: '/pages/family/component/health',
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

const handleReminderAction = (r) => {
  showReminderModal.value = false
  if (r.text.includes('鸡蛋') || r.text.includes('牛奶')) {
    uni.navigateTo({ url: '/pages/index/index' })
  } else if (r.text.includes('冬瓜')) {
    uni.switchTab({ url: '/pages/recipe/recipe' })
  } else {
    uni.showToast({ title: `正在处理：${r.text}`, icon: 'none' })
  }
}
</script>

<style lang="less" scoped>
.page-container {
  background-color: #F6F7F9;
  min-height: ~"calc(100vh - 240rpx)";
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
  z-index: 10;
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

/* 弹窗通用样式 */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}
.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx;

  .avatar-box {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: #F0F0F0;
    position: relative;
    margin: 0 auto 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .camera-icon {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 40rpx;
      height: 40rpx;
      background: #FF4D4F;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      color: #fff;
    }
  }
  
  .modal-title {
    display: block;
    text-align: center;
    font-size: 34rpx;
    font-weight: 800;
    color: #2C3E50;
    margin-bottom: 40rpx;
  }
}

/* 提醒详情弹窗样式 */
.reminder-modal {
  width: 650rpx !important;
  padding: 40rpx !important;
  
  .modal-header {
    text-align: center;
    margin-bottom: 40rpx;
    .modal-title { font-size: 36rpx; margin-bottom: 8rpx; display: block; margin-top: 20rpx; }
    .modal-subtitle { font-size: 24rpx; color: #9E9E9E; }
  }
  
  .reminder-detail-list {
    max-height: 600rpx;
    margin-bottom: 40rpx;
    
    .detail-item {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 30rpx; border-radius: 36rpx; margin-bottom: 20rpx;
      transition: all 0.2s;
      gap: 20rpx;
      
      &.warning { background: #FFF9F0; .d-action-btn { background: #F2A13B; } }
      &.danger { background: #FFF5F5; .d-action-btn { background: #FF6B8B; } }
      &.info { background: #F0F9F4; .d-action-btn { background: #4DB88F; } }
      
      .d-left {
        flex: 1;
        display: flex; align-items: flex-start; gap: 24rpx;
        
        .d-icon { font-size: 44rpx; flex-shrink: 0; margin-top: 4rpx; }
        .d-info {
          flex: 1;
          display: flex; flex-direction: column; gap: 8rpx;
          
          .d-text { 
            font-size: 28rpx; font-weight: 800; color: #2C3E50; 
            line-height: 1.4;
            word-break: break-all;
          }
          .d-type-name { font-size: 20rpx; color: #9E9E9E; }
        }
      }
      
      .d-action-btn {
        flex-shrink: 0;
        padding: 10rpx 28rpx; border-radius: 100rpx; color: #fff; font-size: 22rpx; font-weight: 900;
        box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
      }
    }
  }
  
  .close-reminder-btn {
    width: 100%; height: 90rpx; line-height: 90rpx;
    background: #F8F9FA; color: #9E9E9E; border-radius: 100rpx;
    font-size: 28rpx; font-weight: 800; border: none;
    margin-top: 10rpx;
    &::after { border: none; }
  }
}

.cat-manage-list {
  max-height: 400rpx;
  overflow-y: auto;
  margin-bottom: 30rpx;
  
  .cat-manage-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 2rpx solid #F8F9FA;
    font-size: 28rpx;
    color: #2C3E50;
    
    .del-cat {
      color: #FF4757;
      font-size: 24rpx;
      font-weight: bold;
    }
  }
}

.add-cat-box {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
  
  .add-cat-input {
    flex: 1;
    background: #F8F9FA;
    height: 80rpx;
    border-radius: 20rpx;
    padding: 0 30rpx;
    font-size: 26rpx;
  }
  
  .add-cat-btn {
    background: var(--primary);
    color: #fff;
    height: 80rpx;
    line-height: 80rpx;
    padding: 0 30rpx;
    border-radius: 20rpx;
    font-size: 26rpx;
    font-weight: bold;
  }
}

.close-modal-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: #F8F9FA;
  color: #2C3E50;
  border-radius: 100rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
  &::after { border: none; }
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

/* 6. 主题切换 */
.theme-section {
  padding: 30rpx !important;
  .theme-list {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-top: 10rpx;
  }
  .theme-item {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
    
    &.active {
      transform: scale(1.15);
      box-shadow: 0 8rpx 24rpx var(--primary-shadow);
      border: 4rpx solid #fff;
    }
    
    .check {
      color: #fff;
      font-weight: bold;
      font-size: 32rpx;
    }
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

.meal-simple-card {
  background: #FFFFFF;
  border: 2rpx solid #F8F9FB;
  border-radius: 36rpx;
  padding: 32rpx 36rpx;
  display: flex;
  align-items: center;
  gap: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(149, 157, 165, 0.05);
  transition: all 0.25s ease;
  
  &:active { 
    transform: scale(0.98); 
    background: #FAFBFD; 
  }
  
  .sc-left-icon {
    width: 100rpx;
    height: 100rpx;
    background: #F6F8FA;
    border-radius: 28rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 44rpx;
    flex-shrink: 0;
    box-shadow: inset 0 2rpx 10rpx rgba(0,0,0,0.01);
  }
  
  .sc-mid-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12rpx;
    min-width: 0;
    
    .sc-title {
      font-size: 32rpx;
      font-weight: 800;
      color: #2D3748;
      line-height: 1.2;
    }
    .sc-sub {
      font-size: 24rpx;
      color: #718096;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      &.empty { color: #A0AEC0; }
    }
  }
  
  .sc-right-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    margin-left: 10rpx;
  }
  
  .sc-circle-add {
    width: 76rpx;
    height: 76rpx;
    background: #EDF2F7;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 36rpx;
    font-weight: bold;
    background: var(--primary);
    box-shadow: 0 8rpx 20rpx var(--primary-light);
  }
  
  .sc-pill-go {
    background: var(--primary);
    color: #fff;
    height: 68rpx;
    padding: 0 36rpx;
    border-radius: 100rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24rpx;
    font-weight: 900;
    box-shadow: 0 8rpx 20rpx var(--primary-light);
    letter-spacing: 2rpx;
    
    &.is-done {
      background: #E2E8F0;
      color: #718096;
      box-shadow: none;
      font-weight: bold;
    }
  }
}

/* 2. 数据统计区 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30rpx 20rpx;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  
  .stat-icon-wrap {
    width: 88rpx;
    height: 88rpx;
    border-radius: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    
    &.bg-0 { background: #FFF5F7; color: #FF8DA1; }
    &.bg-1 { background: #F2FBF7; color: #68CBA6; }
    &.bg-2 { background: #F3F7FE; color: #7AA3ED; }
    &.bg-3 { background: #FEFAF3; color: #F5B96B; }
    
    .stat-icon {
      font-size: 40rpx;
    }
  }
  
  .stat-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .stat-num {
      font-size: 34rpx;
      font-weight: 900;
      color: #2C3E50;
      margin-bottom: 4rpx;
    }
    .stat-label {
      font-size: 22rpx;
      color: #95A5A6;
    }
  }
}

/* 10. 家庭消费目标 */
.budget-card {
  background: var(--primary-light);
  border-radius: 30rpx;
  padding: 40rpx 30rpx;
  transition: background 0.5s ease;
  
  .budget-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24rpx;
    
    .b-item {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      &.right { align-items: flex-end; }
      
      .b-label { font-size: 24rpx; color: #7F8C8D; }
      .b-val { 
        font-size: 40rpx; 
        font-weight: 900; 
        
        &.spent { color: var(--primary); }
        &.remain { color: #2C3E50; }
      }
    }
  }
  
  .progress-bar {
    height: 16rpx;
    background: #EAECEF;
    border-radius: 100rpx;
    overflow: hidden;
    
    .progress-inner {
      height: 100%;
      background: var(--primary-grad);
      border-radius: 100rpx;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease;
    }
  }
}

/* 7. 智能提醒 */
.reminders-section {
  .reminder-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
  .reminder-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-radius: 24rpx;
    background: #F8F9FA;
    gap: 20rpx;
    
    &.warning { background: #FFF9E6; .r-icon { color: #FFAA00; } }
    &.danger { background: #FFEEEE; .r-icon { color: #FF4D4F; } }
    &.info { background: var(--primary-light); .r-icon { color: var(--primary); } }
    
    .r-icon-box {
      width: 50rpx;
      display: flex;
      justify-content: center;
    }
    
    .r-text {
      flex: 1;
      font-size: 26rpx;
      color: #34495E;
      font-weight: 500;
    }
    
    .r-btn {
      font-size: 24rpx;
      color: #fff;
      background: var(--primary);
      padding: 8rpx 24rpx;
      border-radius: 100rpx;
      font-weight: bold;
      transition: background 0.5s ease;
    }
  }
}

/* 3. 今日三餐计划 */
.meals-section {
  margin-top: 30rpx;
  .section-title {
    .subtle-link {
      background: rgba(0,0,0,0.04);
      padding: 8rpx 20rpx;
      border-radius: 50rpx;
      color: #7F8C8D;
      font-weight: 500;
    }
  }
}

.fancy-meal-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.fancy-meal-card {
  background: #ffffff;
  border-radius: 36rpx;
  padding: 30rpx 24rpx;
  position: relative;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 2rpx solid transparent;
  
  &.is-active {
    background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
  }
  &.is-done {
    background: #fbfcfb;
  }
  &:active {
    transform: scale(0.99);
  }

  .card-edit-corner {
    position: absolute;
    top: 16rpx; right: 16rpx;
    background: rgba(0,0,0,0.03);
    width: 48rpx; height: 48rpx;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    z-index: 5;
    .edit-pencil { font-size: 22rpx; color: #999; }
  }

  .card-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .c-header-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 90rpx;
    flex-shrink: 0;
    
    .c-ico-bg {
      width: 80rpx; height: 80rpx;
      background: #F8F9FA;
      border-radius: 28rpx;
      display: flex; justify-content: center; align-items: center;
      font-size: 40rpx;
      margin-bottom: 8rpx;
      box-shadow: inset 0 2rpx 8rpx rgba(0,0,0,0.02);
    }
    
    .c-card-title {
      font-size: 24rpx; font-weight: bold; color: #34495E;
    }
  }

  .c-body-content {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
  
  .c-tag-scroll {
    width: 100%;
    white-space: nowrap;
    .c-tag-strip {
      display: inline-flex;
      align-items: center;
      gap: 16rpx;
      padding: 10rpx 0;
    }
  }

  .fancy-recipe-tag {
    display: inline-block;
    background: #F0F2F5;
    color: #4A4A4A;
    padding: 12rpx 26rpx;
    border-radius: 30rpx;
    font-size: 24rpx;
    font-weight: 600;
    flex-shrink: 0;
    box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.02);
    
    &.done {
      background: #EBFDF2;
      color: #2ECC71;
    }
  }

  .c-empty-spot {
    .spot-text { font-size: 24rpx; color: #BDC3C7; font-weight: 500; }
  }

  .c-action-area {
    flex-shrink: 0;
    margin-left: 10rpx;
  }

  .fancy-pill-btn {
    height: 64rpx;
    padding: 0 28rpx;
    border-radius: 100rpx;
    display: flex; align-items: center; justify-content: center;
    font-size: 24rpx; font-weight: bold;
    transition: all 0.2s ease;
    
    &.st-add {
      background: rgba(0,0,0,0.04);
      color: var(--primary);
    }
    &.st-working {
      background: var(--primary-grad);
      color: #fff;
      box-shadow: 0 6rpx 16rpx var(--primary-shadow);
    }
    &.st-done {
      background: #F2F2F2;
      color: #B0B0B0;
    }
  }
}

/* 8. 快捷功能宫格 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx 0;
}
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  
  .q-icon-wrap {
    width: 90rpx;
    height: 90rpx;
    background: #F8F9FA;
    border-radius: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.2s;
    &:active { transform: scale(0.9); }
    
    .q-icon { font-size: 40rpx; }
  }
  
  .q-text {
    font-size: 22rpx;
    color: #7F8C8D;
    font-weight: 500;
  }
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

  .member-scroll {
    width: 100%;
    white-space: nowrap;
  }
  .member-list {
    display: inline-flex;
    gap: 30rpx;
    padding: 10rpx 0;
  }
  .member-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #F8F9FA;
    padding: 30rpx 40rpx;
    border-radius: 36rpx;
    min-width: 160rpx;
    position: relative;
    transition: all 0.3s;
    &:active { transform: scale(0.95); background: #F0F2F5; }
    
    .avatar-wrap {
      position: relative;
      margin-bottom: 16rpx;
      .m-avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        border: 4rpx solid #fff;
        box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
      }
      .edit-tag {
        position: absolute;
        right: -6rpx;
        bottom: -6rpx;
        background: var(--primary);
        color: #fff;
        width: 36rpx;
        height: 36rpx;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20rpx;
        border: 2rpx solid #fff;
      }
    }
    .m-nick {
      font-size: 28rpx;
      font-weight: bold;
      color: #2C3E50;
      margin-bottom: 8rpx;
    }
    .m-role {
      font-size: 20rpx;
      color: var(--primary);
      background: var(--primary-light);
      padding: 4rpx 16rpx;
      border-radius: 100rpx;
      transition: all 0.5s ease;
    }
  }
  
  .family-ops {
    margin-top: 30rpx;
    display: flex;
    justify-content: center;
    .exit-btn {
      font-size: 24rpx;
      color: #BDC3C7;
      text-decoration: underline;
      padding: 10rpx;
    }
  }
}

/* 邀请弹窗特有样式 */
.invite-modal {
  .invite-info {
    text-align: center;
    padding: 20rpx 0;
    
    .invite-desc {
      font-size: 26rpx;
      color: #7F8C8D;
      display: block;
      margin-bottom: 40rpx;
    }
    
    .invite-code-box {
      background: #F8F9FA;
      padding: 30rpx;
      border-radius: 24rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      border: 2rpx dashed var(--primary);
      
      .code-val {
        font-size: 48rpx;
        font-weight: 900;
        color: var(--primary);
        letter-spacing: 4rpx;
      }
      
      .copy-btn {
        font-size: 24rpx;
        color: #fff;
        background: var(--primary);
        padding: 10rpx 24rpx;
        border-radius: 100rpx;
        font-weight: bold;
      }
    }
    
    .invite-expire-tip {
      margin-bottom: 30rpx;
      color: #ccc;
      .expire-countdown {
        margin-left: 18rpx;
      }
    }
    
    .qr-placeholder {
      width: 280rpx;
      height: 280rpx;
      background: #fff;
      border: 2rpx solid #F0F2F5;
      border-radius: 30rpx;
      margin: 0 auto 30rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16rpx;
      color: #BDC3C7;
      font-size: 22rpx;
      
      .qr-icon { font-size: 80rpx; }
    }
  }
  
  .close-modal-btn.prim {
    background: var(--primary);
    color: #fff;
  }
}

.input-box {
  margin: 20rpx 0 40rpx;
  .join-input {
    background: #F8F9FA;
    height: 100rpx;
    border-radius: 24rpx;
    padding: 0 40rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #2C3E50;
    text-align: center;
  }
}

.modal-tips {
  font-size: 24rpx;
  color: #BDC3C7;
  text-align: center;
  margin-bottom: 40rpx;
}

.modal-btns {
  display: flex;
  gap: 30rpx;
  
  button {
    flex: 1;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 100rpx;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    &::after { border: none; }
  }
  
  .m-btn-sub {
    background: #F8F9FA;
    color: #7F8C8D;
  }
  
  .m-btn-main {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 8rpx 20rpx var(--primary-shadow);
  }
}

/* 9. 消费趋势卡片 */
.trend-section {
  .chart-box {
    background: #F8F9FA;
    border-radius: 30rpx;
    padding: 40rpx 20rpx 20rpx;
    height: 280rpx;
    display: flex;
    align-items: flex-end;
  }
  .chart-bars {
    display: flex;
    justify-content: space-around;
    width: 100%;
    height: 100%;
    align-items: flex-end;
  }
  .bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    flex: 1;
    height: 100%;
  }
  .bar-track {
    flex: 1;
    width: 20rpx;
    background: #EAECEF;
    border-radius: 20rpx;
    display: flex;
    align-items: flex-end;
    overflow: visible;
  }
  .bar-fill {
    width: 100%;
    background: var(--primary-grad);
    border-radius: 20rpx;
    position: relative;
    transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease;
    
    .bar-val {
      position: absolute;
      top: -36rpx;
      left: 50%;
      transform: translateX(-50%);
      font-size: 18rpx;
      color: #95A5A6;
      font-weight: bold;
    }
  }
  .bar-label {
    font-size: 22rpx;
    color: #7F8C8D;
  }
}

/* 5. 饮食偏好设置 */
.prefs-section {
  .pref-group {
    margin-bottom: 30rpx;
    &:last-child { margin-bottom: 0; }
    
    .p-label {
      font-size: 26rpx;
      color: #7F8C8D;
      display: block;
      margin-bottom: 20rpx;
    }
    
    .p-options {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
    }
    
    .p-tag {
      padding: 12rpx 32rpx;
      border-radius: 100rpx;
      background: #F8F9FA;
      color: #7F8C8D;
      font-size: 24rpx;
      font-weight: 500;
      border: 2rpx solid transparent;
      transition: all 0.3s;
      position: relative;
      
      &.active {
        background: var(--primary-light);
        color: var(--primary);
        border-color: var(--primary);
      }

      &.editing {
        animation: shake 0.5s infinite;
      }

      &.add-btn {
        border: 2rpx dashed #BDC3C7;
        background: transparent;
        color: #BDC3C7;
        padding: 12rpx 32rpx;
        .plus { font-size: 24rpx; font-weight: bold; }
      }

      .p-del {
        position: absolute;
        top: -12rpx;
        right: -12rpx;
        width: 32rpx;
        height: 32rpx;
        background: #FF4757;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20rpx;
        font-weight: 900;
        z-index: 10;
        box-shadow: 0 4rpx 8rpx rgba(255, 71, 87, 0.3);
      }
    }
  }
}

@keyframes shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1.5deg); }
  75% { transform: rotate(-1.5deg); }
  100% { transform: rotate(0deg); }
}

/* 12. 家庭备忘录入口 */
.health-section {
  background: #fff;
  border-radius: 48rpx;
  padding: 30rpx;
  
  .section-title {
    margin-bottom: 24rpx;
  }
  
  .health-card-body {
    .health-info-row {
      display: flex; align-items: center; justify-content: space-around;
      background: #fff; border-radius: 32rpx; padding: 30rpx; margin-bottom: 20rpx;
      
      .h-stat {
        display: flex; flex-direction: column; align-items: center; gap: 8rpx;
        .h-val { font-size: 36rpx; font-weight: 900; color: #2E7D32; }
        .h-label { font-size: 20rpx; color: #9E9E9E; }
      }
      .h-sep { width: 1rpx; height: 40rpx; background: #E0E0E0; }
    }
    
    .health-tip-box {
      display: flex; align-items: center; gap: 16rpx; padding: 0 10rpx;
      .h-tip-icon { font-size: 32rpx; }
      .h-tip-text { font-size: 22rpx; color: #9E9E9E; font-weight: 500; }
    }
  }
}

.memo-section {
  cursor: pointer;
  .memo-preview {
    background: #F8F9FA;
    padding: 24rpx;
    border-radius: 20rpx;
  }
  .memo-desc {
    font-size: 26rpx;
    color: #95A5A6;
  }
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
  height: 40rpx;
}
/* 底部点菜弹窗 */
.bottom-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  animation: fadeIn 0.3s ease;
}
.bottom-modal-content {
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx;
  min-height: 50vh;
  box-sizing: border-box;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
/* ============ 重构版点菜弹窗 ============ */


.big-image-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.65); /* 调浅背景以获得更通透的透光质感 */
  backdrop-filter: blur(15px); /* 加强毛玻璃，背景更加高级细腻 */
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
  
  .big-image-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx;
    
    .big-image {
      max-width: 80vw; /* 限制视口宽度，绝不顶头 */
      max-height: 60vh; /* 限制视口高度，绝不顶头 */
      border-radius: 32rpx; /* 高级优雅微圆角 */
      box-shadow: 0 24rpx 72rpx rgba(0, 0, 0, 0.35); /* 质感立体悬浮阴影 */
      border: 4rpx solid rgba(255, 255, 255, 0.15); /* 精致透亮白边框 */
    }
    
    .close-big-btn {
      margin-top: 48rpx; /* 布局在大图下方，防止顶到头，也更符合单手点击习惯 */
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 2rpx solid rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 40rpx;
      backdrop-filter: blur(5px);
      transition: all 0.2s;
      
      &:active {
        transform: scale(0.9);
        background: rgba(255, 255, 255, 0.35);
      }
    }
  }
}



/* --- 新增：密保找回设置表单样式 --- */
.security-form {
  margin-top: 10rpx;
  .sec-label {
    font-size: 26rpx;
    color: #888;
    margin-bottom: 12rpx;
  }
  .picker-value-box {
    background: #fff;
    border: 2rpx solid #EFEFEF;
    border-radius: 12rpx;
    height: 80rpx;
    padding: 0 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 28rpx;
    color: #333;
    transition: all 0.3s ease;
    
    &:active {
      background: #FAFAFA;
      border-color: var(--primary);
    }
  }
  .sec-input {
    background: #fff;
    border: 2rpx solid #EFEFEF;
    border-radius: 12rpx;
    height: 80rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: var(--primary);
      background: #FFFBFB;
    }
  }
}

/* --- 新增：开屏全屏数据找回页 SCSS 样式 --- */
.restore-splash-fullscreen {
  animation: splashFadeIn 0.4s ease-out both;
  
  .splash-step-container {
    animation: slideUpIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  
  .splash-btn-primary {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    &:active {
      transform: scale(0.97);
      opacity: 0.9;
    }
    
    &.disabled {
      background: #E2E8F0 !important;
      color: #A0AEC0 !important;
      box-shadow: none !important;
    }
  }
  
  .splash-btn-secondary {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    &:active {
      transform: scale(0.97);
      background: #F8F9FA;
    }
  }
  
  .abandon-btn {
    transition: opacity 0.3s;
    &:active {
      opacity: 0.6;
    }
  }
  
  .picker-value-box {
    transition: all 0.3s ease;
    &.disabled {
      background: #F5F5F5 !important;
      border-color: #E2E8F0 !important;
      color: #CBD5E0 !important;
    }
    &:active:not(.disabled) {
      background: #F0F4FA;
      border-color: var(--primary);
    }
  }
  
  .form-input {
    transition: all 0.3s ease;
    &:focus:not(:disabled) {
      border-color: var(--primary);
      background: #FFFBFB;
      box-shadow: 0 0 12rpx var(--primary-shadow);
    }
    &:disabled {
      background: #F5F5F5 !important;
      border-color: #E2E8F0 !important;
      color: #CBD5E0 !important;
    }
  }
}

@keyframes splashFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUpIn {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
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
          <image class="avatar" src="https://img-blog.csdnimg.cn/20240110133807328.png" mode="aspectFill" />
          <view class="name-box">
            <view class="family-name-wrap">
              <text class="family-name">{{ familyName }}</text>
              <view class="edit-icon-btn" @click="openEditFamilyName">
                <text class="e-icon">✏️</text>
              </view>
            </view>
            <text class="greeting">{{ greeting }}</text>
          </view>
        </view>
        <!-- <view class="weather-icon">
          <text class="emoji">🌤️</text>
          <text class="tip">宜煲汤</text>
        </view> -->
      </view>

      <!-- 日期与天气磨砂胶囊 (独立标签) -->
      <view class="glass-capsule-row">
        <view class="glass-capsule" @click="showCalendarPopup = true">
          <text class="c-text">{{ dateInfo.gregorian }}</text>
          <view class="c-divider"></view>
          <text class="c-text">{{ dateInfo.lunar }}</text>
        </view>
        <view class="glass-capsule" @click="openWeatherDetail">
          <text>{{ getWeatherEmoji(dateInfo.weatherIcon) }}</text>
          <text class="c-text">{{ dateInfo.weather }} {{ dateInfo.temp }}</text>
        </view>
      </view>
    </view>

    <view class="main-content">
      <!-- 4. 家庭成员 (挪到最上方) -->
      <view class="section members-section">
        <view class="section-title">
          <text class="title-text">家庭成员</text>
          <view class="title-actions">
            <text class="action-text secondary" @click="showJoinModal = true">加入</text>
            <text class="action-text" @click="openInvite">邀请</text>
          </view>
        </view>
        <scroll-view scroll-x class="member-scroll" :show-scrollbar="false">
          <view class="member-list">
            <view 
              class="member-card" 
              v-for="(m, idx) in members" 
              :key="idx"
              @click="handleMemberClick(m)"
            >
              <view class="avatar-wrap">
                <image class="m-avatar" :src="m.avatar" mode="aspectFill" />
                <view class="edit-tag" v-if="m.isSelf">✏️</view>
              </view>
              <text class="m-nick">{{ m.nick }}{{ m.isSelf ? ' (我)' : '' }}</text>
              <view class="m-role"><text>{{ m.role }}</text></view>
            </view>
          </view>
        </scroll-view>
        <view class="family-ops" v-if="members.length > 1">
          <text class="exit-btn" @click="leaveFamily">退出当前家庭</text>
        </view>
      </view>

      <!-- 13. 家庭健康管理入口 -->
      <view class="section health-section" @click="goToHealth">
        <view class="section-title">
          <text class="title-text">家庭健康管理</text>
          <text class="action-text">查看 ></text>
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


      <!-- 3. 今日三餐计划 -->
      <view class="section meals-section">
        <view class="section-title"><text class="title-text">今日三餐</text></view>
        <view class="meal-list">
          <view class="meal-item" v-for="(m, i) in meals" :key="i">
            <view class="m-left">
              <view class="m-icon-box"><text>{{ m.icon }}</text></view>
              <view class="m-info">
                <text class="m-name">{{ m.name }}</text>
                <text class="m-desc" :class="{ empty: !m.recipe }">{{ m.recipe || '尚未安排' }}</text>
              </view>
            </view>
            <view class="m-right">
              <view class="m-btn" :class="m.recipe ? 'primary' : 'add'">
                <text v-if="m.recipe">去制作</text>
                <text v-else class="btn-icon">+</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 12. 家庭备忘录入口 -->
      <view class="section memo-section" @click="goToMemo">
        <view class="section-title">
          <text class="title-text">家庭备忘录</text>
          <text class="action-text">查看 ></text>
        </view>
        <view class="memo-preview">
          <text class="memo-desc">记录家庭琐事、重要日子或购物心愿单...</text>
        </view>
      </view>

      <!-- 8. 快捷功能宫格 -->
      <view class="section quick-section">
        <view class="quick-grid">
          <view class="quick-item" v-for="(q, i) in quickFuncs" :key="i" @click="handleSetting(q.name)">
            <view class="q-icon-wrap"><text class="q-icon">{{ q.icon }}</text></view>
            <text class="q-text">{{ q.name }}</text>
          </view>
        </view>
      </view>

      <!-- 5. 饮食偏好设置 -->
      <view class="section prefs-section">
        <view class="section-title"><text class="title-text">饮食偏好</text></view>
        <view class="pref-group">
          <text class="p-label">全家口味 (长按管理)</text>
          <view class="p-options">
            <view 
              class="p-tag" 
              :class="{ active: prefs.taste === t, editing: isEditingTaste }" 
              v-for="t in tasteOptions" 
              :key="t" 
              @click.stop="selectTaste(t)"
              @longpress.stop="isEditingTaste = !isEditingTaste"
            >
              <text>{{ t }}</text>
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
            <view 
              class="p-tag" 
              :class="{ active: prefs.avoid.includes(a), editing: isEditingPrefs }" 
              v-for="a in prefs.avoid" 
              :key="a" 
              @click.stop="toggleAvoid(a)"
              @longpress.stop="isEditingPrefs = !isEditingPrefs"
            >
              <text>{{ a }}</text>
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
      <view class="modal-mask" v-if="showAddTasteModal" @click="showAddTasteModal = false">
        <view class="modal-content" @click.stop>
          <text class="modal-title">添加口味偏好</text>
          <view class="input-box">
            <input class="join-input" v-model="newTaste" placeholder="输入口味名称，如：麻辣" focus />
          </view>
          <view class="modal-btns">
            <button class="m-btn-sub" @click="showAddTasteModal = false">取消</button>
            <button class="m-btn-main" @click="confirmAddTaste">添加</button>
          </view>
        </view>
      </view>

      <!-- 添加忌口弹窗 -->
      <view class="modal-mask" v-if="showAddAvoidModal" @click="showAddAvoidModal = false">
        <view class="modal-content" @click.stop>
          <text class="modal-title">添加忌口食材</text>
          <view class="input-box">
            <input class="join-input" v-model="newAvoid" placeholder="输入食材名称，如：生姜" focus />
          </view>
          <view class="modal-btns">
            <button class="m-btn-sub" @click="showAddAvoidModal = false">取消</button>
            <button class="m-btn-main" @click="confirmAddAvoid">添加</button>
          </view>
        </view>
      </view>

      <!-- 9. 消费趋势卡片 -->
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

      <!-- 6. 主题切换 -->
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

      <!-- 11. 底部设置模块 -->
      <view class="bottom-settings">
        <view class="set-list">
          <!-- <view class="set-item" @click="handleSetting('分类设置')">
            <text class="set-icon">🏷️</text>
            <text class="set-text">分类设置</text>
            <text class="set-arrow">></text>
          </view> -->
          <view class="set-item">
            <text class="set-icon" @click="handleClearCache">🧹</text>
            <text class="set-text">清除缓存</text>
            <text class="set-arrow">></text>
          </view>
          <view class="set-item">
            <text class="set-icon">📖</text>
            <text class="set-text">使用帮助</text>
            <text class="set-arrow">></text>
          </view>
          <view class="set-item">
            <text class="set-icon">💬</text>
            <text class="set-text">意见反馈</text>
            <text class="set-arrow">></text>
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
      <view class="modal-mask" v-if="showInviteModal" @click="showInviteModal = false">
        <view class="modal-content invite-modal" @click.stop>
          <text class="modal-title">邀请家人加入</text>
          <view class="invite-info">
            <text class="invite-desc">让家人扫描二维码或输入邀请码</text>
            <view class="invite-code-box">
              <text class="code-val">{{ inviteCode }}</text>
              <text class="copy-btn" @click="copyCode">复制</text>
            </view>
            <view class="qr-placeholder">
              <text class="qr-icon">📱</text>
              <text>扫码加入家庭</text>
            </view>
          </view>
          <button class="close-modal-btn prim" @click="showInviteModal = false">完成</button>
        </view>
      </view>

      <!-- 加入弹窗 -->
      <view class="modal-mask" v-if="showJoinModal" @click="showJoinModal = false">
        <view class="modal-content" @click.stop>
          <text class="modal-title">加入新家庭</text>
          <view class="input-box">
            <input class="join-input" v-model="joinCode" placeholder="请输入邀请码" />
          </view>
          <view class="modal-tips">加入后将同步该家庭的所有数据</view>
          <view class="modal-btns">
            <button class="m-btn-sub" @click="showJoinModal = false">取消</button>
            <button class="m-btn-main" @click="confirmJoin">加入</button>
          </view>
        </view>
      </view>

      <!-- 修改家庭名称弹窗 -->
      <view class="modal-mask" v-if="showFamilyNameModal" @click="showFamilyNameModal = false">
        <view class="modal-content" @click.stop>
          <text class="modal-title">修改家庭名称</text>
          <view class="input-box">
            <input class="join-input" v-model="tempFamilyName" placeholder="请输入新名称" maxlength="15" />
          </view>
          <view class="modal-btns">
            <button class="m-btn-sub" @click="showFamilyNameModal = false">取消</button>
            <button class="m-btn-main" @click="saveFamilyName">保存</button>
          </view>
        </view>
      </view>

      <!-- 修改昵称弹窗 -->
      <view class="modal-mask" v-if="showNickModal" @click="showNickModal = false">
        <view class="modal-content" @click.stop>
          <text class="modal-title">修改我的昵称</text>
          <view class="input-box">
            <input class="join-input" v-model="tempNick" placeholder="请输入新昵称" />
          </view>
          <view class="modal-btns">
            <button class="m-btn-sub" @click="showNickModal = false">取消</button>
            <button class="m-btn-main" @click="confirmNick">保存</button>
          </view>
        </view>
      </view>

      <!-- 分类管理弹窗 -->
      <view class="modal-mask" v-if="showCatModal" @click="showCatModal = false">
        <view class="modal-content" @click.stop>
          <text class="modal-title">管理分类</text>
          <view class="cat-manage-list">
            <view class="cat-manage-item" v-for="(cat, idx) in categories" :key="idx">
              <text>{{ cat }}</text>
              <text class="del-cat" @click="removeCategory(idx)">删除</text>
            </view>
          </view>
          <view class="add-cat-box">
            <input class="add-cat-input" v-model="newCat" placeholder="新分类名称" />
            <view class="add-cat-btn" @click="addCategory">添加</view>
          </view>
          <button class="close-modal-btn" @click="showCatModal = false">完成</button>
        </view>
      </view>

      <view class="footer-safe"></view>
    </view>
    <!-- 天气详情弹窗 -->
    <weather-popup 
      :show="showWeatherPopup" 
      :location="weatherLocation" 
      @close="showWeatherPopup = false" 
    />
    <calendar-popup 
      :show="showCalendarPopup" 
      @close="showCalendarPopup = false"
    />

    <!-- 智能管家提醒详情弹窗 -->
    <view class="modal-mask" v-if="showReminderModal" @click="showReminderModal = false">
      <view class="modal-content reminder-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">🤖 智能管家提醒</text>
          <text class="modal-subtitle">为您整理了 {{ reminders.length }} 条待办事项</text>
        </view>
        
        <scroll-view scroll-y class="reminder-detail-list">
          <view class="detail-item" v-for="(r, i) in reminders" :key="i" :class="r.type">
            <view class="d-left">
              <view class="d-icon">{{ r.icon }}</view>
              <view class="d-info">
                <text class="d-text">{{ r.text }}</text>
                <text class="d-type-name">{{ r.type === 'warning' ? '库存预警' : (r.type === 'danger' ? '过期提醒' : '健康建议') }}</text>
              </view>
            </view>
            <view class="d-action-btn" @click="handleReminderAction(r)">{{ r.action }}</view>
          </view>
        </scroll-view>
        
        <button class="close-reminder-btn" @click="showReminderModal = false">我知道了</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/common/request.js'
import eatCo from '@/common/localDB.js'
import weatherPopup from '@/components/weather-popup/weather-popup.vue'
import calendarPopup from '@/components/calendar-popup/calendar-popup.vue'
const familyName = ref(uni.getStorageSync('family_name') || '快乐干饭小家')
const familyId = ref(uni.getStorageSync('family_id') || 'default_family')

// 天气/日历弹窗控制
const weatherLocation = ref('')
const showWeatherPopup = ref(false)
const showCalendarPopup = ref(false)
const showReminderModal = ref(false)

// 家庭名称修改
const showFamilyNameModal = ref(false)
const tempFamilyName = ref('')

const openEditFamilyName = () => {
  tempFamilyName.value = familyName.value
  showFamilyNameModal.value = true
}

const saveFamilyName = () => {
  if (!tempFamilyName.value.trim()) {
    return uni.showToast({ title: '名称不能为空', icon: 'none' })
  }
  familyName.value = tempFamilyName.value.trim()
  uni.setStorageSync('family_name', familyName.value)
  showFamilyNameModal.value = false
}

// 家庭成员功能
const showInviteModal = ref(false)
const showJoinModal = ref(false)
const showNickModal = ref(false)
const inviteCode = ref('EAT' + Math.random().toString(36).substr(2, 6).toUpperCase())
const joinCode = ref('')
const tempNick = ref('')

const openInvite = () => {
  // 重新生成一个随机码模拟
  inviteCode.value = 'EAT' + Math.random().toString(36).substr(2, 6).toUpperCase()
  showInviteModal.value = true
}

const copyCode = () => {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => uni.showToast({ title: '复制成功' })
  })
}

const confirmJoin = () => {
  if (!joinCode.value) return uni.showToast({ title: '请输入邀请码', icon: 'none' })
  uni.showToast({ title: '成功加入家庭' })
  showJoinModal.value = false
  // 模拟数据同步逻辑
  refreshStats()
}

const handleMemberClick = (m) => {
  if (m.isSelf) {
    tempNick.value = m.nick
    showNickModal.value = true
  }
}

const confirmNick = () => {
  const self = members.value.find(m => m.isSelf)
  if (self) {
    self.nick = tempNick.value
    uni.showToast({ title: '昵称已更新' })
  }
  showNickModal.value = false
}

const leaveFamily = () => {
  uni.showModal({
    title: '退出提醒',
    content: '确定要退出当前家庭吗？退出后将无法查看该家庭数据。',
    confirmColor: '#FF4D4F',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已退出家庭' })
        // 重置为个人模式
        members.value = members.value.filter(m => m.isSelf)
        refreshStats()
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

const refreshStats = async () => {
  try {
    const fId = familyId.value
    const [stocks, shops, costs, recipes] = await Promise.all([
      eatCo.getStockList(fId),
      eatCo.getShopList(fId),
      eatCo.getCostList(fId),
      eatCo.getRecipeList(fId)
    ])

    // 1. 食材总数
    stats.value[0].num = stocks.length
    
    // 2. 待采购
    stats.value[1].num = shops.filter(s => !s.done).length
    
    // 3. 本月花费
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const monthCosts = costs.filter(c => c.date && c.date.startsWith(monthKey))
    const totalSpent = monthCosts.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0)
    stats.value[2].num = Math.round(totalSpent)
    budget.value.spent = Math.round(totalSpent)

    // 4. 收藏菜谱
    stats.value[3].num = recipes.filter(r => r.favorite).length

    // 5. 自动算一些趣味数据 (如常吃食材)
    if (stocks.length > 0) {
      stats.value[5].num = stocks[0].name
    }
  } catch (e) {
    console.error('统计加载失败', e)
  }
}

let lastUpdateDate = ''
onShow(() => {
  refreshStats()
  const today = new Date().toDateString()
  if (lastUpdateDate !== today) {
    initDateWeather()
    lastUpdateDate = today
  }
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

// 三餐
const meals = ref([
  { name: '早餐', icon: '🥛', recipe: '燕麦牛奶 + 葱香小煎蛋' },
  { name: '午餐', icon: '🍱', recipe: '番茄炒蛋 + 红烧肉' },
  { name: '晚餐', icon: '🥗', recipe: '' }
])

// 快捷功能
const quickFuncs = ref([
  { icon: '🎲', name: '随机推荐' },
  { icon: '🧺', name: '补齐食材' },
  { icon: '🗑️', name: '清空购物车' },
  { icon: '💵', name: '清空花费' },
  { icon: '🧹', name: '清理数据' },
  { icon: '📤', name: '导出清单' },
  { icon: '📥', name: '导入食材' },
  { icon: '📊', name: '月度账单' }
])

// 家庭成员
const members = ref([
  { nick: '爸爸', role: '大主厨', avatar: 'https://pic.rmb.bdstatic.com/bjh/240813/dump/2f9e7e45efdb1b9134b9c9af309ffe33.png', isSelf: true },
  { nick: '妈妈', role: '采购总监', avatar: 'https://pic.rmb.bdstatic.com/bjh/240813/dump/2f9e7e45efdb1b9134b9c9af309ffe33.png', isSelf: false },
  { nick: '宝宝', role: '干饭人', avatar: 'https://pic.rmb.bdstatic.com/bjh/240813/dump/2f9e7e45efdb1b9134b9c9af309ffe33.png', isSelf: false }
])

// 消费趋势
const trends = ref({
  '一': 120, '二': 45, '三': 180, '四': 0, '五': 80, '六': 150, '日': 110
})

// 偏好
const prefs = ref({
  taste: '适中',
  avoid: ['海鲜', '羊肉', '香菜', '葱', '蒜', '辣']
})
const tasteOptions = ref(['清淡', '适中', '重口'])
const isEditingPrefs = ref(false)
const isEditingTaste = ref(false)
const showAddAvoidModal = ref(false)
const showAddTasteModal = ref(false)
const newAvoid = ref('')
const newTaste = ref('')

const selectTaste = (t) => {
  if (isEditingTaste.value) return
  prefs.value.taste = t
}

const openAddTasteModal = () => {
  newTaste.value = ''
  showAddTasteModal.value = true
}

const confirmAddTaste = () => {
  const val = newTaste.value.trim()
  if (!val) return
  if (tasteOptions.value.includes(val)) {
    return uni.showToast({ title: '已在列表中', icon: 'none' })
  }
  tasteOptions.value.push(val)
  showAddTasteModal.value = false
}

const removeTaste = (t) => {
  tasteOptions.value = tasteOptions.value.filter(x => x !== t)
  if (prefs.value.taste === t) prefs.value.taste = tasteOptions.value[0] || ''
  if (tasteOptions.value.length === 0) isEditingTaste.value = false
}

const toggleAvoid = (a) => {
  if (isEditingPrefs.value) return // 编辑模式下不触发切换
  if (prefs.value.avoid.includes(a)) {
    prefs.value.avoid = prefs.value.avoid.filter(x => x !== a)
  } else {
    prefs.value.avoid.push(a)
  }
}

const openAddAvoidModal = () => {
  newAvoid.value = ''
  showAddAvoidModal.value = true
}

const confirmAddAvoid = () => {
  const val = newAvoid.value.trim()
  if (!val) return
  if (prefs.value.avoid.includes(val)) {
    return uni.showToast({ title: '已在列表中', icon: 'none' })
  }
  prefs.value.avoid.push(val)
  showAddAvoidModal.value = false
}

const removeAvoid = (a) => {
  prefs.value.avoid = prefs.value.avoid.filter(x => x !== a)
  if (prefs.value.avoid.length === 0) isEditingPrefs.value = false
}

// 分类管理
const showCatModal = ref(false)
const categories = ref([])
const newCat = ref('')

const loadCategories = () => {
  categories.value = uni.getStorageSync('ingredient_categories') || ['蔬菜', '水果', '肉蛋', '水产', '调料', '其他']
}

const addCategory = () => {
  if (!newCat.value.trim()) return
  if (categories.value.includes(newCat.value.trim())) {
    return uni.showToast({ title: '分类已存在', icon: 'none' })
  }
  categories.value.push(newCat.value.trim())
  newCat.value = ''
  uni.setStorageSync('ingredient_categories', categories.value)
}

const removeCategory = (idx) => {
  categories.value.splice(idx, 1)
  uni.setStorageSync('ingredient_categories', categories.value)
}

const handleSetting = (name) => {
  // if (name === '分类设置') {
  //   loadCategories()
  //   showCatModal.value = true
  // } else {
  //   uni.showToast({ title: `功能「${name}」开发中...`, icon: 'none' })
  // }
  uni.showToast({ title: `功能「${name}」开发中...`, icon: 'none' })
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
  uni.navigateTo({ url: '/pages/family/memo' })
}

const goToHealth = () => {
  console.log('Attempting to navigate to health page...')
  uni.navigateTo({ 
    url: '/pages/family/health',
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

const handleReminderClick = () => {
  showReminderModal.value = true
}

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
}

.weather-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,255,255,0.2);
  padding: 16rpx 20rpx;
  border-radius: 30rpx;
  backdrop-filter: blur(10px);
  
  .emoji {
    font-size: 40rpx;
    margin-bottom: 4rpx;
  }
  .tip {
    font-size: 18rpx;
    font-weight: bold;
  }
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
  z-index: 30;
  
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
  .meal-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }
  .meal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-radius: 30rpx;
    border: 2rpx solid #F0F2F5;
    background: #fff;
    
    .m-left {
      display: flex;
      align-items: center;
      gap: 24rpx;
      flex: 1;
      
      .m-icon-box {
        width: 80rpx;
        height: 80rpx;
        border-radius: 24rpx;
        background: #F8F9FA;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 40rpx;
      }
      
      .m-info {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        
        .m-name {
          font-size: 28rpx;
          font-weight: 800;
          color: #2C3E50;
        }
        .m-desc {
          font-size: 24rpx;
          color: #7F8C8D;
          &.empty {
            color: #BDC3C7;
          }
        }
      }
    }
    
    .m-right {
      .m-btn {
        padding: 12rpx 30rpx;
        border-radius: 100rpx;
        font-size: 24rpx;
        font-weight: bold;
        
        &.primary {
          background: var(--primary);
          color: #fff;
        }
        &.add {
          background: var(--primary-light);
          padding: 12rpx 20rpx;
          .btn-icon { font-size: 28rpx; }
        }
      }
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
      margin-bottom: 50rpx;
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
  // background: #F0F9F4; // 浅绿色背景
  background: #fff;
  border-radius: 48rpx;
  padding: 30rpx;
  
  .section-title {
    margin-bottom: 24rpx;
    // .title-text { color: #2E7D32; }
    // .action-text { color: #4CAF50; }
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
</style>
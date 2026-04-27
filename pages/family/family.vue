<template>
  <view class="page-container" :style="themeStyle">
    <!-- 1. 顶部大卡片 -->
    <view class="top-card">
      <view class="top-header">
        <view class="user-info">
          <image class="avatar" src="https://img-blog.csdnimg.cn/20240110133807328.png" mode="aspectFill" />
          <view class="name-box">
            <input class="family-name" v-model="familyName" @blur="saveFamilyName" placeholder="输入家庭名称" />
            <text class="greeting">{{ greeting }}</text>
          </view>
        </view>
        <view class="weather-icon">
          <text class="emoji">🌤️</text>
          <text class="tip">宜煲汤</text>
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

      <!-- 5. 饮食偏好设置 -->
      <view class="section prefs-section">
        <view class="section-title"><text class="title-text">饮食偏好</text></view>
        <view class="pref-group">
          <text class="p-label">全家口味</text>
          <view class="p-options">
            <view 
              class="p-tag" 
              :class="{ active: prefs.taste === t }" 
              v-for="t in ['清淡', '适中', '重口']" 
              :key="t" 
              @click="prefs.taste = t"
            >
              <text>{{ t }}</text>
            </view>
          </view>
        </view>
        <view class="pref-group">
          <text class="p-label">忌口不吃 (多选)</text>
          <view class="p-options">
            <view 
              class="p-tag" 
              :class="{ active: prefs.avoid.includes(a) }" 
              v-for="a in ['海鲜', '羊肉', '香菜', '葱', '蒜', '辣']" 
              :key="a" 
              @click="toggleAvoid(a)"
            >
              <text>{{ a }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 11. 底部设置模块 -->
      <view class="bottom-settings">
        <view class="set-list">
          <view class="set-item" @click="handleSetting('分类设置')">
            <text class="set-icon">🏷️</text>
            <text class="set-text">分类设置</text>
            <text class="set-arrow">></text>
          </view>
          <view class="set-item">
            <text class="set-icon">🧹</text>
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
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const eatCo = uniCloud.importObject('eat-co')
const familyName = ref(uni.getStorageSync('family_name') || '快乐干饭小家')
const familyId = ref(uni.getStorageSync('family_id') || 'default_family')

// 监听名称修改并保存
const saveFamilyName = () => {
  uni.setStorageSync('family_name', familyName.value)
  // 此处应同步到云端
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
else if (hour < 12) greetingStr = '上午好，今天也要好好吃饭'
else if (hour < 14) greetingStr = '中午好，午餐吃得开心吗'
else if (hour < 19) greetingStr = '下午好，构思一下今晚的大餐吧'
const greeting = ref(greetingStr)

// 主题系统
const themes = [
  { name: '温柔粉', color: '#FF8DA1', gradient: 'linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%)', light: '#FFF5F7', shadow: 'rgba(255,141,161,0.2)' },
  { name: '清新绿', color: '#68CBA6', gradient: 'linear-gradient(135deg, #8EE0C0 0%, #68CBA6 100%)', light: '#F2FBF7', shadow: 'rgba(104,203,166,0.2)' },
  { name: '雾霾蓝', color: '#7AA3ED', gradient: 'linear-gradient(135deg, #9CBDF5 0%, #7AA3ED 100%)', light: '#F3F7FE', shadow: 'rgba(122,163,237,0.2)' },
  { name: '暖杏黄', color: '#F5B96B', gradient: 'linear-gradient(135deg, #FAD699 0%, #F5B96B 100%)', light: '#FEFAF3', shadow: 'rgba(245,185,107,0.2)' }
]
const currentTheme = ref(uni.getStorageSync('current_theme') || 0)
const switchTheme = (idx) => {
  currentTheme.value = idx
  uni.setStorageSync('current_theme', idx)
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

onShow(() => {
  refreshStats()
})

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
  { nick: '爸爸', role: '大主厨', avatar: 'https://img-blog.csdnimg.cn/20240110133807328.png', isSelf: true },
  { nick: '妈妈', role: '采购总监', avatar: 'https://img-blog.csdnimg.cn/20240110133807328.png', isSelf: false },
  { nick: '宝宝', role: '干饭人', avatar: 'https://img-blog.csdnimg.cn/20240110133807328.png', isSelf: false }
])

// 消费趋势
const trends = ref({
  '一': 120, '二': 45, '三': 180, '四': 0, '五': 80, '六': 150, '日': 110
})

// 偏好
const prefs = ref({
  taste: '适中',
  avoid: ['香菜', '辣']
})
const toggleAvoid = (a) => {
  if (prefs.value.avoid.includes(a)) {
    prefs.value.avoid = prefs.value.avoid.filter(x => x !== a)
  } else {
    prefs.value.avoid.push(a)
  }
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
  if (name === '分类设置') {
    loadCategories()
    showCatModal.value = true
  } else {
    uni.showToast({ title: `功能「${name}」开发中...`, icon: 'none' })
  }
}
</script>

<style lang="less" scoped>
.page-container {
  background-color: #F6F7F9;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 1. 顶部大卡片 */
.top-card {
  height: 380rpx;
  background: var(--primary-grad);
  border-radius: 0 0 60rpx 60rpx;
  padding: 60rpx 40rpx 0;
  box-shadow: 0 16rpx 40rpx var(--primary-shadow);
  color: #fff;
  position: relative;
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
      gap: 8rpx;
      
      .family-name {
        font-size: 38rpx;
        font-weight: 900;
        color: #fff;
        height: 50rpx;
        text-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
      }
      
      .greeting {
        font-size: 24rpx;
        color: rgba(255,255,255,0.9);
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
      font-size: 20rpx;
      font-weight: bold;
    }
  }
}

/* 主体内边距调整 */
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
      
      &.active {
        background: var(--primary-light);
        color: var(--primary);
        border-color: var(--primary);
      }
    }
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
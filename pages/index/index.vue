<template>
  <!-- 老用户治愈系冷启动3s广告开屏组件 -->
  <welcome-ad :show="showWelcomeAd" @close="closeWelcomeAd" />

  <view class="page" :style="themeStyle" v-if="hasFamily">
    <gourmet-refresher :refreshing="refreshing" type="index" :theme="currentTheme" />
    <!-- 顶部标题 -->
    <view class="header">
      <view class="title-wrap">
        <text class="main-title">🍓 今天吃什么</text>
        <view class="badge"><text>绝不纠结</text></view>
      </view>
      <text class="sub-title">别纠结啦，交给我来决定～</text>
    </view>

    <!-- 随机抽菜卡片模块 -->
    <view class="random-card"
      :class="{ 'breathe-anim': !isRolling }"
      @touchstart="onTouchStart"
      @touchmove.stop.prevent
      @touchend="onTouchEnd"
    >
      <view class="random-bg"></view>
      
      <!-- 庆祝小金币/花瓣/Emoji粒子飘落彩蛋 -->
      <view v-if="isCelebrating" class="celebration-particles">
        <view v-for="(p, index) in particles" :key="index" class="particle" :style="p.style">
          {{ p.emoji }}
        </view>
      </view>

      <!-- 场景指示器 -->
      <view class="scene-indicator">
        <text class="scene-icon">{{ currentSceneObj.icon }}</text>
        <text class="scene-label">{{ currentSceneObj.label }}</text>
        <view class="scene-dots">
          <view v-for="s in scenes" :key="s.type" class="scene-dot" :class="{ active: currentScene === s.type }"></view>
        </view>
      </view>

      <text class="dish-label">{{ rollTip }}</text>
      
      <view class="result-wrap">
        <text class="dish-text" :class="{ 'dish-big': result !== '点击开始抽菜～', 'bounce-anim': isCelebrating }">{{ result }}</text>
        <!-- 抽中后的温柔治愈文案 -->
        <text v-if="result !== '点击开始抽菜～' && !isRolling" class="result-warm-tips">{{ currentResultPhrase }}</text>
      </view>

      <text class="swipe-hint">← 滑动切换场景 →</text>
      
      <button class="btn-round" :class="{ 'btn-shake': isBtnShaking }" hover-class="btn-hover" @click="getRandomDish">
        🎲 帮我选一个！
      </button>
      
      <!-- 极为低调雅致的自定义抽菜池小字链接 -->
      <text class="manage-pool-link" @click.stop="showRandomMenuModal = true">✨ 自定义抽菜池</text>
    </view>

    <!-- 底部引导文案 / 小装饰 -->
    <!-- <view class="footer-decoration">
      <view class="line"></view>
      <text class="footer-tips">{{ currentWarmPhrase }}</text>
      <text class="footer-sub">💡 每一个认真吃饭的日子，都是在好好爱自己 ✨</text>
      <view class="decor-dots">
        <text class="dot"></text>
        <text class="dot active"></text>
        <text class="dot"></text>
      </view>
    </view> -->
    <!-- 抽中结果的精美单独展示弹窗 -->
    <view class="modal-mask flex-center" v-if="showResultModal" @click="showResultModal = false">
      <view class="modal-card result-show-card" @click.stop>
        <!-- 主题精致小顶签 -->
        <view class="theme-top-badge">
          {{ currentSceneObj.icon }} 今日美味已生成
        </view>
        <view class="card-close" @click="showResultModal = false">✕</view>
        
        <!-- 卡片图片展示区 -->
        <view class="card-img-wrap">
          <image class="card-share-img" :src="shareImgPath" mode="widthFix" :show-menu-by-longpress="true" />
          <text class="longpress-tip" v-if="shareImgPath">💡 长按卡片可以直接保存或发送哦</text>
        </view>
        
        <!-- 海报风格选择切换：横向滑动胶囊滤镜栏 -->
        <scroll-view class="style-scroll" scroll-x="true" :show-scrollbar="false">
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 0 }"
            @click="changePosterStyle(0)"
          >
            经典渐变
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 1 }"
            @click="changePosterStyle(1)"
          >
            拍立得文艺
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 2 }"
            @click="changePosterStyle(2)"
          >
            可爱卡通
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 3 }"
            @click="changePosterStyle(3)"
          >
            黑金食堂
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 4 }"
            @click="changePosterStyle(4)"
          >
            温馨手账
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 5 }"
            @click="changePosterStyle(5)"
          >
            法式气质
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 6 }"
            @click="changePosterStyle(6)"
          >
            像素街机
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 7 }"
            @click="changePosterStyle(7)"
          >
            绿野仙踪
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 8 }"
            @click="changePosterStyle(8)"
          >
            国潮朱砂
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 9 }"
            @click="changePosterStyle(9)"
          >
            落日橘海
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 10 }"
            @click="changePosterStyle(10)"
          >
            盐系极简
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 11 }"
            @click="changePosterStyle(11)"
          >
            蒸汽电子
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 12 }"
            @click="changePosterStyle(12)"
          >
            和风浮世
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 13 }"
            @click="changePosterStyle(13)"
          >
            美式波普
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 14 }"
            @click="changePosterStyle(14)"
          >
            魔法占卜
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 15 }"
            @click="changePosterStyle(15)"
          >
            太空宇航
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 16 }"
            @click="changePosterStyle(16)"
          >
            复古迪斯科
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 17 }"
            @click="changePosterStyle(17)"
          >
            中世纪手稿
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 18 }"
            @click="changePosterStyle(18)"
          >
            夏日果冻
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 19 }"
            @click="changePosterStyle(19)"
          >
            中式水墨
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 20 }"
            @click="changePosterStyle(20)"
          >
            怪诞拼贴
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 21 }"
            @click="changePosterStyle(21)"
          >
            Lofi插画
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 22 }"
            @click="changePosterStyle(22)"
          >
            未来工业
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 23 }"
            @click="changePosterStyle(23)"
          >
            童话森林
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 24 }"
            @click="changePosterStyle(24)"
          >
            埃及法老
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 25 }"
            @click="changePosterStyle(25)"
          >
            粉彩独角兽
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 26 }"
            @click="changePosterStyle(26)"
          >
            复古报纸
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 27 }"
            @click="changePosterStyle(27)"
          >
            万圣惊魂
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 28 }"
            @click="changePosterStyle(28)"
          >
            梦幻星云
          </view>
          <view 
            class="style-tab" 
            :class="{ active: activePosterStyle === 29 }"
            @click="changePosterStyle(29)"
          >
            巴黎午后
          </view>
        </scroll-view>
        
        <view class="modal-actions">
          <!-- #ifdef MP-WEIXIN -->
          <button class="action-btn share-btn" @click="shareCardImage">
            <text class="btn-icon">💌</text> 发送卡片给好友
          </button>
          <!-- <button class="action-btn save-btn" @click="saveCardToAlbum">
            <text class="btn-icon">💾</text> 保存海报到相册
          </button> -->
          <!-- #endif -->
          
          <!-- #ifndef MP-WEIXIN -->
          <button class="action-btn share-btn" @click="copyShareContent">
            <text class="btn-icon">📋</text> 复制分享文案
          </button>
          <!-- #endif -->
          
          <button class="action-btn confirm-btn" @click="addToTodayPlan">
            <text class="btn-icon">🍳</text> 放入今日计划
          </button>
        </view>
      </view>
    </view>

    <!-- 隐藏 Canvas 绘制海报组件 -->
    <share-poster 
      ref="sharePosterRef"
      :themeColor="themes[currentTheme].color"
      :result="result"
      :sceneIcon="currentSceneObj.icon"
      :sceneLabel="currentSceneObj.label"
      :phrase="currentResultPhrase"
      :dateStr="todayDateString"
    />

    <!-- 随机抽菜池管理弹窗 -->
    <view class="modal-mask flex-center " v-if="showRandomMenuModal" @click="showRandomMenuModal = false">
      <view class="modal-card config-modal" @click.stop style="padding: 40rpx; width: 620rpx; margin-top: 0; align-items: stretch; display: flex; flex-direction: column; box-sizing: border-box;">
        <text class="modal-title" style="margin-bottom: 20rpx; font-size: 34rpx; font-weight: 800; color: #2C3E50; text-align: center;">抽菜池配置</text>
        
        <!-- 场景 Tab 切换 -->
        <view class="scene-tabs">
          <view
            class="scene-tab"
            v-for="tab in sceneTabs"
            :key="tab.type"
            :class="{ active: activeType === tab.type }"
            @click="activeType = tab.type"
          >
            <text class="tab-icon">{{ tab.icon }}</text>
            <text class="tab-label">{{ tab.label }}</text>
          </view>
        </view>

        <scroll-view scroll-y style="max-height: 460rpx; margin-top: 24rpx; margin-bottom: 16rpx;" :show-scrollbar="false">
          <view class="cat-manage-list">
            <view class="cat-manage-item" v-for="(dish, idx) in filteredMenu" :key="dish.id || idx">
              <text class="dish-name-text">{{ dish.name || dish }}</text>
              <text class="del-cat" @click="removeRandomDish(dish)">删除</text>
            </view>
            <view class="cat-manage-item empty-tip" v-if="filteredMenu.length === 0" style="justify-content: center; color: #999; font-size: 24rpx; border-bottom: none;">
              <text>该分类暂无菜品~</text>
            </view>
          </view>
        </scroll-view>

        <view class="add-cat-box">
          <input class="add-cat-input" v-model="newRandomDish" :placeholder="'新增' + sceneTabs.find(t => t.type === activeType).label + '菜品'" cursor-spacing="40" />
          <view class="add-cat-btn" @click="addRandomDish">添加</view>
        </view>
        
        <button class="close-modal-btn" @click="showRandomMenuModal = false" style="margin-top: 20rpx;">完成</button>
      </view>
    </view>

    <custom-tabbar />
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onShow, onPullDownRefresh, onShareAppMessage } from '@dcloudio/uni-app'
import familyApi from '@/common/api/family.js'
import welcomeAd from '@/pages/welcome/welcome-ad.vue'
import sharePoster from '@/components/share-poster/share-poster.vue'

const familyCode = ref(uni.getStorageSync('family_code') || 'default_family')

// --- 随机抽菜池配置自治管理 ---
const showRandomMenuModal = ref(false)
const newRandomDish = ref('')
const activeType = ref('做饭') // 默认自己做

// 场景 tab 配置
const sceneTabs = [
  { label: '自己做', type: '做饭', icon: '🍳' },
  { label: '外卖',   type: '外卖', icon: '🛫' },
  { label: '出去吃', type: '堂食', icon: '🏪' }
]

// 过滤后的随机菜池（弹框管理中展示用）
const filteredMenu = computed(() => {
  return randomMenuPool.value.filter(dish => {
    const t = dish.type
    if (activeType.value === '做饭') return !t || t === '做饭' || t === 'manual'
    return t === activeType.value
  })
})

const addRandomDish = async () => {
  const val = newRandomDish.value.trim()
  if (!val) return
  const exists = randomMenuPool.value.some(dish => (dish.name || dish) === val)
  if (exists) {
    return uni.showToast({ title: '菜品已在池中', icon: 'none' })
  }
  const dishJson = { name: val, type: activeType.value }
  try {
    await familyApi.saveFamilyRecipePoolItem(familyCode.value, dishJson)
    uni.showToast({ title: '添加成功', icon: 'none' })
    newRandomDish.value = ''
    loadRandomMenuPool()
  } catch (e) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

const removeRandomDish = async (dish) => {
  if (!dish.id) {
    uni.showToast({ title: '默认菜品无法删除', icon: 'none' })
    return
  }
  uni.showModal({
    title: '确认删除',
    content: `确定要从抽菜池删除“${dish.name}”吗？`,
    confirmText: '删除',
    confirmColor: '#FF4D6D',
    success: async (res) => {
      if (res.confirm) {
        try {
          await familyApi.deleteFamilyRecipePoolItem(dish.id)
          uni.showToast({ title: '已删除', icon: 'none' })
          loadRandomMenuPool()
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// 监听弹框开启，刷新菜单池
watch(showRandomMenuModal, (newVal) => {
  if (newVal) {
    loadRandomMenuPool()
  }
})
const showResultModal = ref(false)
const shareImgPath = ref('')
const sharePosterRef = ref(null)
const activePosterStyle = ref(0)

const changePosterStyle = async (styleIndex) => {
  if (activePosterStyle.value === styleIndex) return
  activePosterStyle.value = styleIndex
  
  uni.showLoading({ title: '生成新样式中...', mask: true })
  try {
    const path = await sharePosterRef.value.draw(styleIndex)
    if (path) {
      shareImgPath.value = path
    }
  } catch (e) {
    console.error('生成海报新样式失败:', e)
  } finally {
    uni.hideLoading()
  }
}

const todayDateString = computed(() => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const dayName = dayNames[d.getDay()]
  return `${year}年${month}月${date}日 ${dayName}`
})

const getTodayDateStr = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

const addToTodayPlan = async () => {
  const code = familyCode.value
  if (!code) return
  
  const hour = new Date().getHours()
  let mealName = '晚餐'
  if (hour < 10) {
    mealName = '早餐'
  } else if (hour < 14) {
    mealName = '午餐'
  }
  
  uni.showLoading({ title: '正在放入计划...', mask: true })
  try {
    const dateStr = getTodayDateStr()
    
    // 1. 安全获取最新主餐计划，避免 404 或无数据报错阻断保存
    let serverMeals = []
    try {
      const getRes = await familyApi.getDailyMeals(code, dateStr)
      if (getRes && getRes.data) {
        serverMeals = getRes.data.meals || getRes.data || []
        if (!Array.isArray(serverMeals)) {
          serverMeals = []
        }
      }
    } catch (getErr) {
      console.log('今日云端尚无三餐安排，初始化新三餐', getErr)
    }
    
    // 初始化标准的包含三个餐次的完整结构
    const finalMeals = [
      { meal_name: '早餐', done: 0, recipes: [] },
      { meal_name: '午餐', done: 0, recipes: [] },
      { meal_name: '晚餐', done: 0, recipes: [] }
    ]
    
    // 用获取到的数据回填
    finalMeals.forEach(fm => {
      const match = serverMeals.find(sm => (sm.mealName || sm.meal_name || sm.name) === fm.meal_name)
      if (match) {
        fm.recipes = match.recipes || []
        fm.done = (match.done === true || match.done === 1 || match.done === '1') ? 1 : 0
      }
    })
    
    // 追加本次抽中的菜品
    let currentMealItem = finalMeals.find(fm => fm.meal_name === mealName)
    if (currentMealItem) {
      if (!currentMealItem.recipes.includes(result.value)) {
        currentMealItem.recipes.push(result.value)
      }
    }
    
    // 2. 同步保存主餐计划至云端 (包含完整三个餐次)
    await familyApi.saveDailyMeals(code, dateStr, finalMeals)
    
    // 3. 同时将其作为“本次临时安排”保存至云端临时菜品池
    try {
      await familyApi.addDailyTempRecipe(code, dateStr, mealName, result.value)
    } catch (tempErr) {
      console.error('同步临时安排云端失败:', tempErr)
    }
    
    // 4. 同步更新临时池本地缓存
    const tempCacheKey = 'daily_temp_pool_' + dateStr
    let localTempPool = uni.getStorageSync(tempCacheKey) || {}
    if (!localTempPool[mealName]) {
      localTempPool[mealName] = []
    }
    if (!localTempPool[mealName].includes(result.value)) {
      localTempPool[mealName].push(result.value)
      uni.setStorageSync(tempCacheKey, localTempPool)
    }

    // 5. 同步更新主餐计划本地缓存
    const localMealsKey = 'daily_meals_' + dateStr
    let localMeals = uni.getStorageSync(localMealsKey)
    if (!localMeals) {
      localMeals = [
        { name: '早餐', icon: '🥛', recipes: [], done: false },
        { name: '午餐', icon: '🍱', recipes: [], done: false },
        { name: '晚餐', icon: '🥗', recipes: [], done: false }
      ]
    }
    let lmItem = localMeals.find(m => m.name === mealName)
    if (lmItem) {
      if (!lmItem.recipes.includes(result.value)) {
        lmItem.recipes.push(result.value)
      }
    }
    uni.setStorageSync(localMealsKey, localMeals)
    uni.setStorageSync('daily_meals', { date: dateStr, data: localMeals })
    
    // 6. 广播全局通知，强制家庭页面三餐安排刷新
    uni.$emit('refresh-meals')
    
    uni.showToast({ title: `已放入今日${mealName}与临时安排`, icon: 'success' })
    showResultModal.value = false
  } catch (err) {
    console.error('放入三餐计划失败:', err)
    uni.showToast({ title: '添加失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const copyShareContent = () => {
  const text = `今天吃什么？我的决定是：【${result.value}】！${currentResultPhrase.value} —— 来自 EatEat`
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '文案已复制，快去分享吧！', icon: 'success' })
    }
  })
}

// 一键保存到相册
const saveCardToAlbum = () => {
  if (!shareImgPath.value) {
    uni.showToast({ title: '海报生成中，请稍后再试', icon: 'none' })
    return
  }
  uni.saveImageToPhotosAlbum({
    filePath: shareImgPath.value,
    success: () => {
      uni.showToast({ title: '海报已保存到相册', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '保存失败，请检查相册授权', icon: 'none' })
    }
  })
}

// 调用微信官方弹出分享图片菜单，直接发送纯图片海报给好友，免除小程序跳转
const shareCardImage = () => {
  if (!shareImgPath.value) {
    uni.showToast({ title: '海报生成中，请稍后再试', icon: 'none' })
    return
  }
  // #ifdef MP-WEIXIN
  uni.showShareImageMenu({
    path: shareImgPath.value,
    fail: (err) => {
      console.log('分享图片菜单调起失败或用户取消', err)
    }
  })
  // #endif
  // #ifndef MP-WEIXIN
  copyShareContent()
  // #endif
}

onShareAppMessage(() => {
  return {
    title: `今天吃什么？我的决定是：【${result.value}】！`,
    path: `/pages/index/index?family_code=${familyCode.value}`,
    imageUrl: shareImgPath.value || ''
  }
})
const hasFamily = ref(!!uni.getStorageSync('family_code'))

const refreshing = ref(false)

onPullDownRefresh(async () => {
  refreshing.value = true
  familyCode.value = uni.getStorageSync('family_code') || 'default_family'
  try {
    await Promise.all([
      loadRandomMenuPool(),
      new Promise(resolve => setTimeout(resolve, 1500)) // 魔法煎蛋锅动画时间
    ])
  } catch (e) {
    console.error(e)
  } finally {
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
})

// 老用户冷启动开屏广告/欢迎页
const showWelcomeAd = ref(false)
let hasShownWelcomeAd = false // 局部持久状态，保证本小程序实例周期内仅首次展示

const closeWelcomeAd = () => {
  showWelcomeAd.value = false
  hasFamily.value = true
}

const defaultMenu = [
  '番茄炒蛋', '可乐鸡翅', '青椒肉丝', '蒜蓉西兰花',
  '红烧肉', '酸辣土豆丝', '水煮肉片', '香菇滑鸡', '蛋炒饭',
  '粉蒸排骨', '糖醋里脊', '麻婆豆腐', '手撕包菜', '清炒菜心'
]
const result = ref('点击开始抽菜～')

// 随机推荐池动态配置
const randomMenuPool = ref([]) // 存储完整 dish 对象 { name, type }
const loadRandomMenuPool = async () => {
  const res = await familyApi.getFamilyRecipePoolItems(familyCode.value)
  const dishes = res?.data?.dishes || []
  randomMenuPool.value = dishes.length > 0
    ? dishes
    : defaultMenu.map(name => ({ name, type: '做饭' }))
}

// 场景配置
const scenes = [
  { type: '做饭', label: '自己做', icon: '🍳', tip: '亲手下厨真好吃' },
  { type: '外卖', label: '叫外卖', icon: '🛫', tip: '躺平等外卖卷到家' },
  { type: '堂食', label: '出去吃', icon: '🏪', tip: '出门觅吃一顿吧' },
  { type: 'all',  label: '随机混合', icon: '🎲', tip: '天知道今天吃啥' }
]
const currentScene = ref('做饭')
const currentSceneObj = computed(() => scenes.find(s => s.type === currentScene.value) || scenes[0])

// 按场景过滤抽菜池
const activePool = computed(() => {
  if (currentScene.value === 'all') return randomMenuPool.value.map(d => d.name || d)
  return randomMenuPool.value.filter(d => {
    const t = d.type
    if (currentScene.value === '做饭') return !t || t === '做饭' || t === 'manual'
    return t === currentScene.value
  }).map(d => d.name || d)
})

// 滑动切换场景
let touchStartX = 0
const onTouchStart = (e) => { touchStartX = e.touches[0].clientX }
const onTouchEnd = (e) => {
  if (isRolling.value) return
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) < 40) return
  const idx = scenes.findIndex(s => s.type === currentScene.value)
  if (dx < 0 && idx < scenes.length - 1) {
    currentScene.value = scenes[idx + 1].type
    result.value = '点击开始抽菜～'
  } else if (dx > 0 && idx > 0) {
    currentScene.value = scenes[idx - 1].type
    result.value = '点击开始抽菜～'
  }
}

// 主题系统
const themes = [
  { name: '温柔粉', color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.2)' },
  { name: '清新绿', color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.2)' },
  { name: '雾霾蓝', color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.2)' },
  { name: '暖杏黄', color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.2)' }
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

// 治愈系动效控制状态
const isRolling = ref(false)
const isCelebrating = ref(false)
const isBtnShaking = ref(false)
const particles = ref([])
const rollTip = ref('✨ 今日推荐 ✨')

const warmPhrases = [
  '生活的温柔，大都藏在热气腾腾的食物里。🐾',
  '如果抽到的不合心意，那就再试一次，顺从内心的声音～ ✨',
  '无论是独自享受，还是与爱的人分享，都要吃得饱饱的呀。💖',
  '纠结结束啦！带上好心情，开启美味的一天吧～ 🍒',
  '热汤、软饭、还有最懂你的菜，今天也要吃得开心！🍃'
]
const currentWarmPhrase = ref('')

const resultPhrases = [
  '今天就吃它啦，简单又好吃～ 🍳',
  '热气腾腾的食物，最能抚平一日疲惫 ✨',
  '听胃的话，今天就吃这个啦 💖',
  '绝妙的选择！这就去准备吧 🐾',
  '元气满满的一餐，要认真吃完哦 🌟',
  '胃口大开！今天一定是美味的一天 🍒',
  '让美食治愈今天的心情吧 🍃'
]
const currentResultPhrase = ref('今天就吃它啦，简单又好吃～ 🍳')

// 触发按钮轻轻晃动
const triggerBtnShake = () => {
  isBtnShaking.value = true
  setTimeout(() => {
    isBtnShaking.value = false
  }, 800)
}

// 飘洒可爱 Emoji 樱桃/草莓/爱心/星星粒子
const generateParticles = () => {
  const emojis = ['🍓', '🍒', '🌟', '✨', '💖', '🍳', '🍋', '🍇', '🧁']
  const newParticles = []
  Array.from({ length: 12 }).forEach(() => {
    const angle = Math.random() * 2 * Math.PI
    const distance = 120 + Math.random() * 160
    const tx = `${Math.cos(angle) * distance}rpx`
    const ty = `${Math.sin(angle) * distance}rpx`
    const rot = `${Math.random() * 360}deg`
    const delay = `${Math.random() * 0.15}s`
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]
    
    newParticles.push({
      emoji,
      style: `
        --tx: ${tx};
        --ty: ${ty};
        --rot: ${rot};
        animation-delay: ${delay};
      `
    })
  })
  particles.value = newParticles
}

// 定时微摆晃动定时器
let shakeTimer = null

onShow(() => {
  uni.hideTabBar({ animation: false })
  const code = uni.getStorageSync('family_code')
  currentWarmPhrase.value = warmPhrases[Math.floor(Math.random() * warmPhrases.length)]

  // 开启定时晃动
  if (shakeTimer) clearInterval(shakeTimer)
  shakeTimer = setInterval(() => {
    if (!isRolling.value) {
      triggerBtnShake()
    }
  }, 5000)

  if (!code) {
    hasFamily.value = false
    uni.reLaunch({
      url: '/pages/welcome/welcome'
    })
    return
  }
  
  hasFamily.value = true
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  familyCode.value = code
  loadRandomMenuPool() // 进入页面拉取最新的自定义随机推荐池数据
})

const getRandomDish = () => {
  if (isRolling.value) return
  // 现居场景的候选池，为空则 fallback 到 defaultMenu
  const pool = activePool.value.length > 0
    ? activePool.value
    : defaultMenu

  isRolling.value = true
  isCelebrating.value = false
  rollTip.value = '正在为你挑选美味... 🍳'
  
  triggerBtnShake()

  let times = 0
  let timer = setInterval(() => {
    times++
    const i = Math.floor(Math.random() * pool.length)
    result.value = pool[i]
    if (times > 12) {
      clearInterval(timer)
      isRolling.value = false
      isCelebrating.value = true
      rollTip.value = '叮咚！今日首选 🌟'
      
      currentResultPhrase.value = resultPhrases[Math.floor(Math.random() * resultPhrases.length)]
      generateParticles()
      
      // 1.2秒后关闭庆祝效果，后台生成高清图片卡片后滑入精美展示弹窗
      setTimeout(async () => {
        isCelebrating.value = false
        uni.showLoading({ title: '生成精致卡片中...', mask: true })
        try {
          const path = await sharePosterRef.value.draw(activePosterStyle.value)
          shareImgPath.value = path
        } catch (e) {
          console.error(e)
        } finally {
          uni.hideLoading()
        }
        showResultModal.value = true
      }, 1200)
    }
  }, 80)
}
</script>

<style lang="less" scoped>
.page {
  padding: 40rpx 40rpx 180rpx 40rpx;
  min-height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(180deg, var(--primary-light) 0%, #FFFFFF 100%);
  transition: background 0.4s ease;
}

.header {
  margin: 120rpx 0 60rpx;
  .title-wrap {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
  }
  .main-title {
    font-size: 52rpx;
    font-weight: 800;
    color: #333;
    letter-spacing: 2rpx;
  }
  .badge {
    background: var(--primary-grad);
    color: #fff;
    font-size: 20rpx;
    padding: 6rpx 16rpx;
    border-radius: 20rpx 20rpx 20rpx 0;
    margin-left: 20rpx;
    font-weight: bold;
    transform: translateY(-8rpx);
    box-shadow: 0 4rpx 10rpx var(--primary-shadow);
  }
  .sub-title {
    font-size: 28rpx;
    color: #888;
    font-weight: 500;
  }
}

.random-card {
  position: relative;
  background: var(--primary-grad);
  border-radius: 48rpx;
  padding: 100rpx 40rpx;
  text-align: center;
  box-shadow: 0 16rpx 40rpx var(--primary-shadow);
  margin-bottom: 40rpx;
  overflow: visible; /* 为了飘洒花瓣特效不被裁剪 */
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  .random-bg {
    position: absolute;
    right: -40rpx;
    top: -40rpx;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255,255,255,0.08);
    border-radius: 50%;
  }

  .dish-label {
    display: block;
    color: rgba(255,255,255,0.85);
    font-size: 26rpx;
    margin-bottom: 30rpx;
    letter-spacing: 4rpx;
    font-weight: bold;
  }
  .result-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200rpx;
  }
  .dish-text {
    font-size: 44rpx;
    color: #fff;
    font-weight: 500;
    transition: all 0.3s;
    display: block;
  }
  .dish-big {
    font-size: 64rpx;
    font-weight: bold;
    text-shadow: 0 6rpx 16rpx rgba(0,0,0,0.1);
  }
  .btn-round {
    background: #fff;
    color: var(--primary);
    border-radius: 100rpx;
    font-size: 32rpx;
    font-weight: bold;
    padding: 0 80rpx;
    height: 96rpx;
    line-height: 96rpx;
    margin-top: 60rpx;
    display: inline-block;
    box-shadow: 0 10rpx 24rpx rgba(0,0,0,0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    &::after { border: none; }
  }
  .btn-hover {
    transform: scale(0.95);
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
  }
}

/* 呼吸动效 */
.breathe-anim {
  animation: cardBreathe 4s ease-in-out infinite;
}
@keyframes cardBreathe {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 16rpx 40rpx var(--primary-shadow);
  }
  50% {
    transform: scale(1.015);
    box-shadow: 0 24rpx 50rpx var(--primary-shadow);
  }
}

/* 按钮轻微晃动 */
.btn-shake {
  animation: btnWobble 0.8s ease;
}
@keyframes btnWobble {
  0%, 100% { transform: scale(1) rotate(0); }
  15% { transform: scale(1.04) rotate(-3deg); }
  30% { transform: scale(1.04) rotate(3deg); }
  45% { transform: scale(1.02) rotate(-1.5deg); }
  60% { transform: scale(1.02) rotate(1.5deg); }
  75% { transform: scale(1.01) rotate(-0.5deg); }
  90% { transform: scale(1.01) rotate(0.5deg); }
}

/* 文字弹跳 */
.bounce-anim {
  animation: resultBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes resultBounce {
  0% { transform: scale(0.6); }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* 庆祝粒子飘洒 */
.celebration-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 50;
}
.particle {
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 40rpx;
  will-change: transform, opacity;
  animation: particleExplode 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
}
@keyframes particleExplode {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(1.2) rotate(var(--rot));
    opacity: 0;
  }
}

/* 温柔治愈的反馈文字 */
.result-warm-tips {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 20rpx;
  display: block;
  animation: fadeInTips 0.8s ease forwards;
  font-weight: 500;
}
@keyframes fadeInTips {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 底部引导文案 / 小装饰 */
.footer-decoration {
  margin-top: 20rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 20rpx;
  
  .line {
    width: 60rpx;
    height: 6rpx;
    background: var(--primary-light);
    border-radius: 10rpx;
    margin-bottom: 30rpx;
    opacity: 0.8;
  }
  .footer-tips {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 16rpx;
    padding: 0 40rpx;
    font-weight: 500;
    text-align: center;
  }
  .footer-sub {
    font-size: 22rpx;
    color: #bbb;
    letter-spacing: 1rpx;
  }
  .decor-dots {
    display: flex;
    gap: 12rpx;
    margin-top: 40rpx;
    .dot {
      width: 10rpx;
      height: 10rpx;
      background: #EAEAEA;
      border-radius: 50%;
      &.active {
        background: var(--primary);
        width: 30rpx;
        border-radius: 10rpx;
        transition: all 0.3s;
      }
    }
  }
}
/* 场景指示器 */
.scene-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;

  .scene-icon { font-size: 40rpx; }

  .scene-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 700;
    letter-spacing: 2rpx;
  }

  .scene-dots {
    display: flex;
    gap: 10rpx;
    margin-top: 4rpx;

    .scene-dot {
      width: 10rpx;
      height: 10rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.35);
      transition: all 0.3s;

      &.active {
        width: 28rpx;
        border-radius: 10rpx;
        background: rgba(255, 255, 255, 0.9);
      }
    }
  }
}

/* 滑动切换提示 */
.swipe-hint {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 1rpx;
  margin-bottom: 20rpx;
  display: block;
}

/* 精美单独展示弹窗 */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.65) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  animation: modalFadeIn 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.result-show-card {
  width: 620rpx;
  background: #ffffff;
  border-radius: 54rpx;
  padding: 85rpx 40rpx 50rpx 40rpx;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
  /* 柔和的双重光晕主题投影，彻底解决灰色死阴影生硬问题 */
  box-shadow: 0 16rpx 48rpx rgba(0,0,0,0.04), 0 32rpx 80rpx -16rpx var(--primary-shadow);
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  animation: cardSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  
  .theme-top-badge {
    position: absolute;
    top: -26rpx;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary-light);
    color: var(--primary);
    padding: 10rpx 36rpx;
    border-radius: 100rpx;
    font-size: 22rpx;
    font-weight: 800;
    letter-spacing: 1rpx;
    box-shadow: 0 8rpx 24rpx var(--primary-shadow);
    border: 3rpx solid #ffffff;
    z-index: 10;
  }
  
  .card-close {
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    font-size: 30rpx;
    color: #bbb;
    z-index: 100;
    width: 54rpx;
    height: 54rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #F8F9FA;
    transition: all 0.25s ease;
    &:active {
      transform: scale(0.88);
      background: #EAEAEA;
    }
  }
  
  .card-img-wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40rpx;
    
    .card-share-img {
      width: 100%;
      border-radius: 36rpx;
      box-shadow: 0 16rpx 36rpx rgba(0, 0, 0, 0.05);
      background: #fafafa;
      transition: opacity 0.4s ease, transform 0.4s ease;
      opacity: 0.95;
      
      &[src=""] {
        opacity: 0;
        transform: scale(0.97);
      }
    }
    
    .longpress-tip {
      font-size: 22rpx;
      color: #a0aec0;
      margin-top: 18rpx;
      font-weight: 600;
      letter-spacing: 1rpx;
    }
  }

  .style-scroll {
    white-space: nowrap;
    width: 100%;
    margin: -15rpx 0 30rpx 0;
    padding: 10rpx 0;
    
    .style-tab {
      display: inline-block;
      padding: 12rpx 32rpx;
      margin-right: 16rpx;
      font-size: 22rpx;
      color: #718096;
      font-weight: bold;
      background: #F4F6F8;
      border-radius: 100rpx;
      border: 1px solid rgba(255, 255, 255, 0.8);
      transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
      
      &:first-child {
        margin-left: 36rpx;
      }
      
      &:last-child {
        margin-right: 36rpx;
      }
      
      &.active {
        background: var(--primary);
        color: #ffffff;
        box-shadow: 0 6rpx 16rpx var(--primary-shadow);
        border-color: transparent;
      }
    }
  }
  
  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    position: relative;
    z-index: 2;
    width: 100%;
    
    .action-btn {
      width: 100%;
      height: 94rpx;
      line-height: 94rpx;
      border-radius: 100rpx;
      font-size: 28rpx;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12rpx;
      border: none;
      transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
      letter-spacing: 1rpx;
      &::after { border: none; }
      
      &:active {
        transform: scale(0.96) translateY(2rpx);
        opacity: 0.92;
      }
    }
    
    .share-btn {
      background: var(--primary-light);
      color: var(--primary);
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.01);
      &:active {
        background: var(--primary-light);
        opacity: 0.8;
      }
    }
    
    .save-btn {
      background: #F5F7FA;
      color: #666;
    }
    
    .confirm-btn {
      background: var(--primary-grad);
      color: #fff;
      box-shadow: 0 12rpx 30rpx var(--primary-shadow);
      &:active {
        box-shadow: 0 4rpx 12rpx var(--primary-shadow);
      }
    }
  }
}

@keyframes cardSlideUp {
  from { transform: translateY(80rpx) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

/* 自定义抽菜池小链接 */
.manage-pool-link {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 18rpx;
  text-decoration: underline;
  letter-spacing: 1rpx;
  text-align: center;
  transition: all 0.2s;
  display: block;
  font-weight: 500;
  
  &:active {
    opacity: 0.85;
    color: rgba(255, 255, 255, 0.95);
  }
}

/* 场景配置弹窗内部样式 */
.config-modal {
  background: #ffffff;
  border-radius: 20rpx;
  .scene-tabs {
    display: flex;
    gap: 16rpx;
    margin-top: 10rpx;
  }
  
  .scene-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
    padding: 16rpx 0;
    border-radius: 20rpx;
    background: #F5F6F7;
    transition: all 0.2s;
    
    .tab-icon { font-size: 30rpx; }
    .tab-label { font-size: 22rpx; color: #999; font-weight: 500; }
    
    &.active {
      background: var(--primary-light, #FFE8EE);
      .tab-label { color: var(--primary, #FF6B8B); font-weight: 700; }
    }
    
    &:active { transform: scale(0.95); }
  }
  
  .cat-manage-list {
    display: flex;
    flex-direction: column;
    
    .cat-manage-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 2rpx solid #F5F6F7;
      font-size: 28rpx;
      color: #2C3E50;
      
      .dish-name-text {
        font-weight: 500;
      }
      
      .del-cat {
        font-size: 24rpx;
        color: #FF4D6D;
        font-weight: bold;
        padding: 6rpx 16rpx;
        &:active {
          opacity: 0.7;
        }
      }
    }
  }
  
  .add-cat-box {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
    margin-bottom: 30rpx;
    
    .add-cat-input {
      flex: 1;
      height: 80rpx;
      background: #F8F9FA;
      border-radius: 20rpx;
      padding: 0 30rpx;
      font-size: 28rpx;
      color: #2C3E50;
      text-align: left;
    }
    
    .add-cat-btn {
      width: 140rpx;
      height: 80rpx;
      background: var(--primary);
      color: #fff;
      font-size: 28rpx;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20rpx;
      box-shadow: 0 8rpx 16rpx var(--primary-shadow);
      &:active {
        transform: scale(0.95);
        opacity: 0.9;
      }
    }
  }
}

.close-modal-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: #F5F6F7;
  color: #7F8C8D;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 100rpx;
  margin-top: 10rpx;
  border: none;
  &::after { border: none; }
  &:active {
    background: #EAEAEA;
  }
}
</style>
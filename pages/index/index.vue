<template>
  <!-- 老用户治愈系冷启动3s广告开屏组件 -->
  <welcome-ad :show="showWelcomeAd" @close="closeWelcomeAd" />

  <view class="page" :style="themeStyle" v-if="hasFamily">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="title-wrap">
        <text class="main-title">🍓 今天吃什么</text>
        <view class="badge"><text>绝不纠结</text></view>
      </view>
      <text class="sub-title">别纠结啦，交给我来决定～</text>
    </view>

    <!-- 随机抽菜卡片模块 -->
    <view class="random-card" :class="{ 'breathe-anim': !isRolling }">
      <view class="random-bg"></view>
      
      <!-- 庆祝小金币/花瓣/Emoji粒子飘落彩蛋 -->
      <view v-if="isCelebrating" class="celebration-particles">
        <view v-for="(p, index) in particles" :key="index" class="particle" :style="p.style">
          {{ p.emoji }}
        </view>
      </view>

      <text class="dish-label">{{ rollTip }}</text>
      
      <view class="result-wrap">
        <text class="dish-text" :class="{ 'dish-big': result !== '点击开始抽菜～', 'bounce-anim': isCelebrating }">{{ result }}</text>
        <!-- 抽中后的温柔治愈文案 -->
        <text v-if="result !== '点击开始抽菜～' && !isRolling" class="result-warm-tips">今天就吃它啦，简单又好吃～</text>
      </view>
      
      <button class="btn-round" :class="{ 'btn-shake': isBtnShaking }" hover-class="btn-hover" @click="getRandomDish">
        🎲 帮我选一个！
      </button>
    </view>

    <!-- 底部引导文案 / 小装饰 -->
    <view class="footer-decoration">
      <view class="line"></view>
      <text class="footer-tips">{{ currentWarmPhrase }}</text>
      <text class="footer-sub">💡 每一个认真吃饭的日子，都是在好好爱自己 ✨</text>
      <view class="decor-dots">
        <text class="dot"></text>
        <text class="dot active"></text>
        <text class="dot"></text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import familyApi from '@/common/api/family.js'
import welcomeAd from '@/pages/welcome/welcome-ad.vue'

const familyCode = ref(uni.getStorageSync('family_code') || 'default_family')
const hasFamily = ref(!!uni.getStorageSync('family_code'))

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
const randomMenuPool = ref([])
const loadRandomMenuPool = async () => {
  const res = await familyApi.getFamilyRecipePoolItems(familyCode.value)
  randomMenuPool.value = res?.data?.dishes.map(dish => dish.name) || defaultMenu
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
  for (let i = 0; i < 12; i++) {
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
  }
  particles.value = newParticles
}

// 定时微摆晃动定时器
let shakeTimer = null

onShow(() => {
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
  let pool = [...randomMenuPool.value]

  if (pool.length === 0) {
    return uni.showToast({ title: '抽菜池为空，请去设置添加', icon: 'none' })
  }

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
      
      generateParticles()
      
      // 1.5秒后关闭庆祝效果
      setTimeout(() => {
        isCelebrating.value = false
      }, 1500)
    }
  }, 80)
}

// 遵循“没用到的地方不要修改”，保留这些未使用的跳转函数，防止外部依赖报错或以后调用
const goToStock = () => uni.switchTab({ url: '/pages/stock/stock' })
const goToShop = () => uni.switchTab({ url: '/pages/shop/shop' })
const goToRecipe = () => uni.switchTab({ url: '/pages/recipe/recipe' })
const goToCost = () => uni.navigateTo({ url: '/pages/cost/cost' })
</script>

<style lang="less" scoped>
.page {
  padding: 40rpx;
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
  margin-bottom: 80rpx;
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
  margin-top: 60rpx;
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
</style>
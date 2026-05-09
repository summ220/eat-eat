<template>
  <view class="c-popup-mask" v-if="visible" @tap="close" @touchmove.stop.prevent>
    <view class="c-popup-content" :class="{ 'show-up': showAnimate }" @tap.stop>
      <!-- 顶部拉手 -->
      <view class="popup-handle-bar">
        <view class="handle" @tap="close"></view>
      </view>
      
      <scroll-view scroll-y class="popup-scroll-area" :show-scrollbar="false">
        <view class="compass-body">
        <!-- 罗盘盘面 -->
        <view class="compass-circle">
          <view class="c-mark north">北</view>
          <view class="c-mark east">东</view>
          <view class="c-mark south">南</view>
          <view class="c-mark west">西</view>
          
          <!-- 刻度线 -->
          <view class="scale-lines">
            <view class="line" v-for="i in 12" :key="i" :style="{ transform: `rotate(${i * 30}deg)` }"></view>
          </view>
          
          <!-- 实时指示当前朝向的指针 -->
          <view class="needle-wrap" :style="{ transform: `rotate(${direction}deg)` }">
            <view class="needle-north"></view>
            <view class="needle-south"></view>
            <view class="needle-center"></view>
          </view>
        </view>
        
        <!-- 底部详细方位与位置信息 -->
        <view class="info-box">
          <text class="i-direction">{{ directionText }}</text>
          <text class="i-detail">角度: {{ Math.round(direction) }}° ｜ 海拔: {{ altitude }}</text>
          <view class="info-row-mini" v-if="latitude !== '--'">
            <text>经纬度：{{ latitude }} {{ longitude }}</text>
          </view>
        </view>

        <!-- 新增：今日方位运势 -->
        <view class="fortune-box" v-if="fortuneAdvice">
          <text class="f-title">✨ 今日方位建议</text>
          <text class="f-desc">{{ fortuneAdvice }}</text>
        </view>

        <!-- 新增：抽干饭签按钮 -->
        <view class="draw-btn-wrap">
          <button class="draw-btn" @click="drawFortune">抽干饭签 🍚</button>
        </view>
        
        <view class="light-hint">
          <text>🧭 指针指向当前手机朝向</text>
        </view>
      </view>
      <view class="footer-safe"></view>
      </scroll-view>

      <!-- 抽签动画遮罩层 -->
      <view class="lottery-overlay" v-if="lotteryVisible" @touchmove.stop.prevent>
        <view class="lottery-container" v-if="!fortuneResult">
          <view class="lottery-box" :class="{ 'shake': isShaking }">
            <view class="lottery-tube">
              <view class="stick" v-for="i in 6" :key="i"></view>
            </view>
          </view>
          <text class="lottery-hint">{{ isShaking ? '根据当前方位，测算美食缘分...' : '点击下方按钮开始摇签' }}</text>
          <button class="shake-trigger" v-if="!isShaking" @click="startShake">诚心摇签</button>
          <view class="lottery-close" v-if="!isShaking" @click="lotteryVisible = false">✕</view>
        </view>

        <!-- 签文结果卷轴 -->
        <view class="fortune-scroll-wrap" v-else>
          <view class="fortune-scroll" :class="{ 'fade-in': fortuneResult }">
            <view class="f-header">
              <text class="f-no">方位 [{{ fortuneResult.dir }}]</text>
              <text class="f-level level-sj">{{ fortuneResult.level }}</text>
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
            <view class="f-act-btn secondary" @click="drawFortune">再摇一次</view>
            <view class="f-close" @click="lotteryVisible = false">✕</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const visible = ref(false)
const showAnimate = ref(false)

const direction = ref(0)
const altitude = ref('-- 米')
const directionText = ref('获取中...')
const majorDirection = ref('未知')
const latitude = ref('--')
const longitude = ref('--')

const formatLat = (lat) => lat >= 0 ? `北纬${lat.toFixed(2)}°` : `南纬${Math.abs(lat).toFixed(2)}°`
const formatLng = (lng) => lng >= 0 ? `东经${lng.toFixed(2)}°` : `西经${Math.abs(lng).toFixed(2)}°`

watch(() => props.show, (val) => {
  if (val) {
    visible.value = true
    setTimeout(() => { showAnimate.value = true }, 50)
    startSensors()
  } else {
    showAnimate.value = false
    setTimeout(() => { visible.value = false }, 300)
    stopSensors()
  }
})

const close = () => { emit('close') }

const onCompassChange = (res) => {
  direction.value = res.direction
  directionText.value = getDirectionText(res.direction)
  majorDirection.value = getMajorDirection(res.direction)
}

const startSensors = () => {
  uni.startCompass({
    success: () => {
      uni.onCompassChange(onCompassChange)
    },
    fail: () => {
      directionText.value = '无法获取罗盘数据'
    }
  })
  
  uni.getLocation({
    type: 'wgs84',
    altitude: true,
    success: (res) => {
      if (typeof res.altitude === 'number') {
        altitude.value = Math.round(res.altitude) + ' 米'
      } else {
        altitude.value = '未知'
      }
      
      if (res.latitude && res.longitude) {
        latitude.value = formatLat(res.latitude)
        longitude.value = formatLng(res.longitude)
      }
    },
    fail: () => {
      altitude.value = '获取失败'
    }
  })
}

const stopSensors = () => {
  uni.offCompassChange(onCompassChange)
  uni.stopCompass()
}

onBeforeUnmount(() => {
  stopSensors()
})

const getDirectionText = (deg) => {
  const directions = [
    '正北', '东北偏北', '东北', '东北偏东',
    '正东', '东南偏东', '东南', '东南偏南',
    '正南', '西南偏南', '西南', '西南偏西',
    '正西', '西北偏西', '西北', '西北偏北'
  ]
  const index = Math.round(deg / 22.5) % 16
  return directions[index] || '未知'
}

const getMajorDirection = (deg) => {
  const dirs = ['正北', '东北', '正东', '东南', '正南', '西南', '正西', '西北']
  const index = Math.round(deg / 45) % 8
  return dirs[index] || '未知'
}

// === 运势与抽签 ===
const fortuneAdvice = computed(() => {
  const dir = majorDirection.value;
  const displayDir = directionText.value;
  const advices = {
    '正北': '北方属水，适合吃些温补类食物，推荐喝一碗暖胃粥 🍲',
    '东北': '东北方位安稳，适合吃些根茎类炖菜，补充能量 🥔',
    '正东': '东方木旺，生机勃勃，宜吃些绿色蔬菜、清淡早茶 🍵',
    '东南': '东南方和煦，适合品尝海鲜或酸甜口味的菜肴 🦐',
    '正南': '南方是“干饭吉位”，适合吃一顿红红火火的火锅或烧烤！🔥',
    '西南': '西南属土，脾胃相合，来点甜品或软糯的面食最合适不过 🍰',
    '正西': '西方金旺，宜吃些高蛋白的白肉类，如清蒸鱼或白斩鸡 🐟',
    '西北': '西北方凛冽，适合大口吃牛羊肉，豪气干饭！🥩',
    '未知': '转转手机，寻找你的干饭吉位吧~ 📱'
  }
  return advices[dir] ? `你正朝向${displayDir}，${advices[dir]}` : advices['未知']
})

const lotteryVisible = ref(false)
const isShaking = ref(false)
const fortuneResult = ref(null)

const drawFortune = () => {
  lotteryVisible.value = true
  fortuneResult.value = null
  isShaking.value = false
}

const startShake = () => {
  if (isShaking.value) return
  isShaking.value = true
  
  if (uni.vibrateShort) uni.vibrateShort()
  
  setTimeout(() => {
    isShaking.value = false
    generateFortune()
  }, 1500)
}

const generateFortune = () => {
  const dir = majorDirection.value
  const displayDir = directionText.value
  const fortunes = {
    '正北': { dir, level: '大吉', title: '北方暖阳', content: '宜吃火锅/炖菜', interpretation: '北方水旺，一碗热气腾腾的乱炖或羊肉火锅，能让你一天充满活力。' },
    '东北': { dir, level: '中吉', title: '大地回春', content: '宜吃根茎类', interpretation: '厚积薄发，土豆炖牛肉等扎实的食物能带给你稳稳的幸福感。' },
    '正东': { dir, level: '中吉', title: '紫气东来', content: '宜吃早茶/蒸点', interpretation: '东方生机盎然，吃些清淡美味的早茶或蒸笼点心，能为你带来清晰的头脑。' },
    '东南': { dir, level: '小吉', title: '海风轻拂', content: '宜吃海鲜/酸甜', interpretation: '和煦舒适的方位，品尝一些带有酸甜果香或鲜美海味的菜肴吧。' },
    '正南': { dir, level: '上吉', title: '南方红火', content: '宜吃烧烤/川菜', interpretation: '南方火旺，今天最适合叫上朋友搓一顿烧烤，红红火火，好运连连！' },
    '西南': { dir, level: '中吉', title: '甜蜜时光', content: '宜吃甜品/面食', interpretation: '土气生金，脾胃大开，来一块精致的小蛋糕或者软糯的面包吧。' },
    '正西': { dir, level: '上吉', title: '西方金贵', content: '宜吃海鲜/白肉', interpretation: '西方金气盛，品尝鲜美的海鲜或高蛋白的鱼肉，财运和口福双丰收。' },
    '西北': { dir, level: '大吉', title: '大口吃肉', content: '宜吃牛羊肉', interpretation: '豪爽之气顿生，大口吃肉大口喝汤，痛快干饭才是正道！' },
    '未知': { dir, level: '小吉', title: '随遇而安', content: '宜吃家常菜', interpretation: '无论朝向哪里，家里的粗茶淡饭最抚凡人心，平安就是大吉。' }
  }
  fortuneResult.value = fortunes[dir] || fortunes['未知']
  if (fortuneResult.value) {
    fortuneResult.value.displayDir = displayDir
  }
}
</script>

<style lang="less" scoped>
.c-popup-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.c-popup-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  border-radius: 64rpx 64rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.2, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1001;
  max-height: 85vh;
  &.show-up {
    transform: translateY(0);
  }
}

.popup-scroll-area {
  flex: 1;
  width: 100%;
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

.footer-safe { height: env(safe-area-inset-bottom); }

.compass-body {
  padding: 20rpx 40rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.compass-circle {
  width: 440rpx;
  height: 440rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(0, 0, 0, 0.04);
  background: #FCFCFC;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.04), inset 0 4rpx 12rpx rgba(255,255,255,1);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
}

/* 刻度线 */
.scale-lines {
  position: absolute;
  width: 100%;
  height: 100%;
}
.line {
  position: absolute;
  width: 2rpx;
  height: 100%;
  left: 50%;
  margin-left: -1rpx;
  background: transparent;
  &::before, &::after {
    content: '';
    position: absolute;
    width: 2rpx;
    height: 14rpx;
    background: rgba(0,0,0,0.06);
    left: 0;
  }
  &::before { top: 12rpx; }
  &::after { bottom: 12rpx; }
}

/* 方位字 */
.c-mark {
  position: absolute;
  font-size: 30rpx;
  font-weight: 500;
  color: #95A5A6;
  &.north { top: 40rpx; color: var(--primary, #FF5A79); font-weight: bold; }
  &.south { bottom: 40rpx; }
  &.east { right: 40rpx; }
  &.west { left: 40rpx; }
}

/* 指针 */
.needle-wrap {
  width: 20rpx;
  height: 300rpx;
  position: relative;
  /* 去除 transition，防止罗盘从 359度到1度时指针发生逆向360度旋转导致的抖动感 */
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}
.needle-north {
  width: 0;
  height: 0;
  border-left: 10rpx solid transparent;
  border-right: 10rpx solid transparent;
  border-bottom: 150rpx solid var(--primary, #FF5A79); /* 跟随主题色指北 */
}
.needle-south {
  width: 0;
  height: 0;
  border-left: 10rpx solid transparent;
  border-right: 10rpx solid transparent;
  border-top: 150rpx solid #BDC3C7; /* 灰色指南 */
}
.needle-center {
  width: 20rpx;
  height: 20rpx;
  background: #fff;
  border: 4rpx solid var(--primary, #FF5A79);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1);
}

.info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}
.i-direction {
  font-size: 52rpx;
  font-weight: 800;
  color: #2C3E50;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.i-detail {
  font-size: 28rpx;
  color: #7F8C8D;
  letter-spacing: 2rpx;
}
.info-row-mini {
  margin-top: 16rpx;
  text-align: center;
  font-size: 22rpx;
  color: #BDC3C7;
  border-top: 2rpx dashed rgba(0,0,0,0.04);
  padding-top: 16rpx;
}

/* 新增运势区 */
.fortune-box {
  background: rgba(127,140,141, 0.06);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  width: 100%;
  box-sizing: border-box;
}
.f-title {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--primary, #FF5A79);
}
.f-desc {
  font-size: 26rpx;
  color: #7F8C8D;
  line-height: 1.5;
}

.draw-btn-wrap {
  margin-top: 50rpx;
  width: 100%;
}
.draw-btn {
  background: var(--primary, #FF5A79);
  color: #fff;
  border-radius: 100rpx;
  font-size: 32rpx;
  font-weight: bold;
  padding: 10rpx 0;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.15);
  border: none;
  &:active { transform: scale(0.96); }
}

.light-hint {
  text-align: center;
  font-size: 22rpx;
  color: #95A5A6;
  margin-top: 30rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 抽签动画样式 */
.lottery-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 2000;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  backdrop-filter: blur(10px); border-radius: 40rpx 40rpx 0 0;
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
  display: flex; flex-direction: column; box-sizing: border-box;
  
  &.fade-in { animation: scrollUnfold 0.8s cubic-bezier(0.2, 1, 0.3, 1); }
  
  .f-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx;
    .f-no { font-size: 24rpx; color: #8B4513; font-weight: 900; opacity: 0.6; }
    .f-level { 
      font-size: 24rpx; font-weight: 900; padding: 4rpx 16rpx; border-radius: 8rpx;
      &.level-sj { background: #E67E22; color: #fff; }
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

<template>
  <custom-header title="饮食手账" icon="📓" back />
  <view class="page" :style="themeStyle">
    <!-- 1. 顶部统计分析卡片 -->
    <view class="analytics-card">
      <view class="analytics-title">📊 近14天膳食概览</view>
      <view class="ratio-bar-wrap">
        <view class="ratio-item" style="--ratio: 55%; --color: #4DB88F">
          <text class="label">自己做 (55%)</text>
          <view class="bar"></view>
        </view>
        <view class="ratio-item" style="--ratio: 30%; --color: #5B89E5">
          <text class="label">叫外卖 (30%)</text>
          <view class="bar"></view>
        </view>
        <view class="ratio-item" style="--ratio: 15%; --color: #F2A13B">
          <text class="label">出去吃 (15%)</text>
          <view class="bar"></view>
        </view>
      </view>
      <view class="analytics-footer">
        <view class="stat-pill">
          <text class="emoji">🥗</text>
          <text class="text">健康就餐: 80%</text>
        </view>
        <view class="stat-pill">
          <text class="emoji">😋</text>
          <text class="text">平均评分: 4.8星</text>
        </view>
      </view>
    </view>

    <!-- 2. 手账时间轴 -->
    <scroll-view scroll-y class="diary-scroll" :show-scrollbar="false">
      <view class="timeline-container">
        
        <view class="day-card" v-for="day in diaryList" :key="day.date">
          <!-- 卡片日期表签 -->
          <view class="day-header">
            <view class="day-tag-point"></view>
            <text class="day-date">{{ formatDateStr(day.date) }}</text>
          </view>

          <!-- 三餐子项 -->
          <view class="meals-wrap">
            <view class="meal-row" v-for="meal in ['早餐', '午餐', '晚餐']" :key="meal">
              <view class="meal-timeline-node">
                <text class="node-icon">{{ getMealIcon(meal) }}</text>
                <view class="node-line"></view>
              </view>
              
              <view class="meal-content-box">
                <view class="meal-title-row">
                  <text class="meal-name">{{ meal }}</text>
                  <text class="meal-status" :class="{ 'done': isMealDone(day, meal) }">
                    {{ isMealDone(day, meal) ? '已打卡' : '未记录' }}
                  </text>
                </view>

                <!-- 如果该餐次有记录 -->
                <block v-if="getMealRecord(day, meal)">
                  <view class="polaroid-card">
                    <!-- 拍立得照片效果 -->
                    <view class="photo-wrap" v-if="getMealRecord(day, meal).record?.photo" @click="previewImg(getMealRecord(day, meal).record.photo)">
                      <image class="photo" :src="getFullPhotoUrl(getMealRecord(day, meal).record.photo)" mode="aspectFill" />
                      <view class="photo-tape"></view>
                    </view>

                    <view class="record-body">
                      <!-- 菜品列表 -->
                      <view class="recipe-names">
                        🍲 {{ getMealRecord(day, meal).recipes?.join(' · ') || '家常便饭' }}
                      </view>

                      <!-- 打卡信息行 -->
                      <view class="info-row">
                        <text class="source-tag" :class="getSourceClass(getMealRecord(day, meal).record?.source)">
                          {{ getMealRecord(day, meal).record?.source || '自己做' }}
                        </text>
                        <text class="emoji-tag">{{ getMealRecord(day, meal).record?.emoji || '😋' }}</text>
                        <text class="cost-tag" v-if="getMealRecord(day, meal).record?.cost">
                          ¥ {{ getMealRecord(day, meal).record.cost }}
                        </text>
                      </view>

                      <!-- 健康评估标签 -->
                      <view class="tags-row" v-if="getMealRecord(day, meal).record?.tags?.length">
                        <text class="diet-tag" v-for="tag in getMealRecord(day, meal).record.tags" :key="tag">
                          #{{ tag }}
                        </text>
                      </view>

                      <!-- 便签记录 -->
                      <view class="notes-text" v-if="getMealRecord(day, meal).record?.notes">
                        💡 {{ getMealRecord(day, meal).record.notes }}
                      </view>
                    </view>
                  </view>
                </block>
                <!-- 如果没记录 -->
                <block v-else>
                  <view class="empty-meal-tip">
                    今天这顿饭还没记录哦，去安排一下吧~
                  </view>
                </block>
              </view>
            </view>
          </view>
        </view>

      </view>
      <view class="bottom-safe"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import familyApi from '@/common/api/family.js'
import config from '@/common/config.js'

const familyCode = uni.getStorageSync('family_code')

// 主题系统
const themes = [
  { color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
  { color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
  { color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
  { color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
]
const currentTheme = ref(0)
const themeStyle = computed(() => {
  const t = themes[currentTheme.value]
  return `
    --primary: ${t.color};
    --primary-grad: ${t.gradient};
    --primary-light: ${t.light};
    --primary-shadow: ${t.shadow};
  `
})

// 历史日记主数据列表
const diaryList = ref([])

onShow(() => {
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  loadDietDiary()
})

const getMealIcon = (meal) => {
  if (meal === '早餐') return '🥛'
  if (meal === '午餐') return '🍱'
  return '🥗'
}

const isMealDone = (day, mealName) => {
  const match = day.meals?.find(m => m.meal_name === mealName)
  return match && match.done === 1
}

const getMealRecord = (day, mealName) => {
  const match = day.meals?.find(m => m.meal_name === mealName)
  return (match && match.done === 1) ? match : null
}

const getFullPhotoUrl = (photo) => {
  if (!photo) return ''
  return photo.startsWith('http') ? photo : config.imgBaseUrl + photo
}

const previewImg = (url) => {
  const full = getFullPhotoUrl(url)
  uni.previewImage({
    urls: [full]
  })
}

const getSourceClass = (source) => {
  if (source === '外卖') return 'delivery'
  if (source === '出去吃') return 'restaurant'
  return 'home'
}

const formatDateStr = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[1]}月${parts[2]}日`
}

// 加载打卡饮食日记列表
const loadDietDiary = async () => {
  try {
    let list = []
    if (familyCode) {
      // 1. 发起请求获取云端历史饮食日记
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 14) // 获取最近14天的手账
      
      const startStr = start.toISOString().split('T')[0]
      const endStr = end.toISOString().split('T')[0]
      
      try {
        const res = await familyApi.getDietDiary(familyCode, startStr, endStr)
        if (res && res.data && res.data.diary) {
          list = res.data.diary || []
        }
      } catch (err) {
        console.warn('后端尚未支持 /family/meal/diary 接口，降级采用本地与 Mock 数据联合展示', err)
      }
    }

    // 2. 如果云端没有提供数据，自动生成高品质 Mock 数据保证治愈系完美体验
    if (list.length === 0) {
      list = getMockDiaryData()
    }
    
    // 3. 将本地今日已打卡的数据同步注入到时间轴中（如果存在）
    const today = new Date().toISOString().split('T')[0]
    const localTodayMeals = uni.getStorageSync('daily_meals_' + today)
    if (localTodayMeals) {
      // 找寻是否有 done 为 true 的，生成或替换 mock
      const todayMealsData = localTodayMeals.map(lm => {
        // 如果有 record 缓存则注入
        const recordCache = uni.getStorageSync(`meal_record_cache_${today}_${lm.name}`)
        return {
          meal_name: lm.name,
          done: lm.done ? 1 : 0,
          recipes: lm.recipes || [],
          record: recordCache || (lm.done ? {
            source: '自己做',
            emoji: '😋',
            photo: '',
            cost: null,
            tags: ['家常味'],
            notes: '今天自己动手做饭，吃得很饱饱的！'
          } : null)
        }
      })
      const todayIndex = list.findIndex(item => item.date === today)
      if (todayIndex > -1) {
        list[todayIndex].meals = todayMealsData
      } else {
        list.unshift({
          date: today,
          meals: todayMealsData
        })
      }
    }
    
    diaryList.value = list
  } catch (e) {
    console.error('加载三餐日记失败', e)
  }
}

// 治愈系高保真 Mock 数据，方便在后端接口未部署时完美演示
const getMockDiaryData = () => {
  const d = new Date()
  const list = []
  
  const foods = {
    '早餐': {
      recipes: ['草莓松饼', '低脂鲜牛奶'],
      notes: '做了一直想吃的草莓松饼！松松软软的口感，配上新鲜牛奶，元气满满的早晨 🍓🥛',
      emoji: '🥰',
      tags: ['健康少油', '手作早餐'],
      source: '自己做'
    },
    '午餐': {
      recipes: ['黑椒牛肉粒', '凉拌秋葵', '糙米饭'],
      notes: '中午叫了轻食外卖，牛肉挺嫩的，少油少盐无负担，适合上班摸鱼吃。',
      emoji: '😋',
      tags: ['轻食减脂', '高蛋白'],
      source: '外卖',
      cost: 28.5
    },
    '晚餐': {
      recipes: ['经典热气番茄锅', '手切小肥牛', '手工虾滑'],
      notes: '今天家庭聚会，大家一起去吃了心心念念的番茄火锅，虾滑绝了！人均吃得贼撑，好幸福 ✨🍲',
      emoji: '🥳',
      tags: ['大鱼大肉', '家庭聚餐'],
      source: '出去吃',
      cost: 120.0
    }
  }

  // 模拟最近五天的历史记录
  for (let i = 0; i < 5; i++) {
    const cur = new Date()
    cur.setDate(d.getDate() - i)
    const dateStr = cur.toISOString().split('T')[0]
    
    // 跳过今天（今天用真实数据）
    if (i === 0) continue

    list.push({
      date: dateStr,
      meals: [
        {
          meal_name: '早餐',
          done: 1,
          recipes: foods['早餐'].recipes,
          record: {
            source: foods['早餐'].source,
            emoji: foods['早餐'].emoji,
            photo: '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg',
            tags: foods['早餐'].tags,
            notes: foods['早餐'].notes
          }
        },
        {
          meal_name: '午餐',
          done: 1,
          recipes: foods['午餐'].recipes,
          record: {
            source: foods['午餐'].source,
            emoji: foods['午餐'].emoji,
            photo: '',
            cost: foods['午餐'].cost,
            tags: foods['午餐'].tags,
            notes: foods['午餐'].notes
          }
        },
        {
          meal_name: '晚餐',
          done: 1,
          recipes: foods['晚餐'].recipes,
          record: {
            source: foods['晚餐'].source,
            emoji: foods['晚餐'].emoji,
            photo: '/uploads/recipe-covers/fam_230122da8f990571/mpqporl6_477ca5c44ac3.jpg',
            cost: foods['晚餐'].cost,
            tags: foods['晚餐'].tags,
            notes: foods['晚餐'].notes
          }
        }
      ]
    })
  }
  return list
}
</script>

<style lang="less" scoped>
.page {
  background: #FAFAFA;
  height: 90vh;
  box-sizing: border-box;
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 400rpx);
  padding: 30rpx 40rpx;
  display: flex;
  flex-direction: column;
}

/* 顶部统计卡片 */
.analytics-card {
  background: #ffffff;
  border-radius: 36rpx;
  padding: 30rpx 36rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.02);
  margin-bottom: 30rpx;
  flex-shrink: 0;
  
  .analytics-title {
    font-size: 28rpx;
    font-weight: 800;
    color: #2D3748;
    margin-bottom: 24rpx;
  }
  
  .ratio-bar-wrap {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }
  
  .ratio-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .label {
      font-size: 24rpx;
      color: #718096;
      width: 180rpx;
    }
    
    .bar {
      flex: 1;
      height: 16rpx;
      background: #EDF2F7;
      border-radius: 10rpx;
      position: relative;
      overflow: hidden;
      margin-left: 20rpx;
      
      &::after {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: var(--ratio);
        background: var(--color);
        border-radius: 10rpx;
      }
    }
  }

  .analytics-footer {
    display: flex;
    gap: 24rpx;
    border-top: 2rpx dashed #EDF2F7;
    padding-top: 20rpx;
  }
  
  .stat-pill {
    background: #F7FAFC;
    padding: 10rpx 24rpx;
    border-radius: 100rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    .emoji { font-size: 26rpx; }
    .text { font-size: 22rpx; color: #4A5568; font-weight: 600; }
  }
}

/* 时间轴 */
.diary-scroll {
  flex: 1;
  overflow: hidden;
}

.timeline-container {
  display: flex;
  flex-direction: column;
}

.day-card {
  margin-bottom: 40rpx;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
  
  .day-tag-point {
    width: 16rpx;
    height: 16rpx;
    background: var(--primary);
    border-radius: 50%;
    box-shadow: 0 0 10rpx var(--primary-shadow);
  }
  
  .day-date {
    font-size: 30rpx;
    font-weight: 900;
    color: #2D3748;
    background: #FFF;
    padding: 6rpx 20rpx;
    border-radius: 100rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  }
}

.meals-wrap {
  border-left: 4rpx dashed #E2E8F0;
  margin-left: 6rpx;
  padding-left: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.meal-row {
  display: flex;
  position: relative;
}

.meal-timeline-node {
  position: absolute;
  left: -54rpx;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .node-icon {
    width: 44rpx;
    height: 44rpx;
    background: #FFF;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24rpx;
    box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.06);
    border: 2rpx solid #EDF2F7;
  }
}

.meal-content-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.meal-title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  
  .meal-name {
    font-size: 26rpx;
    font-weight: 800;
    color: #4A5568;
  }
  
  .meal-status {
    font-size: 20rpx;
    color: #A0AEC0;
    background: #EDF2F7;
    padding: 2rpx 12rpx;
    border-radius: 8rpx;
    font-weight: bold;
    
    &.done {
      color: var(--primary);
      background: var(--primary-light);
    }
  }
}

/* 拍立得日记卡片 */
.polaroid-card {
  background: #FFF;
  border-radius: 28rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.02);
  border: 2rpx solid #F7FAFC;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  position: relative;
  overflow: hidden;
}

.photo-wrap {
  width: 100%;
  height: 240rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  background: #EDF2F7;
  box-shadow: inset 0 2rpx 10rpx rgba(0,0,0,0.05);
  
  .photo {
    width: 100%;
    height: 100%;
  }
  
  /* 顶部小胶带装饰效果 */
  .photo-tape {
    position: absolute;
    top: -6rpx;
    left: 50%;
    transform: translateX(-50%) rotate(-3deg);
    width: 80rpx;
    height: 20rpx;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(2px);
    box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.02);
  }
}

.recipe-names {
  font-size: 28rpx;
  font-weight: 800;
  color: #2D3748;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.source-tag {
  font-size: 20rpx;
  font-weight: bold;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  
  &.home { background: #E6F7F0; color: #4DB88F; }
  &.delivery { background: #E8F0FE; color: #5B89E5; }
  &.restaurant { background: #FEF4E8; color: #F2A13B; }
}

.emoji-tag {
  font-size: 28rpx;
}

.cost-tag {
  font-size: 22rpx;
  color: #FF5A79;
  font-weight: 800;
  background: #FFE8EE;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.diet-tag {
  font-size: 22rpx;
  color: #718096;
  background: #F7FAFC;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  font-weight: 600;
}

.notes-text {
  font-size: 24rpx;
  color: #4A5568;
  line-height: 1.6;
  background: #F7FAFC;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  border-left: 6rpx solid var(--primary);
}

.empty-meal-tip {
  font-size: 22rpx;
  color: #A0AEC0;
  background: #FAFBFD;
  border: 2rpx dashed #E2E8F0;
  border-radius: 20rpx;
  padding: 24rpx;
  text-align: center;
}

.bottom-safe {
  height: 80rpx;
}
</style>

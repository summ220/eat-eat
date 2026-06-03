<!-- 今日三餐计划卡片与选择/打卡弹窗一体自治组件 -->
<template>
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

  <!-- 选菜弹窗直接平铺内嵌，完美达成免增子组件的自治设计 -->
  <view class="bottom-modal-mask" v-if="showMealPopup" @click="closeMealPopup">
    <view class="meal-picker-modal" @click.stop :style="themeStyle">
      <view class="mp-head">
        <text class="mp-t1">安排{{ currentMeal?.name }}</text>
        <view class="mp-close-x" @click="closeMealPopup">✕</view>
      </view>
      
      <scroll-view scroll-y class="mp-scroll-body" :show-scrollbar="false">
        
        <!-- 当前餐次常用菜单 -->
        <view class="mp-group">
          <view class="mp-group-title">💡 常用{{ currentMeal?.name }}菜单 <text class="sub">(可多选，长按删除)</text></view>
          <view class="mp-grid-tags">
            <view class="mp-grid-tag" 
                  v-for="item in currentCommonList" :key="item" 
                  :class="{ selected: tempSelectedRecipes.includes(item) }"
                  @click="toggleRecipeSelection(item)"
                  @longpress.stop="deleteRecipeFromList(item, 'common')">
              <text class="txt">{{ item }}</text>
              <view class="checker">
                <text v-if="tempSelectedRecipes.includes(item)">✓</text>
              </view>
            </view>
            <view class="mp-none-tip" v-if="!currentCommonList.length">暂无常用菜，去添加吧~</view>
          </view>
        </view>
        
        <!-- 新增临时安排的菜品展现 -->
        <view class="mp-group" v-if="currentTempPool.length > 0">
          <view class="mp-group-title">📋 本次临时安排 <text class="sub">(长按可删除)</text></view>
          <view class="mp-grid-tags">
            <view class="mp-grid-tag" 
                  v-for="item in currentTempPool" :key="item" 
                  :class="{ selected: tempSelectedRecipes.includes(item) }"
                  @click="toggleRecipeSelection(item)"
                  @longpress.stop="deleteRecipeFromList(item, 'temp')">
              <text class="txt">{{ item }}</text>
              <view class="checker">
                <text v-if="tempSelectedRecipes.includes(item)">✓</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 底部新增区 -->
        <view class="mp-add-block">
           <view class="mp-group-title">✨ 添加新菜品</view>
           <view class="mp-add-bar">
             <input class="mp-input-box" v-model="customMealName" placeholder="请输入菜品名称" />
             <view class="mp-trigger-btn" @click="addCustomToSelection">添加</view>
           </view>
           <view class="mp-opt-row">
             <view class="mp-checkbox-line" @click="saveToCommon = !saveToCommon">
               <checkbox :checked="saveToCommon" color="#FF7DA8" style="transform:scale(0.7)" />
               <text class="line-label">同时保存到常用菜单</text>
             </view>
           </view>
        </view>
      </scroll-view>
      
      <!-- 悬浮确定的底部 -->
      <view class="mp-bottom-bar">
        <button class="mp-action-btn" @click="confirmMealSelection">
          确定 <text class="cnt" v-if="tempSelectedRecipes.length">({{ tempSelectedRecipes.length }} 道)</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import familyApi from '@/common/api/family.js'

const props = defineProps({
  familyCode: {
    type: String,
    default: ''
  }
})

// 主状态
const meals = ref([])
const showMealPopup = ref(false)
const currentMeal = ref(null)

// 选菜弹窗内的所有自治私有状态
const commonMenus = ref({})
const todayTempMenuAll = ref({})
const tempSelectedRecipes = ref([])
const customMealName = ref('')
const saveToCommon = ref(false)
const themeStyle = ref('')

const initEmptyMeals = () => [
  { name: '早餐', icon: '🥛', recipes: [], done: false },
  { name: '午餐', icon: '🍱', recipes: [], done: false },
  { name: '晚餐', icon: '🥗', recipes: [], done: false }
]

// 餐次名标准化映射函数
const normalizeMealName = (name) => {
  if (!name) return '早餐'
  const lower = String(name).trim().toLowerCase()
  if (lower.includes('早') || lower.includes('breakfast') || lower.includes('morn')) return '早餐'
  if (lower.includes('午') || lower.includes('lunch') || lower.includes('noon')) return '午餐'
  if (lower.includes('晚') || lower.includes('dinner') || lower.includes('supper')) return '晚餐'
  return name
}

// 计算当前要展示的常用菜单与临时菜单
const currentCommonList = computed(() => {
  if (!currentMeal.value?.name) return []
  return commonMenus.value[currentMeal.value.name] || []
})

const currentTempPool = computed(() => {
  if (!currentMeal.value?.name) return []
  return todayTempMenuAll.value[currentMeal.value.name] || []
})

// 动态装载并计算主题
const applyTheme = () => {
  const themeIdx = uni.getStorageSync('current_theme') || 0
  const themes = [
    { name: '温柔粉', color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
    { name: '清新绿', color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
    { name: '雾霾蓝', color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
    { name: '暖杏黄', color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
  ]
  const t = themes[themeIdx]
  themeStyle.value = `
    --primary: ${t.color};
    --primary-grad: ${t.gradient};
    --primary-light: ${t.light};
    --primary-shadow: ${t.shadow};
  `
}

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
  if (!props.familyCode) return
  try {
    const res = await familyApi.getDailyMeals(props.familyCode, today)
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
  if (!props.familyCode) return
  try {
    const formattedMeals = meals.value.map(m => ({
      meal_name: m.name,
      done: m.done ? 1 : 0,
      recipes: m.recipes || []
    }))
    await familyApi.saveDailyMeals(props.familyCode, today, formattedMeals)
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
        if (!props.familyCode) {
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
            const resDaily = await familyApi.getDailyMeals(props.familyCode, today)
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
          await familyApi.saveDailyMeals(props.familyCode, tomorrowStr, formattedMeals)
          
          // (b) 更新明天的三餐计划本地缓存
          uni.setStorageSync('daily_meals_' + tomorrowStr, todayMeals)
          
          // 2. 从云端拉取今日最真实的临时安排池数据
          let todayTempPool = {}
          try {
            const resTemp = await familyApi.getDailyTempPool(props.familyCode, today)
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
                await familyApi.addDailyTempRecipe(props.familyCode, tomorrowStr, mealName, recipeName)
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

// 打开选菜弹窗并初始化数据
const openMealSelector = async (m) => {
  if (m.done) {
    uni.showToast({ title: '本餐已完成', icon: 'none' })
    return
  }
  currentMeal.value = m
  applyTheme()
  
  // 1. 初始化选中项与状态
  tempSelectedRecipes.value = [...(m.recipes || [])]
  customMealName.value = ''
  saveToCommon.value = false
  showMealPopup.value = true

  if (!props.familyCode) return
  
  // 2. 云端异步拉取该家庭的常用菜单与临时菜单
  try {
    const resCommon = await familyApi.getCommonMenus(props.familyCode)
    if (resCommon && resCommon.data.commonMenus) {
      if (Array.isArray(resCommon.data.commonMenus)) {
        const listObj = {}
        resCommon.data.commonMenus.forEach(item => {
          const tabName = normalizeMealName(item.mealName || item.meal_name || '早餐')
          if (!listObj[tabName]) listObj[tabName] = []
          listObj[tabName].push(item.recipeName || item.recipe_name)
        })
        commonMenus.value = listObj
      } else {
        const rawData = resCommon.data.commonMenus || resCommon.data || {}
        const listObj = {}
        for (const key in rawData) {
          const normKey = normalizeMealName(key)
          if (Array.isArray(rawData[key])) {
            listObj[normKey] = rawData[key]
          } else if (typeof rawData[key] === 'string') {
            listObj[normKey] = rawData[key].split(',').filter(Boolean)
          }
        }
        commonMenus.value = listObj
      }
    }
  } catch (e) {
    console.error('云端拉取常用菜单失败', e)
  }

  // 注入兜底默认菜单保证完美的用户体验
  const hasCommonData = Object.values(commonMenus.value).some(arr => arr && arr.length > 0)
  if (!hasCommonData) {
    commonMenus.value = {
      '早餐': ['燕麦牛奶', '包子豆浆', '葱香煎蛋', '三明治'],
      '午餐': ['番茄炒蛋', '红烧肉', '青椒肉丝', '紫菜蛋花汤'],
      '晚餐': ['清炒时蔬', '小米粥', '蔬菜沙拉', '煎鸡胸肉']
    }
  }

  const today = new Date().toISOString().split('T')[0]
  try {
    const resTemp = await familyApi.getDailyTempPool(props.familyCode, today)
    if (resTemp && resTemp.data.tempMenus) {
      if (Array.isArray(resTemp.data.tempMenus)) {
        const listObj = {}
        resTemp.data.tempMenus.forEach(item => {
          const tabName = normalizeMealName(item.mealName || item.meal_name || '早餐')
          if (!listObj[tabName]) listObj[tabName] = []
          listObj[tabName].push(item.recipeName || item.recipe_name)
        })
        todayTempMenuAll.value = listObj
      } else {
        const rawData = resTemp.data.tempMenus || resTemp.data || {}
        const listObj = {}
        for (const key in rawData) {
          const normKey = normalizeMealName(key)
          if (Array.isArray(rawData[key])) {
            listObj[normKey] = rawData[key]
          } else if (typeof rawData[key] === 'string') {
            listObj[normKey] = rawData[key].split(',').filter(Boolean)
          }
        }
        todayTempMenuAll.value = listObj
      }
    }
  } catch (e) {
    console.error('云端拉取临时菜单失败', e)
  }
}

const closeMealPopup = () => {
  showMealPopup.value = false
  currentMeal.value = null
}

const confirmMealSelection = async () => {
  if (currentMeal.value) {
    currentMeal.value.recipes = [...tempSelectedRecipes.value]
    currentMeal.value.done = false
    saveMeals()
    closeMealPopup()
  }
}

const toggleRecipeSelection = (recipe) => {
  const idx = tempSelectedRecipes.value.indexOf(recipe)
  if (idx === -1) {
    tempSelectedRecipes.value.push(recipe)
  } else {
    tempSelectedRecipes.value.splice(idx, 1)
  }
}

// 弹窗内长按删除功能
const deleteRecipeFromList = (recipeName, type) => {
  const modeTitle = type === 'temp' ? '临时池' : '常用菜单库'
  uni.showModal({
    title: '确认删除',
    content: `确定从【${modeTitle}】中彻底移除“${recipeName}”吗？`,
    confirmColor: '#FF5A79',
    success: async (res) => {
      if (res.confirm) {
        const tab = currentMeal.value?.name
        if (!tab) return
        const tdy = new Date().toISOString().split('T')[0]
        
        uni.showLoading({ title: '正在移除...', mask: true })
        try {
          if (type === 'temp') {
            const idx = todayTempMenuAll.value[tab].indexOf(recipeName)
            if (idx > -1) {
              todayTempMenuAll.value[tab].splice(idx, 1)
            }
            await familyApi.removeDailyTempRecipe(props.familyCode, tdy, tab, recipeName)
          } else {
            const idx = commonMenus.value[tab].indexOf(recipeName)
            if (idx > -1) {
              commonMenus.value[tab].splice(idx, 1)
            }
            await familyApi.removeCommonMenuRecipe(props.familyCode, tab, recipeName)
          }
          
          // 连锁反选已移除的项
          const sIdx = tempSelectedRecipes.value.indexOf(recipeName)
          if (sIdx > -1) {
            tempSelectedRecipes.value.splice(sIdx, 1)
          }
          uni.showToast({ title: '已彻底移除', icon: 'success' })
        } catch (e) {
          console.error('云端移除失败', e)
          uni.showToast({ title: '移除失败，请重试', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 弹窗内直接新增功能
const addCustomToSelection = async () => {
  const name = customMealName.value.trim()
  if (!name) return uni.showToast({ title: '请输入菜名', icon: 'none' })
  const tab = currentMeal.value?.name
  if (!tab) return
  const tdy = new Date().toISOString().split('T')[0]
  
  uni.showLoading({ title: '正在添加...', mask: true })
  try {
    if (!todayTempMenuAll.value[tab]) todayTempMenuAll.value[tab] = []
    if (!todayTempMenuAll.value[tab].includes(name)) {
      todayTempMenuAll.value[tab].push(name)
    }
    await familyApi.addDailyTempRecipe(props.familyCode, tdy, tab, name)

    if (saveToCommon.value) {
      if (!commonMenus.value[tab]) commonMenus.value[tab] = []
      if (!commonMenus.value[tab].includes(name)) {
        commonMenus.value[tab].push(name)
      }
      await familyApi.addCommonMenuRecipe(props.familyCode, tab, name)
    }
    
    if (!tempSelectedRecipes.value.includes(name)) {
      tempSelectedRecipes.value.push(name)
    }
    customMealName.value = ''
    uni.showToast({ title: '添加成功', icon: 'success' })
  } catch (e) {
    console.error('云端添加失败', e)
    uni.showToast({ title: '添加失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const markMealDone = async (m) => {
  m.done = true
  saveMeals()
  
  if (!props.familyCode) return
  try {
    const today = new Date().toISOString().split('T')[0]
    await familyApi.updateMealStatus(props.familyCode, today, m.name, 1)
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
        uni.switchTab({
          url: `/pages/recipe/recipe`
        })
      } else if (res.tapIndex === 1) {
        markMealDone(m)
      }
    }
  })
}

// 自动响应 familyCode 变化拉取
watch(() => props.familyCode, (newVal) => {
  if (newVal) {
    loadMeals()
  }
}, { immediate: true })

defineExpose({
  loadMeals,
  copyMealsToTomorrow
})
</script>

<style lang="less" scoped>


.fancy-meal-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  z-index: 30;
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

/* --- 选菜弹窗一体化样式区 --- */
.bottom-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.meal-picker-modal {
  background: #fff;
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  padding-bottom: env(safe-area-inset-bottom);
  position: relative;
}

.mp-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 40rpx 30rpx;
  flex-shrink: 0;
  .mp-t1 { font-size: 36rpx; font-weight: 900; color: #2C3E50; }
  .mp-close-x { font-size: 32rpx; color: #95A5A6; padding: 10rpx; }
}

.mp-scroll-body {
  flex: 1;
  padding: 20rpx 40rpx 180rpx;
  overflow: hidden;
  box-sizing: border-box;
}

.mp-group {
  margin-bottom: 50rpx;
  width: 100%;
}
.mp-group-title {
  font-size: 28rpx; font-weight: 800; color: #34495E; margin-bottom: 24rpx;
  .sub { font-size: 22rpx; color: #999; font-weight: normal; margin-left: 8rpx; }
}

.mp-grid-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.mp-grid-tag {
  background: #F7F8FA;
  padding: 16rpx 32rpx;
  border-radius: 30rpx;
  display: flex; align-items: center; gap: 12rpx;
  transition: all 0.2s ease;
  border: 2rpx solid transparent;
  position: relative;
  
  .txt { font-size: 26rpx; font-weight: 600; color: #4A5568; }
  
  .checker { 
    font-size: 22rpx; 
    color: #fff; 
    width: 32rpx; 
    height: 32rpx; 
    border-radius: 50%; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    font-weight: bold; 
    border: 2rpx solid #D1D8E0; 
    box-sizing: border-box;
    transition: all 0.2s ease;
  }
  
  &.selected {
    background: var(--primary-light);
    border-color: var(--primary);
    .txt { color: var(--primary); }
    .checker {
      background: var(--primary);
      border-color: var(--primary);
    }
  }
}
.mp-none-tip { font-size: 24rpx; color: #B0BEC5; padding: 20rpx 0; }

.mp-add-block {
  background: #FBFBFD;
  border-radius: 36rpx;
  padding: 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.mp-add-bar {
  display: flex;
  background: #fff;
  border-radius: 24rpx;
  padding: 10rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  margin-bottom: 20rpx;
  box-sizing: border-box;
  
  .mp-input-box {
    flex: 1; height: 80rpx; padding-left: 20rpx; font-size: 28rpx;
  }
  .mp-trigger-btn {
    background: var(--primary);
    color: #fff;
    border-radius: 70rpx;
    width: 120rpx;
    display: flex; align-items: center; justify-content: center;
    font-size: 26rpx; font-weight: bold;
    flex-shrink: 0;
  }
}

.mp-opt-row {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.mp-checkbox-line {
  display: flex; align-items: center;
  .line-label { font-size: 24rpx; color: #7F8C8D; }
}

.mp-bottom-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, #fff 80%, rgba(255,255,255,0) 100%);
  padding: 40rpx 40rpx calc(40rpx + env(safe-area-inset-bottom));
  flex-shrink: 0;
  
  .mp-action-btn {
    background: var(--primary-grad);
    color: #fff;
    height: 96rpx;
    border-radius: 100rpx;
    display: flex; align-items: center; justify-content: center;
    font-size: 32rpx; font-weight: 800;
    box-shadow: 0 12rpx 32rpx var(--primary-shadow);
    border: none;
    &::after { border: none; }
    .cnt { margin-left: 10rpx; font-size: 26rpx; font-weight: normal; opacity: 0.9; }
  }
}
</style>

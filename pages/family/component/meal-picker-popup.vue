<!-- 选菜组件 -->
<template>
  <view class="bottom-modal-mask" v-if="show" @click="emitClose">
    <view class="meal-picker-modal" @click.stop :style="themeStyle">
      <view class="mp-head">
        <text class="mp-t1">安排{{ meal?.name }}</text>
        <view class="mp-close-x" @click="emitClose">✕</view>
      </view>
      
      <scroll-view scroll-y class="mp-scroll-body">
        
        <!-- 我的收藏快捷入口 -->
        <!-- <view class="mp-group" v-if="favoriteRecipes.length > 0">
          <view class="mp-group-title">❤️ 我的收藏菜谱 <text class="sub">(点击快速安排)</text></view>
          <view class="mp-grid-tags">
            <view class="mp-grid-tag" 
                  v-for="item in favoriteRecipes" :key="item" 
                  :class="{ selected: tempSelectedRecipes.includes(item) }"
                  @click="toggleRecipeSelection(item)">
              <text class="txt">{{ item }}</text>
              <view class="checker">
                <text v-if="tempSelectedRecipes.includes(item)">✓</text>
              </view>
            </view>
          </view>
        </view> -->
        
        <!-- 当前餐次常用菜单 -->
        <view class="mp-group">
          <view class="mp-group-title">💡 常用{{ meal?.name }}菜单 <text class="sub">(可多选，长按删除)</text></view>
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
        <button class="mp-action-btn" @click="emitConfirm">
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
  show: {
    type: Boolean,
    default: false
  },
  meal: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'confirm'])

// 内部自治的响应式变量
const commonMenus = ref({})
const todayTempMenuAll = ref({})
const tempSelectedRecipes = ref([])
const customMealName = ref('')
const saveToCommon = ref(false)
const themeStyle = ref('')

// 计算衍生出来的列表项
const currentCommonList = computed(() => {
  if (!props.meal?.name) return []
  return commonMenus.value[props.meal.name] || []
})

const currentTempPool = computed(() => {
  if (!props.meal?.name) return []
  return todayTempMenuAll.value[props.meal.name] || []
})

// 监听弹窗显示，自动在组件内完美拉取和组装数据
watch(() => props.show, async (newVal) => {
  if (newVal) {
    const familyCode = uni.getStorageSync('family_code') || 'default_family'
    
    // 餐次名标准化映射函数，强力保障后端不管是返回英文（breakfast）、中文（早餐）还是拼音均能精确映射
    const normalizeMealName = (name) => {
      if (!name) return '早餐'
      const lower = String(name).trim().toLowerCase()
      if (lower.includes('早') || lower.includes('breakfast') || lower.includes('morn')) return '早餐'
      if (lower.includes('午') || lower.includes('lunch') || lower.includes('noon')) return '午餐'
      if (lower.includes('晚') || lower.includes('dinner') || lower.includes('supper')) return '晚餐'
      return name
    }
    
    // 1. 初始化选中项
    tempSelectedRecipes.value = [...(props.meal?.recipes || [])]
    customMealName.value = ''
    saveToCommon.value = false
    
    // 2. 加载常用菜单 (完全走云端，不读写本地 Storage)
    commonMenus.value = {}
    try {
      const resCommon = await familyApi.getCommonMenus(familyCode)
      console.log('[API] 云端常用菜单拉取结果:', resCommon)
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
      console.error('加载云端常用菜单失败', e)
    }

    // [兜底策略] 若云端返回的全部餐次数据均为空，注入精心挑选的家庭首选默认菜单，确保初次开箱即用的高质感体验
    const hasCommonData = Object.values(commonMenus.value).some(arr => arr && arr.length > 0)
    if (!hasCommonData) {
      commonMenus.value = {
        '早餐': ['燕麦牛奶', '包子豆浆', '葱香煎蛋', '三明治'],
        '午餐': ['番茄炒蛋', '红烧肉', '青椒肉丝', '紫菜蛋花汤'],
        '晚餐': ['清炒时蔬', '小米粥', '蔬菜沙拉', '煎鸡胸肉']
      }
    }
    
    // 3. 加载临时安排菜谱 (完全走云端，不读写本地 Storage)
    const tdy = new Date().toISOString().split('T')[0]
    todayTempMenuAll.value = {}
    try {
      const resTemp = await familyApi.getDailyTempPool(familyCode, tdy)
      console.log('[API] 云端今日临时安排池拉取结果:', resTemp)
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
      console.error('加载云端临时安排失败', e)
    }
    
    // 4. 动态装载并计算主题
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
})

const emitClose = () => {
  emit('close')
}

const toggleRecipeSelection = (recipe) => {
  const idx = tempSelectedRecipes.value.indexOf(recipe)
  if (idx === -1) {
    tempSelectedRecipes.value.push(recipe)
  } else {
    tempSelectedRecipes.value.splice(idx, 1)
  }
}

const deleteRecipeFromList = (recipeName, type) => {
  const modeTitle = type === 'temp' ? '临时池' : '常用菜单库'
  uni.showModal({
    title: '确认删除',
    content: `确定从【${modeTitle}】中彻底移除“${recipeName}”吗？`,
    confirmColor: '#FF5A79',
    success: async (res) => {
      if (res.confirm) {
        const tab = props.meal?.name
        if (!tab) return
        const familyCode = uni.getStorageSync('family_code') || 'default_family'
        const tdy = new Date().toISOString().split('T')[0]
        
        uni.showLoading({ title: '正在移除...', mask: true })
        try {
          if (type === 'temp') {
            const idx = todayTempMenuAll.value[tab].indexOf(recipeName)
            if (idx > -1) {
              todayTempMenuAll.value[tab].splice(idx, 1)
            }
            await familyApi.removeDailyTempRecipe(familyCode, tdy, tab, recipeName)
          } else {
            const idx = commonMenus.value[tab].indexOf(recipeName)
            if (idx > -1) {
              commonMenus.value[tab].splice(idx, 1)
            }
            await familyApi.removeCommonMenuRecipe(familyCode, tab, recipeName)
          }
          
          // 连锁反选
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

const addCustomToSelection = async () => {
  const name = customMealName.value.trim()
  if (!name) return uni.showToast({ title: '请输入菜名', icon: 'none' })
  const tab = props.meal?.name
  if (!tab) return
  const familyCode = uni.getStorageSync('family_code') || 'default_family'
  const tdy = new Date().toISOString().split('T')[0]
  
  uni.showLoading({ title: '正在添加...', mask: true })
  try {
    // 1. 无论是否保存到常用菜单，都必定加入今日临时安排池（内存变量+接口）
    if (!todayTempMenuAll.value[tab]) todayTempMenuAll.value[tab] = []
    if (!todayTempMenuAll.value[tab].includes(name)) {
      todayTempMenuAll.value[tab].push(name)
    }
    await familyApi.addDailyTempRecipe(familyCode, tdy, tab, name)

    // 2. 如果勾选了保存到常用菜单，则额外加入常用菜单库（内存变量+接口）
    if (saveToCommon.value) {
      if (!commonMenus.value[tab]) commonMenus.value[tab] = []
      if (!commonMenus.value[tab].includes(name)) {
        commonMenus.value[tab].push(name)
      }
      await familyApi.addCommonMenuRecipe(familyCode, tab, name)
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

const emitConfirm = () => {
  emit('confirm', tempSelectedRecipes.value)
}
</script>

<style lang="less" scoped>
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
  z-index: 10;
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

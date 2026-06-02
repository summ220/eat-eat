<template>
  <custom-header title="家里食材" icon="🍅" />
  <gourmet-refresher :refreshing="refreshing" type="stock" />
  <view class="page" :style="themeStyle">
    <view class="top-actions-bar">
      <button class="action-btn-top add" @click="goSmartInput">+ 智能输入</button>
      <button class="action-btn-top clear" @click="clearExpired">清除过期</button>
      <button class="action-btn-top add" @click="goAdd">+ 添加</button>
    </view>
    
    <view class="main-layout">
      <!-- 左侧分类导航 -->
      <view class="sidebar" @touchmove.stop>
        <view class="sidebar-list">
          <view 
            class="nav-item" 
            :class="{ active: currentCategory === '全部' }" 
            @click="switchCategory('全部')"
          >
            <text class="nav-text">全部</text>
          </view>
          <zero-drag
            v-model="categories"
            mode="single"
            :single-item-height="90"
            :gap="0"
            :long-press-duration="350"
            @change="handleDragChange"
          >
            <template #default="{ item }">
              <view class="nav-item-inner" :class="{ active: currentCategory && currentCategory.id === item.id, dragging: !item._disabled }" @click="switchCategory(item)">
                <text class="nav-text">{{ item.name }}</text>
              </view>
            </template>
          </zero-drag>
        </view>
        <view class="nav-item add-cat-btn-side" @click="showCatModal = true">
          <text class="nav-text" style="color: var(--primary)">+ 添加分类</text>
        </view>
      </view>

      <!-- 右侧食材列表 -->
      <view class="list-container">
        <view class="empty" v-if="list.length === 0">
          <text>暂时没有食材哦～</text>
        </view>
        
        <view class="item-card" v-for="item in list" :key="item.id">
          <view class="item-header">
            <view class="title-group">
              <text class="name">{{ item.name }}</text>
              <text class="cat-tag" v-if="currentCategory === '全部'">{{ item.categoryName || '其他' }}</text>
            </view>
            <!-- <switch :checked="item.has" @change="toggle(item)" color="#FF93B6" style="transform: scale(0.8); margin-right: -10rpx;" /> -->
          </view>
          
          <view class="item-body">
            <view class="num-row">
              <text class="num">数量：{{ item.num || '-' }}</text>
              <view class="expire-tag" v-if="item.expire_date" :class="getExpireStatus(item.expire_date).type">
                <text>{{ getExpireStatus(item.expire_date).text }}</text>
              </view>
            </view>
            <text class="expire-date" v-if="item.expire_date">📅 过期：{{ formatDisplayDate(item.expire_date) }}</text>
          </view>
          
          <view class="item-footer">
            <text class="action-btn edit" @click="editItem(item)">✏️ 编辑</text>
            <text class="action-btn delete" @click="deleteItem(item)">🗑️ 删除</text>
          </view>
        </view>
        
        <!-- 底部防遮挡安全区 -->
        <view class="list-bottom-safe"></view>
      </view>
    </view>
    
    <!-- 编辑食材的弹窗 -->
    <view class="modal-mask" v-if="showModal" @click="showModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">编辑食材</text>
        
        <view class="modal-tags">
          <text 
            class="tag" 
            :class="{ active: editData.categoryName === cat.name }"
            v-for="cat in categories" 
            :key="cat.id"
            @click="editData.categoryId = cat.id, editData.categoryName = cat.name"
          >{{ cat.name }}</text>
        </view>
        
        <input class="modal-input" v-model="editData.name" placeholder="请输入食材名称" />
        <input class="modal-input" v-model="editData.num" placeholder="数量 (选填)" />
        
        <picker mode="date" @change="onEditDateChange">
          <view class="modal-input picker-item">
            <text class="p-label">过期日期：</text>
            <text class="p-val">{{ editData.expire_date ? formatDisplayDate(editData.expire_date) : '请选择 (选填)' }}</text>
          </view>
        </picker>
        
        <view class="modal-btns">
          <button class="cancel-btn" @click="showModal = false">取消</button>
          <button class="confirm-btn" @click="saveEdit">确定</button>
        </view>
      </view>
    </view>

    <!-- 分类管理弹窗 -->
    <view class="modal-mask" v-if="showCatModal" @click="showCatModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">管理分类</text>
        <view class="cat-manage-list">
          <view class="cat-manage-item" v-for="(cat, idx) in categories" :key="idx">
            <text>{{ cat.name }}</text>
            <text class="del-cat" @click="removeCategory(cat)">删除</text>
          </view>
        </view>
        <view class="add-cat-box">
          <input class="add-cat-input" v-model="newCat" placeholder="新分类名称" />
          <view class="add-cat-btn-modal" @click="addCategory">添加</view>
        </view>
        <view class="cat-opt-row" style="margin-bottom: 25rpx; display: flex; align-items: center; justify-content: flex-start;" @click="syncToShop = !syncToShop">
          <checkbox :checked="syncToShop" color="#FF7DA8" style="transform:scale(0.75);" />
          <text style="font-size: 25rpx; color: #7F8C8D; font-weight: bold;">同时保存到购物分类</text>
        </view>
      </view>
    </view>

    <!-- 智能批量输入弹窗 -->
    <view class="modal-mask" v-if="showSmartInput" @click="closeSmartInput">
      <view class="smart-modal-content" @click.stop>
        <text class="modal-title">🌟 智能批量录入</text>
        <text class="smart-hint">每行一个食材，或用逗号、顿号分隔，一次性批量新增</text>

        <textarea
          class="smart-textarea"
          v-model="smartInputText"
          placeholder="例如：\n西红柿、鸡蛋\n牛奶，面粉\n大葱"
          :auto-height="false"
          @input="onSmartInput"
        />

        <!-- 解析预览 -->
        <view class="smart-preview" v-if="parsedItems.length > 0">
          <text class="preview-label">将新增 {{ parsedItems.length }} 个食材：</text>
          <scroll-view scroll-y class="preview-list" :show-scrollbar="false">
            <view class="preview-tag" v-for="(item, idx) in parsedItems" :key="idx">
              <text>{{ item }}</text>
              <text class="preview-del" @click="removePreviewItem(idx)">×</text>
            </view>
          </scroll-view>
        </view>

        <!-- 分类选择 -->
        <view class="smart-cat-row">
          <text class="smart-cat-label">归属分类：</text>
          <scroll-view scroll-x class="smart-cat-scroll" :show-scrollbar="false">
            <view
              class="smart-cat-chip"
              :class="{ active: smartCategoryId === '' }"
              @click="smartCategoryId = ''"
            >不选</view>
            <view
              class="smart-cat-chip"
              v-for="cat in categories"
              :key="cat.id"
              :class="{ active: smartCategoryId === cat.id }"
              @click="smartCategoryId = cat.id"
            >{{ cat.name }}</view>
          </scroll-view>
        </view>

        <view class="smart-btns">
          <button class="cancel-btn" @click="closeSmartInput">取消</button>
          <button
            class="confirm-btn"
            :disabled="parsedItems.length === 0 || smartSaving"
            @click="submitSmartInput"
          >{{ smartSaving ? `保存中 ${smartSavedCount}/${parsedItems.length}` : `确认新增 ${parsedItems.length} 个` }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import stockApi from '@/common/api/stock.js'
import shopApi from '@/common/api/shop.js'
import { formatDate } from '@/uni_modules/uni-dateformat/components/uni-dateformat/date-format'
import zeroDrag from '@/uni_modules/zero-drag/components/zero-drag/zero-drag.vue'

let familyCode = uni.getStorageSync('family_code') || ''

const refreshing = ref(false)

// =============================== 分类管理 =============================
const showCatModal = ref(false)
const categories = ref([])
const currentCategory = ref('全部')
const newCat = ref('')
const syncToShop = ref(false)

onPullDownRefresh(async () => {
  refreshing.value = true
  familyCode = uni.getStorageSync('family_code') || ''
  try {
    await Promise.all([
      loadCategories(),
      load(),
      new Promise(resolve => setTimeout(resolve, 1500)) // 魔法胡萝卜跳舞时间
    ])
  } catch (e) {
    console.error(e)
  } finally {
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
})

const loadCategories = async () => {
  const res = await stockApi.getFamilyIngredientCategories(familyCode)
  categories.value = res.data.categories || []
}
const addCategory = async () => {
    const name = newCat.value.trim()
    if (!name) return
    
    // 修复原先 includes 判断对象列表的 Bug，采用 some 精确去重
    if (categories.value.some(c => c.name === name)) {
      return uni.showToast({ title: '分类已存在', icon: 'none' })
    }
    
    const ingredientCategoryJson = {name: name, sortOrder: categories.value.length + 1 }
    try {
      await stockApi.saveFamilyIngredientCategory(familyCode, ingredientCategoryJson)
      
      // 如果勾选了“同时保存到购物分类”，同步添加
      if (syncToShop.value) {
        try {
          let shoppingCategoryJson = {name: name, sortOrder: categories.value.length + 1}
          await shopApi.saveFamilyShoppingCategory(familyCode, shoppingCategoryJson)
        } catch (err) {
          console.error('同步购物分类失败:', err)
        }
      }
      
      uni.showToast({ title: '分类添加成功', icon: 'success' })
      showCatModal.value = false
      loadCategories()
      newCat.value = ''
    } catch (e) {
      console.error('添加食材分类失败', e)
      uni.showToast({ title: '添加失败', icon: 'none' })
    }
}
const removeCategory = (cat) => {
  console.log(cat, 'cat')
  uni.showModal({
    title: '提示',
    content: `确定要删除分类「${cat.name}」吗？`,
    confirmColor: '#FF7DA8',
    success: async (res) => {
      if (res.confirm) {
        await stockApi.deleteFamilyIngredientCategory(cat.id)
        loadCategories()
        uni.showToast({ title: '分类删除成功', icon: 'success' })
      }
    }
  })
}

const switchCategory = (cat) => {
  currentCategory.value = cat;
  load()
}

let dragTimer = null
const handleDragChange = (newList) => {
  categories.value = newList
  if (dragTimer) {
    clearTimeout(dragTimer)
  }
  dragTimer = setTimeout(async () => {
    try {
      const categoryIds = newList.map(cat => cat.id)
      await stockApi.sortFamilyIngredientCategories(familyCode, categoryIds)
      uni.showToast({ title: '分类排序已更新', icon: 'none' })
      await loadCategories()
    } catch (e) {
      console.error('更新分类排序失败', e)
      uni.showToast({ title: '排序更新失败', icon: 'none' })
    }
  }, 1000)
}
// =============================== 分类管理 =============================

// =============================== 食材列表 =============================
const list = ref([])
const load = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await stockApi.getFamilyIngredientItems(familyCode, currentCategory.value.id || '')
    list.value = res.data.items || []
    uni.hideLoading()
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
    uni.hideLoading()
  }
}

const getExpireStatus = (dateStr) => {
  if (!dateStr) return { type: '', text: '' }
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  
  const diffTime = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return { type: 'expired', text: '已过期' }
  if (diffDays <= 3) return { type: 'warning', text: `剩 ${diffDays} 天` }
  return { type: 'safe', text: '新鲜' }
}
// =============================== 食材列表 =============================

// =============================== 清除过期食材 =============================
const clearExpired = async () => {
  const today = new Date().toISOString().split('T')[0]
  const expired = list.value.filter(item => item.expire_date && item.expire_date < today)
  if (expired.length === 0) {
    return uni.showToast({ title: '暂无过期食材', icon: 'none' })
  }
  uni.showModal({
    title: '清除提示',
    content: `确定要一次性删除 ${expired.length} 项已过期食材吗？`,
    confirmColor: '#FF7DA8',
    success: async res => {
      if (!res.confirm) return
      uni.showLoading({ title: '删除中...' })
      try {
        const ids = expired.map(item => item.id)
        await stockApi.deleteFamilyIngredientItems(familyCode, ids)
        load()
        uni.showToast({ title: '已删除过期食材', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '删除失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}
// =============================== 清除过期食材 =============================

// =============================== 添加弹窗 =============================
const goAdd = () => {
  uni.navigateTo({ url: '/pages/stock/component/addStock' });
}

// =============================== 智能批量输入 =============================
const showSmartInput = ref(false)
const smartInputText = ref('')
const parsedItems = ref([])
const smartCategoryId = ref('')
const smartSaving = ref(false)
const smartSavedCount = ref(0)

const goSmartInput = () => {
  smartInputText.value = ''
  parsedItems.value = []
  smartCategoryId.value = ''
  smartSaving.value = false
  smartSavedCount.value = 0
  showSmartInput.value = true
}

const closeSmartInput = () => {
  showSmartInput.value = false
}

// 解析输入文本为食材名称数组
const parseSmartInput = (text) => {
  // 按换行、逗号、顿号、分号分割
  const raw = text.split(/[\n，,、；;]+/)
  const result = []
  const seen = new Set()
  for (const item of raw) {
    const name = item.trim()
    if (name && !seen.has(name)) {
      seen.add(name)
      result.push(name)
    }
  }
  return result
}

const onSmartInput = (e) => {
  parsedItems.value = parseSmartInput(e.detail.value)
}

const removePreviewItem = (idx) => {
  parsedItems.value.splice(idx, 1)
}

const submitSmartInput = async () => {
  if (parsedItems.value.length === 0 || smartSaving.value) return
  smartSaving.value = true
  smartSavedCount.value = 0

  const categoryObj = categories.value.find(c => c.id === smartCategoryId.value)
  const categoryName = categoryObj ? categoryObj.name : '其他'

  try {
    // 并发批量保存，最多 5 个并发防止接口限流
    const batchSize = 5
    const items = [...parsedItems.value]
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      await Promise.all(batch.map(name => {
        const ingredientItemJson = {
          name,
          categoryId: smartCategoryId.value || null,
          categoryName
        }
        return stockApi.saveFamilyIngredientItem(familyCode, ingredientItemJson)
      }))
      smartSavedCount.value += batch.length
    }
    uni.showToast({ title: `已新增 ${items.length} 个食材`, icon: 'success' })
    closeSmartInput()
    load()
  } catch (e) {
    console.error('批量新增失败', e)
    uni.showToast({ title: '部分食材保存失败', icon: 'none' })
  } finally {
    smartSaving.value = false
  }
}
// =============================== 智能批量输入 =============================

// =============================== 修改弹窗 =============================
const showModal = ref(false)
const editData = ref({
  _id: '',
  id: '',
  name: '',
  num: '',
  categoryName: '',
  expire_date: ''
})

// 格式化日期显示为 yyyy-MM-dd
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return ''
  return formatDate(dateStr, 'yyyy-MM-dd')
}

const onEditDateChange = (e) => {
  editData.value.expire_date = e.detail.value
}

const editItem = (item) => {
  editData.value = {
    _id: item._id,
    id: item.id,
    name: item.name,
    num: item.num || '',
    categoryName: item.categoryName || '其他',
    expire_date: item.expire_date || ''
  };
  showModal.value = true;
}

const saveEdit = async () => {
  if (!editData.value.name) {
    return uni.showToast({ icon: 'none', title: '请输入名称' });
  }
  const ingredientItemJson = {
    id: editData.value.id,
    name: editData.value.name,
    num: editData.value.num,
    categoryId: editData.value.categoryId,
    expire_date: editData.value.expire_date,
    has: editData.value.has,
  }
  await stockApi.updateFamilyIngredientItem(familyCode, ingredientItemJson);
  uni.showToast({ icon: 'success', title: '修改成功' });
  showModal.value = false;
  load()
}
// =============================== 修改弹窗 =============================

// =============================== 删除弹窗 =============================
const deleteItem = (item) => {
  uni.showModal({
    title: '提示',
    content: `确定要删除「${item.name}」吗？`,
    confirmColor: '#FF7DA8',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        try {
          await stockApi.deleteFamilyIngredientItem(item.id);
          load()
          uni.showToast({ icon: 'success', title: '删除成功' });
        } catch(e) {
          uni.showToast({ title: '删除失败', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
}
// =============================== 删除弹窗 =============================


onShow(() => {
  const code = uni.getStorageSync('family_code')
  if (!code) {
    uni.switchTab({
      url: '/pages/family/family',
      success: () => {
        uni.showToast({
          title: '请先创建或加入家庭',
          icon: 'none',
          duration: 2000
        })
      }
    })
    return
  }
  familyCode = code
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  loadCategories()
  load()
})

// =============================== 主题系统 =============================
const themes = [
  { name: '温柔粉', color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
  { name: '清新绿', color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
  { name: '雾霾蓝', color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
  { name: '暖杏黄', color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
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
// =============================== 主题系统 =============================

</script>

<style lang="less" scoped>
.page {
  background: #FAFAFA;
  // height: ~"calc(100vh - 70rpx)";
  // padding-bottom: 40rpx;
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 400rpx);
}

.top-actions-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20rpx 40rpx;
  gap: 20rpx;
  // background: var(--primary-light);
}

.action-btn-top {
  border-radius: 100rpx;
  padding: 0 36rpx;
  height: 64rpx;
  line-height: 60rpx;
  font-size: 26rpx;
  font-weight: bold;
  margin: 0;
  transition: transform 0.2s;
  &:active { transform: scale(0.95); }
  &.clear {
    background: #FFF;
    color: var(--primary);
    border: 2rpx solid var(--primary);
  }
  &.add {
    background: var(--primary-grad);
    color: #fff;
    border: none;
    box-shadow: 0 6rpx 16rpx var(--primary-shadow);
  }
  &::after {
    border: none;
  }
}

.add-btn {
  background: var(--primary-grad);
  color: #fff;
  border-radius: 100rpx;
  padding: 0 40rpx;
  height: 64rpx;
  line-height: 64rpx;
  font-size: 28rpx;
  border: none;
  margin: 0;
  box-shadow: 0 8rpx 20rpx var(--primary-shadow);
  transition: transform 0.2s;
  &:active { transform: scale(0.95); }
}

.main-layout {
  display: flex;
  align-items: flex-start;
  padding: 0 20rpx;
  height: 81.6vh;
}

.sidebar {
  width: 170rpx;
  background: #fff;
  border-radius: 36rpx;
  padding-top: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.03);
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-height: 0;
}
.sidebar-list::-webkit-scrollbar { display: none; }

zero-drag {
  display: block;
  width: 100%;
}

.add-cat-btn-side {
  flex-shrink: 0;
  border-top: 1rpx solid #F0F2F5;
}

.list-bottom-safe {
  height: 120rpx;
  flex-shrink: 0;
}

.nav-item, .nav-item-inner {
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  
  .nav-text {
    font-size: 28rpx;
    color: #888;
    transition: all 0.3s;
  }
  
  &.active {
    .nav-text {
      color: var(--primary);
      font-weight: bold;
      font-size: 30rpx;
    }
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 25rpx;
      bottom: 25rpx;
      width: 8rpx;
      background: var(--primary);
      border-radius: 0 10rpx 10rpx 0;
    }
  }

  &.dragging {
    // background: var(--primary-light) !important;
    // border-radius: 20rpx;
    // border: 2rpx dashed var(--primary) !important;
    // box-shadow: 0 12rpx 36rpx var(--primary-shadow) !important;
    // transform: scale(1.05);
    
    .nav-text {
      color: var(--primary) !important;
      font-weight: bold !important;
      font-size: 30rpx !important;
    }
  }
}

.list-container {
  flex: 1;
  padding-left: 20rpx;
  display: flex;
  flex-direction: column;
  height: 80vh;
  overflow: auto;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.list-container::-webkit-scrollbar { display: none; }

.item-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.03);
  transition: transform 0.2s;
  &:active { transform: translateY(2rpx) scale(0.99); }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.title-group {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.name {
  font-size: 34rpx;
  color: #333;
  font-weight: bold;
  margin-right: 16rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cat-tag {
  background: var(--primary-light);
  color: var(--primary);
  font-size: 20rpx;
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
  white-space: nowrap;
}

.item-body {
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.num-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.num {
  font-size: 26rpx;
  color: #888;
}

.expire-tag {
  font-size: 20rpx;
  padding: 4rpx 16rpx;
  border-radius: 100rpx;
  font-weight: bold;
  
  &.expired { background: #FFE5E5; color: #FF4757; }
  &.warning { background: #FFF4E5; color: #F39C12; }
  &.safe { background: #E8F7ED; color: #27AE60; }
}

.expire-date {
  font-size: 22rpx;
  color: #999;
}

.item-footer {
  display: flex;
  justify-content: flex-end;
  gap: 40rpx;
  border-top: 2rpx dashed #FFEEF2;
  padding-top: 20rpx;
}

.action-btn {
  font-size: 26rpx;
  display: flex;
  align-items: center;
  padding: 8rpx 0;
  
  &.edit {
    color: #7A9BFF;
  }
  
  &.delete {
    color: #FF8F8F;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 150rpx;
  color: #BC8DA7;
  font-size: 28rpx;
}

/* 编辑弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  width: 620rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  box-sizing: border-box;
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.1);
}

.modal-title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  color: #333;
  font-weight: 800;
  margin-bottom: 40rpx;
}

.modal-input {
  background: #F8F9FA;
  height: 90rpx;
  border-radius: 24rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  margin-bottom: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  &:focus {
    border: 2rpx solid #FF8DA1;
    background: #FFF;
  }
}

.picker-item {
  display: flex;
  align-items: center;
  .p-label { color: #888; margin-right: 10rpx; }
  .p-val { color: #333; flex: 1; }
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 50rpx;
}

.tag {
  background: #F8F9FA;
  color: #888;
  padding: 12rpx 32rpx;
  border-radius: 100rpx;
  font-size: 26rpx;
  transition: all 0.3s;
  
  &.active {
    background: var(--primary-grad);
    color: #fff;
    box-shadow: 0 6rpx 16rpx var(--primary-shadow);
  }
}

.modal-btns {
  display: flex;
  justify-content: space-between;
  gap: 30rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 100rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin: 0;
  border: none;
  &::after {
    border: none;
  }
}

.cancel-btn {
  background: #F5F5F5;
  color: #666;
}

.confirm-btn {
  background: var(--primary-grad);
  color: #fff;
  box-shadow: 0 8rpx 20rpx var(--primary-shadow);
}

.cat-manage-list {
  max-height: 400rpx;
  overflow-y: auto;
  margin-bottom: 30rpx;
}
.cat-manage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #F8F9FA;
  font-size: 28rpx;
  color: #2C3E50;
}
.del-cat {
  color: #FF4757;
  font-size: 24rpx;
  font-weight: bold;
}
.add-cat-box {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}
.add-cat-input {
  flex: 1;
  background: #F8F9FA;
  height: 80rpx;
  border-radius: 20rpx;
  padding: 0 30rpx;
  font-size: 26rpx;
}
.add-cat-btn-modal {
  background: var(--primary);
  color: #fff;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 30rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: bold;
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
}

// =============================== 智能输入弹窗 ===============================
.smart-modal-content {
  width: 680rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx 40rpx;
  box-sizing: border-box;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.smart-hint {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
  text-align: center;
}

.smart-textarea {
  width: 100%;
  height: 220rpx;
  background: #F8F9FA;
  border-radius: 20rpx;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: #2C3E50;
  box-sizing: border-box;
  line-height: 1.7;
  border: 2rpx solid transparent;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary);
  }
}

.smart-preview {
  background: var(--primary-light);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;

  .preview-label {
    font-size: 24rpx;
    color: var(--primary);
    font-weight: bold;
    margin-bottom: 16rpx;
    display: block;
  }

  .preview-list {
    max-height: 160rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .preview-tag {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    background: #fff;
    border: 1rpx solid var(--primary);
    border-radius: 100rpx;
    padding: 8rpx 20rpx;
    font-size: 24rpx;
    color: var(--primary);

    .preview-del {
      font-size: 28rpx;
      color: #FF7DA8;
      font-weight: bold;
      line-height: 1;
    }
  }
}

.smart-cat-row {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .smart-cat-label {
    font-size: 26rpx;
    color: #666;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .smart-cat-scroll {
    width: 420rpx;
    flex: 1;
    white-space: nowrap;

    .smart-cat-chip {
      display: inline-flex;
      align-items: center;
      padding: 10rpx 28rpx;
      border-radius: 100rpx;
      font-size: 24rpx;
      background: #F0F0F0;
      color: #888;
      margin-right: 14rpx;
      transition: all 0.2s;

      &.active {
        background: var(--primary-grad);
        color: #fff;
        box-shadow: 0 4rpx 12rpx var(--primary-shadow);
      }
    }
  }
}

.smart-btns {
  display: flex;
  gap: 20rpx;

  .cancel-btn {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    background: #F8F9FA;
    color: #888;
    border-radius: 100rpx;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    &::after { border: none; }
  }

  .confirm-btn {
    flex: 2;
    height: 88rpx;
    line-height: 88rpx;
    background: var(--primary-grad);
    color: #fff;
    border-radius: 100rpx;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    box-shadow: 0 8rpx 20rpx var(--primary-shadow);
    transition: opacity 0.2s;
    &::after { border: none; }
    &[disabled] {
      opacity: 0.5;
      box-shadow: none;
    }
  }
}
</style>
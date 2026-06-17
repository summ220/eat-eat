<template>
  <custom-header title="购物清单" icon="🛒" />
  <gourmet-refresher :refreshing="refreshing" type="shop" />
  <view class="page" :style="themeStyle">
    <view class="top-actions-bar">
      <button class="action-btn-top clear" @click="clearDone">清空已购</button>
      <button class="action-btn-top add" @click="goAdd">+ 新增</button>
      <button class="action-btn-top smart" @click="goSmartInput">✨ 智能输入</button>
    </view>

    <view class="main-layout">
      <!-- 左侧分类侧边栏 -->
      <view class="sidebar" @touchmove.stop>
        <view class="sidebar-list">
          <view class="nav-item" :class="{ active: currentCategory === '全部' }" @click="switchCategory('全部')">
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
              <view class="nav-item-inner" :class="{ active: currentCategory === item.id, dragging: !item._disabled }" @click="switchCategory(item.id)">
                <text class="nav-text">{{ item.name }}</text>
              </view>
            </template>
          </zero-drag>
        </view>
        <view class="nav-item add-cat-btn-side" @click="showCatModal = true">
          <text class="nav-text" style="color: var(--primary)">+ 添加分类</text>
        </view>
      </view>

      <!-- 右侧购物车列表 -->
      <view class="list-container">
        <view class="empty" v-if="list.length === 0">
          <text>暂无购物车内容</text>
        </view>

        <view class="item-card" :class="{ 'is-done': item.done }" v-for="item in list" :key="item.id">
          <view class="item-header">
            <view class="title-group">
              <text class="name">{{ item.name }}</text>
              <text class="cat-tag" v-if="currentCategory === '全部'">{{ item.categoryName || '其他' }}</text>
            </view>
            <!-- 自定义勾选框，避免原生 switch 在列表重排后状态不同步 -->
            <view
              class="custom-check"
              :class="{ checked: item.done }"
              @click.stop="toggle(item)"
            >
              <text class="check-icon" v-if="item.done">✓</text>
            </view>
          </view>

          <view class="item-body">
            <text class="num">数量：{{ item.num || '-' }}</text>
            <text class="price" v-if="item.price && item.price !== ''">{{ item.done ? '实际花费' : '预估单价' }}: ¥ {{ item.price }}</text>
          </view>

          <view class="item-footer">
            <text class="action-btn edit" @click="openEditModal(item)" v-if="!item.done">✏️ 编辑</text>
            <text class="action-btn edit" @click="reAdd(item)" v-if="item.done">+ 重新加购</text>
            <text class="action-btn delete" @click="deleteItem(item)">🗑️ 删除</text>
          </view>
        </view>
        
        <!-- 底部防遮挡安全区 -->
        <view class="list-bottom-safe"></view>
      </view>
    </view>

    <!-- 添加与编辑共用弹窗 -->
    <view class="modal-mask" v-if="showModal" @click="showModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{ modalMode === 'add' ? '添加物品' : '编辑物品' }}</text>
        
        <view class="modal-tags">
          <text 
            class="tag" 
            :class="{ active: editData.categoryName === cat.name }" 
            v-for="cat in categories" 
            :key="cat.id" 
            @click="editData.categoryName = cat.name;editData.categoryId = cat.id"
          >{{ cat.name }}</text>
        </view>
        
        <input class="modal-input" v-model="editData.name" placeholder="物品名称 (必填)" />
        <input class="modal-input" v-model="editData.num" placeholder="数量/单位 (选填，如 2斤)" />
        <input class="modal-input" type="digit" v-model="editData.price" placeholder="花费/单价 ¥ (选填)" />
        
        <view class="modal-btns">
          <button class="cancel-btn" @click="showModal = false">取消</button>
          <button class="confirm-btn" @click="saveModal">保存</button>
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
        <view class="cat-opt-row" style="margin-bottom: 25rpx; display: flex; align-items: center; justify-content: flex-start;" @click="syncToStock = !syncToStock">
          <checkbox :checked="syncToStock" color="#FF7DA8" style="transform:scale(0.75);" />
          <text style="font-size: 25rpx; color: #7F8C8D; font-weight: bold;">同时保存到食材分类</text>
        </view>
        <!-- <button class="close-modal-btn" @click="showCatModal = false">完成</button> -->
      </view>
    </view>

    <!-- 智能批量输入弹窗 -->
    <view class="modal-mask" v-if="showSmartInput" @click="closeSmartInput">
      <view class="smart-modal-content" @click.stop>
        <text class="modal-title">🌟 智能批量录入</text>
        <text class="smart-hint">每行一个物品，或用逗号、顿号分隔，一次性批量新增</text>

        <textarea
          class="smart-textarea"
          v-model="smartInputText"
          placeholder="例如：\n牛奶、鸡蛋\n苹果，香蕉\n洗洁精"
          :auto-height="false"
          @input="onSmartInput"
        />

        <!-- 解析预览 -->
        <view class="smart-preview" v-if="parsedItems.length > 0">
          <text class="preview-label">将新增 {{ parsedItems.length }} 个物品：</text>
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

    <!-- 底部悬浮统计区域 -->
    <view class="stat-wrapper" :class="{ 'is-expanded': isStatExpanded }">
      <view class="stat-card-anim" @click="!isStatExpanded ? (isStatExpanded = true) : (isStatExpanded = false)">
        <!-- 收起时的内容 -->
        <view class="stat-collapsed" :class="{ 'hide': isStatExpanded }">
          <text class="circle-icon">预估</text>
          <text class="circle-text">花费</text>
        </view>
        
        <!-- 展开时的内容 (复刻原版) -->
        <view class="stat-expanded-content" :class="{ 'show': isStatExpanded }">
          <view class="start-row">
            <text class="shouqi">《</text>
            <text class="stat-text">已购买 {{ doneCount }}/{{ list.length }} 件</text>
          </view>
          <text class="stat-money">本次花费：¥ <text class="stat-money-num" @click.stop="checkCost">{{ totalCost }}</text></text>
        </view>
      </view>
    </view>
    <!-- 实际消费确认弹窗 -->
    <view class="modal-mask" v-if="showPurchaseModal" @click="showPurchaseModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">确认购买</text>
        <view class="purchase-tip">
          <text class="purchase-item-name">🛍️ {{ activeToggleItem?.name }}</text>
          <text class="purchase-item-desc">数量：{{ activeToggleItem?.num || '1' }} | 预估单价：¥{{ activeToggleItem?.price || '0' }}</text>
        </view>
        <view class="input-group">
          <view class="price-input-container">
            <text class="price-symbol">¥</text>
            <input 
              type="digit" 
              v-model="purchaseForm.price" 
              placeholder="请输入实际消费总额" 
              class="modal-input price-input-field" 
              @blur="onPriceBlur"
            />
          </view>
        </view>
        
        <view class="sync-checkboxes">
          <view class="sync-checkbox-item" @click="purchaseForm.syncToCost = !purchaseForm.syncToCost">
            <checkbox :checked="purchaseForm.syncToCost" color="var(--primary)" style="transform:scale(0.8);" />
            <text class="checkbox-text">同步到花费账本</text>
          </view>
          <view class="sync-checkbox-item" @click="purchaseForm.syncToStock = !purchaseForm.syncToStock">
            <checkbox :checked="purchaseForm.syncToStock" color="var(--primary)" style="transform:scale(0.8);" />
            <text class="checkbox-text">同步到食材库存</text>
          </view>
        </view>

        <view class="modal-btns">
          <button class="cancel-btn" @click="showPurchaseModal = false">取消</button>
          <button class="confirm-btn" @click="confirmPurchase">确定</button>
        </view>
      </view>
    </view>

    <custom-tabbar />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import shopApi from '@/common/api/shop.js'
import stockApi from '@/common/api/stock.js'
import costApi from '@/common/api/cost.js'
import zeroDrag from '@/uni_modules/zero-drag/components/zero-drag/zero-drag.vue'

let familyCode = uni.getStorageSync('family_code') || 'default_family';

const refreshing = ref(false)
const list = ref([])
const isStatExpanded = ref(false)

// 购买确认弹窗状态
const showPurchaseModal = ref(false)
const activeToggleItem = ref(null)
const purchaseForm = ref({
  price: '',
  syncToCost: true,
  syncToStock: true
})

// ========================分类管理========================
const categories = ref([])
const currentCategory = ref('全部')

onPullDownRefresh(async () => {
  refreshing.value = true
  familyCode = uni.getStorageSync('family_code') || 'default_family'
  try {
    await Promise.all([
      loadCategories(),
      load(),
      new Promise(resolve => setTimeout(resolve, 1500)) // 漂移动画手推车时间
    ])
  } catch (e) {
    console.error(e)
  } finally {
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
})

const showCatModal = ref(false)
const newCat = ref('')
const syncToStock = ref(false)

const loadCategories = async () => {
  try {
    const res = await shopApi.getFamilyShoppingCategories(familyCode)
    categories.value = res.data.categories || []
  } catch (e) {
    console.error('加载分类失败', e)
  }
}
const addCategory = async () => {
  const name = newCat.value.trim()
  if (!name) return
  
  // 避免重复
  if (categories.value.some(c => c.name === name)) {
    return uni.showToast({ title: '分类已存在', icon: 'none' })
  }
  
  // API创建分类
  let shoppingCategoryJson = {name: name, sortOrder: categories.value.length + 1}
  try {
    await shopApi.saveFamilyShoppingCategory(familyCode, shoppingCategoryJson)
    
    // 如果勾选了“同时保存到食材分类”，同步添加
    if (syncToStock.value) {
      try {
        let ingredientCategoryJson = {name: name, sortOrder: categories.value.length + 1}
        await stockApi.saveFamilyIngredientCategory(familyCode, ingredientCategoryJson)
      } catch (err) {
        console.error('同步食材分类失败:', err)
      }
    }
    
    newCat.value = ''
    await loadCategories()
    uni.showToast({ title: '添加成功', icon: 'none' })
    showCatModal.value = false
  } catch (e) {
    console.error('添加分类失败', e)
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}
const removeCategory = (cat) => {
  uni.showModal({
    title: '提示',
    content: `确定要删除分类「${cat.name}」吗？`,
    confirmColor: '#FF7DA8',
    success: async (res) => {
      if (res.confirm) {
        try {
          await shopApi.deleteFamilyShoppingCategory(cat.id)
          await loadCategories()
          uni.showToast({ title: '删除成功', icon: 'none' })
        } catch (e) {
          console.error('删除分类失败', e)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
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
      await shopApi.sortFamilyShoppingCategories(familyCode, categoryIds)
      await loadCategories()
      uni.showToast({ title: '分类排序已更新', icon: 'none' })
    } catch (e) {
      console.error('更新分类排序失败', e)
      uni.showToast({ title: '排序更新失败', icon: 'none' })
    }
  }, 1000)
}
// ===================================分类管理=====================================

// ===================================Shopping List=====================================
const showModal = ref(false)
const modalMode = ref('add')
const editData = ref({
  id: '',
  name: '',
  num: '',
  price: '',
  categoryName: '蔬菜'
})

// sortedIds 存储当前显示顺序的 id 列表，只在加载/切分类时更新，不因 toggle 而重排
const sortedIds = ref([])

const buildSortedIds = () => {
  let base = list.value.slice()
  if (currentCategory.value !== '全部') {
    base = base.filter(item => (item.category || '其他') === currentCategory.value)
  }
  // 加载时按创建时间降序，未购先、已购后
  base.sort((a, b) => {
    if (a.done === b.done) return b.create_time - a.create_time
    return a.done ? 1 : -1
  })
  sortedIds.value = base.map(item => item.id)
}

const filteredList = computed(() => {
  // 按 sortedIds 顺序渲染，但实时反映 done 状态（引用相同）
  const map = new Map(list.value.map(item => [item.id, item]))
  let result = sortedIds.value
    .map(id => map.get(id))
    .filter(Boolean)
  // 如果当前分类不是全部，额外过滤
  if (currentCategory.value !== '全部') {
    result = result.filter(item => (item.category || '其他') === currentCategory.value)
  }
  return result
})

const doneCount = computed(() => {
  return list.value.filter(item => item.done).length;
})

const totalCost = computed(() => {
  let cost = 0;
  list.value.forEach(item => {
    if (item.done && item.price) {
      const p = parseFloat(item.price);
      if (!isNaN(p)) {
        cost += p;
      }
    }
  });
  return cost.toFixed(2);
})

import eatCo from '@/common/localDB.js'

onShow(() => {
  uni.hideTabBar({ animation: false })
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
  if (!categories.value.includes(currentCategory.value) && currentCategory.value !== '全部') {
    currentCategory.value = ''
  }
})

const onPriceBlur = () => {
  if (purchaseForm.value.price) {
    const val = parseFloat(purchaseForm.value.price)
    if (!isNaN(val)) {
      purchaseForm.value.price = val.toFixed(2)
    }
  }
}

const toggle = (item) => {
  if (item.done) return; // 勾选之后不能取消勾选
  
  activeToggleItem.value = item
  
  // 计算预估总价
  const singlePrice = parseFloat(item.price)
  const num = parseInt(item.num) || 1
  let estPrice = ''
  if (!isNaN(singlePrice)) {
    estPrice = (singlePrice * num).toFixed(2)
  }
  
  purchaseForm.value = {
    price: estPrice,
    syncToCost: true,
    syncToStock: true
  }
  
  showPurchaseModal.value = true
}

const confirmPurchase = async () => {
  const item = activeToggleItem.value
  if (!item) return
  
  const shouldSyncToCost = purchaseForm.value.syncToCost
  const shouldSyncToStock = purchaseForm.value.syncToStock
  let finalPrice = parseFloat(purchaseForm.value.price)
  
  if (shouldSyncToCost) {
    if (!purchaseForm.value.price || isNaN(finalPrice) || finalPrice <= 0) {
      return uni.showToast({ title: '请输入有效的实际消费金额', icon: 'none' })
    }
  } else {
    // 如果不同步到花费，我们也算一个预估总价作为该项的实际花费
    const singlePrice = parseFloat(item.price)
    const num = parseInt(item.num) || 1
    finalPrice = !isNaN(singlePrice) ? singlePrice * num : 0
  }
  
  showPurchaseModal.value = false
  
  const newDone = true
  const oldPrice = item.price
  item.done = newDone // 乐观更新
  item.price = finalPrice > 0 ? finalPrice.toFixed(2) : oldPrice
  
  try {
    // 1. 更新购物车项为已购买状态，并写入实际花费总价
    await shopApi.updateFamilyShoppingItem(familyCode, {
      id: item.id,
      name: item.name,
      num: item.num,
      price: finalPrice > 0 ? finalPrice.toFixed(2) : oldPrice,
      categoryId: item.categoryId,
      done: newDone
    })
    
    // 2. 同步到食材库存
    if (shouldSyncToStock) {
      const ingredientItemJson = {
        name: item.name,
        num: item.num,
        categoryId: item.categoryId,
        expire_date: '',
        has: true,
      }
      await stockApi.saveFamilyIngredientItem(familyCode, ingredientItemJson)
    }
    
    // 3. 同步到花费账本
    if (shouldSyncToCost && finalPrice > 0) {
      const consumptionRecordJson = {
        name: item.name,
        price: finalPrice,
        categoryId: item.categoryId,
        date: new Date().toISOString().split('T')[0],
      }
      await costApi.saveFamilyConsumptionRecord(familyCode, consumptionRecordJson)
    }
    
    // 提示
    let tip = '购买成功'
    if (shouldSyncToStock && shouldSyncToCost) {
      tip = '已记账并同步食材'
    } else if (shouldSyncToStock) {
      tip = '已同步食材'
    } else if (shouldSyncToCost) {
      tip = '已记入花费账本'
    }
    uni.showToast({ title: tip, icon: 'success' })
    load()
  } catch (e) {
    item.done = false // 回滚
    item.price = oldPrice
    uni.showToast({ title: '购买确认失败，请重试', icon: 'none' })
  }
}

const load = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const categoryParam = currentCategory.value === '全部' ? '' : currentCategory.value
    const res = await shopApi.getFamilyShoppingItems(familyCode, categoryParam)
    list.value = res.data.items || []
    console.log(list.value)
    // 加载后初始化显示顺序
    buildSortedIds()
    uni.hideLoading()
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    uni.hideLoading()
  }
}

// 切换分类时重新构建顺序快照
const switchCategory = (cat) => {
  currentCategory.value = cat
  load()
}


const clearDone = () => {
  if (doneCount.value === 0) {
    return uni.showToast({ title: '暂无已购买的物品', icon: 'none' });
  }
  uni.showModal({
    title: '清理提示',
    content: '确定要一键清空所有已购买的项吗？',
    confirmColor: '#FF7DA8',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '清理中...' })
        try {
          // 1. 先同步到库存 (如果是新增物品)
          // const doneItems = list.value.filter(item => item.done)
          // if (doneItems.length > 0) {
          //   const syncRes = await uni.showModal({
          //     title: '同步提示',
          //     content: '是否将这些已购物品同步到「食材库存」中？',
          //     confirmText: '同步',
          //     cancelText: '仅清理'
          //   })
            
          //   if (syncRes.confirm) {
          //     uni.showLoading({ title: '同步中...' })
          //     for (const item of doneItems) {
          //       // 走新增食材接口
          //       await stockApi.addStock({
          //         familyCode,
          //         name: item.name,
          //         num: item.num,
          //         categoryId: item.categoryId,
          //         has: true
          //       })
          //     }
          //   }
          // }

          // 2. 执行清理
          
          const res = await shopApi.clearPurchasedFamilyShoppingItems(familyCode)
          if (res.data) {
            load()
          }
          uni.showToast({ title: '操作完成', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  });
}

const deleteItem = (item) => {
  uni.showModal({
    title: '删除提示',
    content: `确定要移除「${item.name}」吗？`,
    confirmColor: '#FF7DA8',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' })
        try {
          await shopApi.deleteFamilyShoppingItem(familyCode,item.id)
          load()
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  });
}

const openAddModal = () => {
  modalMode.value = 'add';
  editData.value = {};
  showModal.value = true;
}

const goAdd = () => {
  uni.navigateTo({ url: '/pages/shop/component/addShop' })
}

// ======================== 智能批量输入 ========================
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

const parseSmartInput = (text) => {
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
    const batchSize = 5
    const items = [...parsedItems.value]
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      await Promise.all(batch.map(name => {
        const shoppingItemJson = {
          name,
          categoryId: smartCategoryId.value || null,
          categoryName,
          done: false
        }
        return shopApi.saveFamilyShoppingItem(familyCode, shoppingItemJson)
      }))
      smartSavedCount.value += batch.length
    }
    uni.showToast({ title: `已新增 ${items.length} 个物品`, icon: 'success' })
    closeSmartInput()
    load()
  } catch (e) {
    console.error('批量新增失败', e)
    uni.showToast({ title: '部分物品保存失败', icon: 'none' })
  } finally {
    smartSaving.value = false
  }
}
// ======================== 智能批量输入 ========================

const openEditModal = (item) => {
  modalMode.value = 'edit';
  editData.value = {
    id: item.id,
    name: item.name,
    num: item.num || '',
    price: item.price || '',
    categoryName: item.categoryName || '其他'
  };
  showModal.value = true;
}

const reAdd = (item) => {
  modalMode.value = 'add';
  editData.value = {
    id: '',
    name: item.name,
    num: item.num || '',
    price: item.price || '',
    categoryName: item.categoryName || '其他'
  };
  showModal.value = true;
}

const saveModal = async () => {
  if (!editData.value.name) {
    return uni.showToast({ title: '必须要填写物品名称哦', icon: 'none' });
  }
  
  // uni.showLoading({ title: '保存中...' })
  try {
    if (modalMode.value === 'add') {
      const newItem = {
        name: editData.value.name,
        num: editData.value.num,
        price: editData.value.price,
        categoryId: editData.value.categoryId,
        done: false
      }
      await shopApi.saveFamilyShoppingItem(familyCode, newItem)
      uni.showToast({ title: '添加成功', icon: 'success' })
    } else {
      let shoppingItemJson = {
        id: editData.value.id,
        name: editData.value.name,
        num: editData.value.num,
        price: editData.value.price,
        categoryId: editData.value.categoryId,
      }
      await shopApi.updateFamilyShoppingItem(familyCode, shoppingItemJson)
      uni.showToast({ title: '修改成功', icon: 'success' })
    }
    showModal.value = false
    load() // 重新加载获取真实 ID
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const checkCost = () => {
  uni.navigateTo({ url: '/pages/cost/cost' })
}



// 主题系统
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
</script>

<style lang="less" scoped>
.page {
  // background: #FAFAFA;
  height: ~"calc(100vh - 170rpx)";
  // padding-bottom: 180rpx;
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
  &.smart {
    background: var(--primary-grad);
    color: #fff;
    border: none;
    box-shadow: 0 6rpx 16rpx var(--primary-shadow);
  }
  &::after {
    border: none;
  }
}

/* 底部悬浮统计区域动画样式 */
.stat-wrapper {
  position: fixed;
  bottom: 222rpx;
  left: 40rpx;
  z-index: 200;
  display: flex;
  align-items: center;
}

.stat-card-anim {
  background: var(--primary-grad);
  border-radius: 100rpx;
  box-shadow: 0 8rpx 30rpx var(--primary-shadow);
  height: 90rpx;
  width: 90rpx; /* 圆形状态 */
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.stat-wrapper.is-expanded .stat-card-anim {
  width: calc(100vw - 80rpx); /* 展开状态宽度，保持原版 40rpx 边距 */
  background: #fff; /* 展开后变成白色卡片 */
  border-radius: 24rpx; /* 恢复原版圆角 */
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05); /* 恢复原版阴影 */
}

/* 收起时的状态 */
.stat-collapsed {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: opacity 0.3s;
  opacity: 1;
}
.stat-collapsed.hide {
  opacity: 0;
  pointer-events: none;
}
.circle-icon {
  font-size: 20rpx;
  font-weight: 900;
}
.circle-text {
  font-size: 20rpx;
  font-weight: bold;
  margin-top: 4rpx;
}

/* 展开时的状态 */
.stat-expanded-content {
  position: absolute;
  left: 0; top: 0;
  width: calc(100vw - 80rpx);
  height: 100%;
  padding: 0 30rpx 0 10rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  opacity: 0;
  transition: opacity 0.3s 0.1s; /* 延迟出现 */
  pointer-events: none;
}
.stat-expanded-content.show {
  opacity: 1;
  pointer-events: auto;
}

.start-row{
  display: flex;
}

.shouqi {
  font-size: 30rpx;
  color: var(--primary);
  font-weight: bold;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 30rpx;
}

.stat-text {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 26rpx;
  color: var(--primary);
}

.stat-money {
  font-size: 32rpx;
  color: var(--primary);
  font-weight: bold;
}

.stat-money-num {
  font-weight: bold;
  text-decoration: underline;
}

.main-layout {
  display: flex;
  align-items: flex-start;
  padding: 0 20rpx;
  flex: 1;
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
  height: 260rpx;
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
    // border: 2rpx dashed var(--primary) !important;
    // border-radius: 20rpx;
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

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 150rpx;
  color: #C0C0C0;
  font-size: 28rpx;
}

.item-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 30rpx 30rpx 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.03);
  transition: all 0.3s;
  
  &.is-done {
    opacity: 0.6;
    background: #FAFAFA;
    border-radius: 20rpx;
    .name {
      color: #A0A0A0;
      text-decoration: line-through;
    }
    .num, .price {
      color: #A0A0A0;
    }
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
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
  transition: color 0.3s;
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
  margin-bottom: 18rpx;
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.num, .price {
  font-size: 26rpx;
  color: #888;
  transition: color 0.3s;
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

/* 自定义勾选框 */
.custom-check {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 4rpx solid var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s;
  background: transparent;
  
  &.checked {
    background: var(--primary-grad);
    border-color: transparent;
    box-shadow: 0 4rpx 12rpx var(--primary-shadow);
  }
  
  .check-icon {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    line-height: 1;
  }
}

/* 购买确认弹窗专有样式 */
.purchase-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
  gap: 8rpx;
  
  .purchase-item-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #2C3E50;
  }
  
  .purchase-item-desc {
    font-size: 24rpx;
    color: #95A5A6;
  }
}

.price-input-container {
  position: relative;
  display: flex;
  align-items: center;
  background: #F8F9FA;
  border-radius: 24rpx;
  margin-bottom: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  
  &:focus-within {
    border-color: var(--primary);
    background: #FFF;
  }
  
  .price-symbol {
    position: absolute;
    left: 30rpx;
    font-size: 36rpx;
    font-weight: bold;
    color: var(--primary);
  }
  
  .price-input-field {
    flex: 1;
    height: 90rpx;
    padding: 0 30rpx 0 70rpx;
    font-size: 36rpx;
    font-weight: bold;
    color: #2C3E50;
    margin-bottom: 0; // 覆盖默认 modal-input 的 margin-bottom
    border: none !important;
    background: transparent !important;
  }
}

.sync-checkboxes {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40rpx;
  width: 100%;
  
  .sync-checkbox-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    cursor: pointer;
    
    .checkbox-text {
      font-size: 26rpx;
      color: #7F8C8D;
      font-weight: bold;
    }
  }
}

/* 弹窗样式 */
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
  &::after { border: none; }
}

.cancel-btn {
  background: #F5F5F5;
  color: #666;
}

.confirm-btn {
  background: var(--primary-grad);
  color: #fff;
  box-shadow: 0 8rpx 20rpx var(--primary-shadow);
  &::after { border: none; }
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

// ======================== 智能输入弹窗 ========================
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
  &:focus { border-color: var(--primary); }
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
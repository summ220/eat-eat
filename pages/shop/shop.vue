<template>
  <custom-header title="购物清单" icon="🛒" />
  <view class="page" :style="themeStyle">
    <view class="top-actions-bar">
      <button class="action-btn-top clear" @click="clearDone">清空已购</button>
      <button class="action-btn-top add" @click="goAdd">+ 新增</button>
    </view>

    <view class="main-layout">
      <!-- 左侧分类侧边栏 -->
      <view class="sidebar">
        <view class="nav-item" :class="{ active: currentCategory === '全部' }" @click="switchCategory('全部')">
          <text class="nav-text">全部</text>
        </view>
        <view class="nav-item" v-for="cat in categories" :key="cat" :class="{ active: currentCategory === cat }" @click="switchCategory(cat)">
          <text class="nav-text">{{ cat }}</text>
        </view>
        <view class="nav-item add-cat-btn-side" @click="showCatModal = true">
          <text class="nav-text" style="color: var(--primary)">+ 添加分类</text>
        </view>
      </view>

      <!-- 右侧购物车列表 -->
      <view class="list-container">
        <view class="empty" v-if="filteredList.length === 0">
          <text>暂无购物车内容</text>
        </view>

        <view class="item-card" :class="{ 'is-done': item.done }" v-for="item in filteredList" :key="item.id">
          <view class="item-header">
            <view class="title-group">
              <text class="name">{{ item.name }}</text>
              <text class="cat-tag" v-if="currentCategory === '全部'">{{ item.category || '其他' }}</text>
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
            <text class="price" v-if="item.price && item.price !== ''">预估单价: ¥ {{ item.price }}</text>
          </view>

          <view class="item-footer">
            <text class="action-btn edit" @click="openEditModal(item)">✏️ 编辑</text>
            <text class="action-btn delete" @click="deleteItem(item)">🗑️ 删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加与编辑共用弹窗 -->
    <view class="modal-mask" v-if="showModal" @click="showModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{ modalMode === 'add' ? '添加物品' : '编辑物品' }}</text>
        
        <input class="modal-input" v-model="editData.name" placeholder="物品名称 (必填)" />
        <input class="modal-input" v-model="editData.num" placeholder="数量/单位 (选填，如 2斤)" />
        <input class="modal-input" type="digit" v-model="editData.price" placeholder="花费/单价 ¥ (选填)" />
        
        <view class="modal-tags">
          <text 
            class="tag" 
            :class="{ active: editData.category === cat }" 
            v-for="cat in categories" 
            :key="cat" 
            @click="editData.category = cat"
          >{{ cat }}</text>
        </view>
        
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
            <text>{{ cat }}</text>
            <text class="del-cat" @click="removeCategory(idx)">删除</text>
          </view>
        </view>
        <view class="add-cat-box">
          <input class="add-cat-input" v-model="newCat" placeholder="新分类名称" />
          <view class="add-cat-btn-modal" @click="addCategory">添加</view>
        </view>
        <!-- <button class="close-modal-btn" @click="showCatModal = false">完成</button> -->
      </view>
    </view>

    <!-- 底部统计栏 -->
    <view class="stat-card">
      <text class="stat-text">已购买 {{ doneCount }}/{{ list.length }} 件</text>
      <text class="stat-money">本次花费：¥ <text class="stat-money-num" @click="checkCost">{{ totalCost }}</text></text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const list = ref([])
const categories = ref([])
const currentCategory = ref('全部')

// 分类管理
const showCatModal = ref(false)
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
  showCatModal.value = false
}
const removeCategory = (idx) => {
  categories.value.splice(idx, 1)
  uni.setStorageSync('ingredient_categories', categories.value)
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

const showModal = ref(false)
const modalMode = ref('add')
const editData = ref({
  id: '',
  name: '',
  num: '',
  price: '',
  category: '蔬菜'
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
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  loadCategories()
  if (!categories.value.includes(currentCategory.value) && currentCategory.value !== '全部') {
    currentCategory.value = '全部'
  }
  load()
})

const load = async () => {
  const familyId = uni.getStorageSync('family_id') || 'default_family';
  try {
    const data = await eatCo.getShopList(familyId)
    list.value = data.map(item => {
      item.id = item._id
      item.done = !!item.done
      return item
    })
    // 加载后初始化显示顺序
    buildSortedIds()
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 切换分类时重新构建顺序快照
const switchCategory = (cat) => {
  currentCategory.value = cat
  buildSortedIds()
}

// 移除本地 save 方法
// const save = () => { ... }

const toggle = async (item) => {
  const newDone = !item.done
  item.done = newDone // 乐观更新
  try {
    await eatCo.updateShop(item._id, { done: newDone })
    if (newDone && item.price && parseFloat(item.price) > 0) {
      // 购买后自动记账
      const costItem = {
        name: item.name,
        price: item.price,
        date: new Date().toISOString().split('T')[0],
        category: '餐饮',
        type: 'out',
        remark: '购物自动记账',
        family_id: uni.getStorageSync('family_id') || 'default_family'
      };
      await eatCo.addCost(costItem);
      uni.showToast({ title: '已自动记账', icon: 'success' })
    }
  } catch (e) {
    item.done = !newDone // 回滚
    uni.showToast({ title: '更新失败', icon: 'none' })
  }
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
          const doneItems = list.value.filter(item => item.done)
          if (doneItems.length > 0) {
            const syncRes = await uni.showModal({
              title: '同步提示',
              content: '是否将这些已购物品同步到「食材库存」中？',
              confirmText: '同步',
              cancelText: '仅清理'
            })
            
            if (syncRes.confirm) {
              uni.showLoading({ title: '同步中...' })
              for (const item of doneItems) {
                await eatCo.addStock({
                  name: item.name,
                  num: item.num,
                  category: item.category || '其他',
                  has: true,
                  family_id: uni.getStorageSync('family_id') || 'default_family'
                })
              }
            }
          }

          // 2. 执行清理
          await eatCo.clearDoneShop()
          list.value = list.value.filter(item => !item.done)
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
          await eatCo.deleteShop(item._id)
          list.value = list.value.filter(v => v.id !== item.id)
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
  uni.navigateTo({ url: '/pages/addShop/addShop' })
}

const openEditModal = (item) => {
  modalMode.value = 'edit';
  editData.value = {
    id: item.id,
    name: item.name,
    num: item.num || '',
    price: item.price || '',
    category: item.category || '其他'
  };
  showModal.value = true;
}

const saveModal = async () => {
  if (!editData.value.name) {
    return uni.showToast({ title: '必须要填写物品名称哦', icon: 'none' });
  }
  
  uni.showLoading({ title: '保存中...' })
  try {
    if (modalMode.value === 'add') {
      const newItem = {
        name: editData.value.name,
        num: editData.value.num,
        price: editData.value.price,
        category: editData.value.category,
        done: false
      }
      await eatCo.addShop(newItem)
      uni.showToast({ title: '添加成功', icon: 'success' })
    } else {
      await eatCo.updateShop(editData.value.id, {
        name: editData.value.name,
        num: editData.value.num,
        price: editData.value.price,
        category: editData.value.category
      })
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
</script>

<style lang="less" scoped>
.page {
  background: #FAFAFA;
  min-height: ~"calc(100vh - 80rpx)";
  padding-bottom: 180rpx;
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 400rpx);
}

.top-actions-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20rpx 40rpx;
  gap: 20rpx;
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

.stat-card {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  margin: 0 40rpx 30rpx;
  border-radius: 24rpx;
  padding: 30rpx;
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-text {
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
}

.sidebar {
  position: sticky;
  top: 130rpx;
  width: 170rpx;
  background: #fff;
  border-radius: 36rpx;
  padding: 20rpx 0;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  max-height: calc(100vh - 280rpx);
  overflow-y: auto;
}

.nav-item {
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
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
}

.list-container {
  flex: 1;
  padding-left: 20rpx;
  display: flex;
  flex-direction: column;
}

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
  padding: 30rpx;
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
  margin-bottom: 24rpx;
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
</style>
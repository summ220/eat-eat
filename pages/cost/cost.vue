<template>
  <custom-header title="花费账本" icon="💰" />
  <view class="page" :style="themeStyle">
    <!-- 月份切换栏 -->
    <view class="month-selector">
      <view class="arrow-btn" @click="changeMonth(-1)"><text class="arrow">◀</text></view>
      <text class="month-text">{{ displayMonthString }}</text>
      <view class="arrow-btn" @click="changeMonth(1)"><text class="arrow">▶</text></view>
    </view>

    <!-- 顶部本月统计卡片 -->
    <view class="header-card">
      <text class="title">{{ summaryTitle }} 总花费</text>
      <text class="total-money">¥{{ currentMonthTotal }}</text>
      <view class="ratio-wrap" v-if="currentMonthRatioText">
        <text class="ratio-text">{{ currentMonthRatioText }}</text>
      </view>
    </view>

    <!-- 分类筛选横向列表 -->
    <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
      <view class="category-list">
        <view 
          class="cat-item" 
          :class="{ active: currentCategory === '全部' }" 
          @click="currentCategory = '全部'"
        >全部</view>
        <view 
          class="cat-item" 
          v-for="cat in categories" 
          :key="cat" 
          :class="{ active: currentCategory === cat }" 
          @click="currentCategory = cat"
        >{{ cat }}</view>
      </view>
    </scroll-view>

    <!-- 历史花费列表（按月份分组折叠） -->
    <view class="list-section">
      <view class="empty" v-if="Object.keys(groupedList).length === 0">
        <text>暂无记录哦~</text>
      </view>

      <view class="month-group" v-for="(items, monthKey) in groupedList" :key="monthKey">
        <!-- 分组标题层 -->
        <view class="group-header" @click="toggleGroup(monthKey)">
          <text class="group-title">{{ formatMonthKey(monthKey) }}</text>
          <view class="group-right">
            <text class="group-count">共 {{ items.length }} 笔</text>
            <text class="group-arrow" :class="{ rotated: expandedMonths.includes(monthKey) }">▶</text>
          </view>
        </view>

        <!-- 分组内容层 -->
        <view class="group-content" v-if="expandedMonths.includes(monthKey)">
          <view class="list-item" v-for="(item, index) in items" :key="item.id">
            <view class="item-content-wrap">
              <view class="delete-btn" @click="deleteItem(item)">删除</view>
              
              <view 
                class="item-content" 
                :style="{ transform: 'translateX(' + (item.translateX || 0) + 'px)' }"
                @touchstart="touchStart($event, item)"
                @touchmove="touchMove($event, item)"
                @touchend="touchEnd($event, item)"
                @click="openModal('edit', item)"
              >
                <view class="item-left">
                  <view class="cat-tag">{{ item.category }}</view>
                  <view class="item-info">
                    <text class="name">{{ item.name || '杂项' }}</text>
                    <text class="date">{{ item.date }}</text>
                  </view>
                </view>
                <text class="price">¥{{ parseFloat(item.price).toFixed(2) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="float-btn" @click="openModal('add')">
      <text>+ 添加花费</text>
    </view>

    <!-- 添加与编辑表单弹窗 -->
    <view class="modal-mask" v-if="showModal" @click="showModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{ modalMode === 'add' ? '新增花费' : '编辑花费' }}</text>
        <view class="input-group">
          <input type="digit" v-model="editForm.price" placeholder="金额 ¥ (必填)" class="input-line" />
          <input v-model="editForm.name" placeholder="备注/物品名称" class="input-line" />
          <picker mode="date" :value="editForm.date" @change="onDateChange">
            <view class="input-line picker-line">日期：{{ editForm.date }}</view>
          </picker>
        </view>
        
        <view class="modal-tags">
          <text 
            class="m-tag" 
            :class="{ active: editForm.category === cat }" 
            v-for="cat in categories" 
            :key="cat" 
            @click="editForm.category = cat"
          >{{ cat }}</text>
        </view>

        <view class="modal-btns">
          <button class="btn btn-cancel" @click="showModal = false">取消</button>
          <button class="btn btn-confirm" @click="saveModal">保存</button>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

import eatCo from '@/common/localDB.js'

// ---- 核心状态 ----
const categories = ['蔬菜', '水果', '肉蛋', '水产', '调料', '其他']
const currentCategory = ref('全部')
const list = ref([])

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

// 月份选中逻辑
const currentDate = ref(new Date())

const displayMonthString = computed(() => {
  return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`
})

const currentMonthKey = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
})

const summaryTitle = computed(() => {
  const t = new Date()
  if (t.getFullYear() === currentDate.value.getFullYear() && t.getMonth() === currentDate.value.getMonth()) {
    return '本月'
  }
  return displayMonthString.value
})

const expandedMonths = ref([])

const changeMonth = (delta) => {
  const nd = new Date(currentDate.value)
  nd.setMonth(nd.getMonth() + delta)
  currentDate.value = nd
  
  // 切换月份后，默认打开对应面板
  const key = currentMonthKey.value
  if (!expandedMonths.value.includes(key)) {
    expandedMonths.value.push(key)
  }
}

// 弹窗状态
const showModal = ref(false)
const modalMode = ref('add')
const editForm = ref({
  id: '', price: '', name: '', date: '', category: '蔬菜'
})

// ---- 初始化与加载 ----
onShow(() => {
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  load()
})

const load = async () => {
  const familyId = uni.getStorageSync('family_id') || 'default_family';
  try {
    const data = await eatCo.getCostList(familyId)
    list.value = data.map(item => {
      item.id = item._id
      item.translateX = 0
      return item
    })
    
    // 默认展开当前月
    if (!expandedMonths.value.includes(currentMonthKey.value)) {
      expandedMonths.value.push(currentMonthKey.value)
    }
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 移除本地 save 方法
// const save = () => { ... }

// ---- 数据计算 ----
const filteredList = computed(() => {
  if (currentCategory.value === '全部') return list.value
  return list.value.filter(item => item.category === currentCategory.value)
})

// 分组与排序
const groupedList = computed(() => {
  const groups = {}
  filteredList.value.forEach(item => {
    const mk = item.date.substring(0, 7)
    if (!groups[mk]) groups[mk] = []
    groups[mk].push(item)
  })
  
  const sortedKeys = Object.keys(groups).sort((a,b) => b.localeCompare(a))
  const sortedGroups = {}
  sortedKeys.forEach(k => {
    sortedGroups[k] = groups[k].sort((a, b) => b.date.localeCompare(a.date))
  })
  return sortedGroups
})

const formatMonthKey = (key) => {
  const parts = key.split('-')
  return `${parts[0]}年${parseInt(parts[1], 10)}月`
}

const toggleGroup = (key) => {
  const idx = expandedMonths.value.indexOf(key)
  if (idx > -1) {
    expandedMonths.value.splice(idx, 1)
  } else {
    expandedMonths.value.push(key)
  }
}

// 统计特定显示月份的数据
const currentDisplayItems = computed(() => {
  return list.value.filter(item => item.date.startsWith(currentMonthKey.value))
})

const currentMonthTotal = computed(() => {
  let total = 0
  currentDisplayItems.value.forEach(item => {
    total += parseFloat(item.price || 0)
  })
  return total.toFixed(2)
})

const currentMonthRatioText = computed(() => {
  if (currentDisplayItems.value.length === 0) return ''
  let acc = 0
  const map = {}
  currentDisplayItems.value.forEach(item => {
    const p = parseFloat(item.price || 0)
    acc += p
    if (!map[item.category]) map[item.category] = 0
    map[item.category] += p
  })
  
  if (acc === 0) return ''
  
  const sorted = Object.keys(map).map(cat => {
    return { cat, ratio: Math.round((map[cat] / acc) * 100) }
  }).filter(c => c.ratio > 0).sort((a, b) => b.ratio - a.ratio)
  
  if(sorted.length === 0) return ''
  if(sorted.length === 1) return `占比明细：${sorted[0].cat} ${sorted[0].ratio}%`
  
  return `核心占比：${sorted[0].cat} ${sorted[0].ratio}%，${sorted[1].cat} ${sorted[1].ratio}%`
})

// ---- 交互逻辑 ----
const onDateChange = (e) => {
  editForm.value.date = e.detail.value
}

const openModal = (mode, item = null) => {
  modalMode.value = mode
  if (mode === 'add') {
    // 默认给选中月份的最后一天或者今天
    const t = new Date()
    let dStr = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
    if (currentMonthKey.value !== `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}`) {
      dStr = `${currentMonthKey.value}-01`
    }
    editForm.value = {
      id: '', price: '', name: '', date: dStr, category: currentCategory.value === '全部' ? '蔬菜' : currentCategory.value
    }
  } else {
    editForm.value = { ...item }
    item.translateX = 0
  }
  showModal.value = true
}

const saveModal = async () => {
  if (!editForm.value.price) {
    return uni.showToast({ title: '请输入金额', icon: 'none' })
  }
  
  const priceNum = parseFloat(editForm.value.price)
  if (isNaN(priceNum)) return uni.showToast({ title: '请输入有效金额', icon: 'none' })

  uni.showLoading({ title: '保存中...' })
  try {
    const costData = {
      price: priceNum,
      name: editForm.value.name,
      date: editForm.value.date,
      category: editForm.value.category,
      family_id: uni.getStorageSync('family_id') || 'default_family'
    }

    if (modalMode.value === 'add') {
      await eatCo.addCost(costData)
      uni.showToast({ title: '添加成功', icon: 'success' })
    } else {
      await eatCo.updateCost(editForm.value.id, costData)
      uni.showToast({ title: '修改成功', icon: 'success' })
    }
    
    showModal.value = false
    load() // 重新加载
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

const deleteItem = (item) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条花费记录吗？',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' })
        try {
          await eatCo.deleteCost(item.id)
          uni.showToast({ title: '已删除', icon: 'success' })
          load()
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// ---- 左滑删除原生控制 ----
let startX = 0
let currentTouchItem = null
const touchStart = (e, item) => {
  if (e.changedTouches.length > 0) {
    startX = e.changedTouches[0].clientX
    currentTouchItem = item
  }
}
const touchMove = (e, item) => {
  if (e.changedTouches.length > 0 && currentTouchItem === item) {
    let deltaX = e.changedTouches[0].clientX - startX
    if (deltaX < 0 && deltaX >= -120) {
      item.translateX = deltaX
    } else if (deltaX > 0 && item.translateX < 0) {
      item.translateX = Math.min(0, -100 + deltaX)
    }
  }
}
const touchEnd = (e, item) => {
  if (e.changedTouches.length > 0 && currentTouchItem === item) {
    let deltaX = e.changedTouches[0].clientX - startX
    if (item.translateX < -40) {
      item.translateX = -120
    } else {
      item.translateX = 0
    }
    currentTouchItem = null
  }
}
</script>

<style lang="less" scoped>
.page {
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 100%);
  background-color: var(--primary-light);
  min-height: ~"calc(100vh - 80rpx)";
  padding: 30rpx 24rpx 40rpx;
}

// 头部月份切换栏
.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0 30rpx;
  .arrow-btn {
    padding: 10rpx 40rpx;
    .arrow {
      color: var(--primary);
      font-size: 28rpx;
    }
  }
  .month-text {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    min-width: 180rpx;
    text-align: center;
  }
}

// 顶部本月统计卡片
.header-card {
  position: relative;
  background: var(--primary-grad);
  border-radius: 40rpx;
  padding: 60rpx 30rpx;
  text-align: center;
  box-shadow: 0 16rpx 40rpx var(--primary-shadow);
  margin-bottom: 40rpx;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    right: -40rpx;
    top: -40rpx;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
  }

  .title {
    color: rgba(255, 255, 255, 0.9);
    font-size: 28rpx;
    display: block;
    margin-bottom: 15rpx;
  }
  .total-money {
    color: #fff;
    font-size: 72rpx;
    font-weight: 800;
    display: block;
  }
  .ratio-wrap {
    margin-top: 30rpx;
    background: rgba(255,255,255,0.25);
    display: inline-block;
    padding: 8rpx 30rpx;
    border-radius: 100rpx;
    .ratio-text {
      color: #fff;
      font-size: 24rpx;
      font-weight: 500;
    }
  }
}

// 分类筛选横向列表
.category-scroll {
  white-space: nowrap;
  margin-bottom: 30rpx;
}

.category-list {
  display: inline-flex;
  .cat-item {
    display: inline-block;
    padding: 14rpx 36rpx;
    margin-right: 20rpx;
    background: #fff;
    color: #666;
    border-radius: 40rpx;
    font-size: 26rpx;
    transition: all 0.3s;
    &.active {
      background: var(--primary);
      color: #fff;
      font-weight: bold;
      box-shadow: 0 4rpx 12rpx var(--primary-shadow);
    }
  }
}

// 历史花费列表区
.list-section {
  .empty {
    text-align: center;
    color: var(--primary);
    font-size: 28rpx;
    margin-top: 80rpx;
  }
}

.month-group {
  margin-bottom: 30rpx;
  background: #fff;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.03);

  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 36rpx;
    background: #fff;
    border-bottom: 2rpx solid #FAFAFA;
    position: relative;
    z-index: 5;
    
    .group-title {
      font-size: 32rpx;
      font-weight: 800;
      color: #333;
    }
    
    .group-right {
      display: flex;
      align-items: center;
      .group-count {
        font-size: 24rpx;
        color: #999;
        margin-right: 16rpx;
      }
      .group-arrow {
        font-size: 24rpx;
        color: var(--primary);
        transition: transform 0.3s;
        &.rotated {
          transform: rotate(90deg);
        }
      }
    }
  }

  .group-content {
    background: #fff;
  }
}

// 列表单项及其左滑布局
.list-item {
  position: relative;
  overflow: hidden;
  border-bottom: 2rpx solid var(--primary-light);
  &:last-child {
    border-bottom: none;
  }
}

.item-content-wrap {
  position: relative;
  width: 100%;
}

.delete-btn {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 120rpx;
  background: #FF4D6D;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
  z-index: 1;
}

.item-content {
  position: relative;
  background: #fff;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);

  .item-left {
    display: flex;
    align-items: center;
  }

  .cat-tag {
    background: var(--primary-light);
    color: var(--primary);
    font-size: 20rpx;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
    margin-right: 20rpx;
    font-weight: bold;
  }

  .item-info {
    display: flex;
    flex-direction: column;
    .name {
      font-size: 30rpx;
      color: #333;
      margin-bottom: 8rpx;
    }
    .date {
      font-size: 24rpx;
      color: #999;
    }
  }

  .price {
    font-size: 34rpx;
    font-weight: bold;
    color: var(--primary);
  }
}

// 悬浮层加号
.float-btn {
  position: fixed;
  right: 40rpx;
  bottom: 160rpx;
  background: var(--primary-grad);
  color: #fff;
  border-radius: 100rpx;
  padding: 24rpx 40rpx;
  box-shadow: 0 8rpx 24rpx var(--primary-shadow);
  font-size: 32rpx;
  font-weight: bold;
  z-index: 50;
  transition: transform 0.2s;
  &:active {
    transform: scale(0.95);
  }
}

/* 遮罩与弹窗 */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  
  .modal-title {
    display: block;
    text-align: center;
    font-size: 34rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 30rpx;
  }
}

.input-group {
  .input-line {
    background: #F9F9F9;
    border-radius: 12rpx;
    height: 84rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    margin-bottom: 24rpx;
    border: 2rpx solid transparent;
    transition: border 0.3s;
    &:focus {
      border: 2rpx solid var(--primary);
    }
  }
  .picker-line {
    line-height: 84rpx;
    color: #666;
  }
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 40rpx;
  
  .m-tag {
    background: #F5F5F5;
    color: #666;
    padding: 12rpx 30rpx;
    border-radius: 40rpx;
    font-size: 26rpx;
    transition: all 0.2s;
    &.active {
      background: var(--primary);
      color: #fff;
    }
  }
}

.modal-btns {
  display: flex;
  gap: 20rpx;
  
  .btn {
    flex: 1;
    border-radius: 40rpx;
    font-size: 30rpx;
    height: 84rpx;
    line-height: 84rpx;
    margin: 0;
    &::after { border: none; }
  }
  .btn-cancel {
    background: #F5F5F5;
    color: #666;
  }
  .btn-confirm {
    background: var(--primary-grad);
    color: #fff;
    box-shadow: 0 4rpx 16rpx var(--primary-shadow);
  }
}
</style>

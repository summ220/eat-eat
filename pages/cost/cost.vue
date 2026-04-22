<template>
  <view class="page">
    
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
    <view class="modal-mask" v-if="showModal">
      <view class="modal-content">
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

// ---- 核心状态 ----
const categories = ['蔬菜', '水果', '肉蛋', '水产', '调料', '其他']
const currentCategory = ref('全部')
const list = ref([])

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
  load()
})

const load = () => {
  let data = uni.getStorageSync('costRecords')
  if (!data || data.length === 0) {
    // 注入模拟数据，演示折叠与当年当月统计功能
    const d = new Date()
    const ty = d.getFullYear()
    const tm = String(d.getMonth() + 1).padStart(2, '0')
    const td = String(d.getDate()).padStart(2, '0')
    
    // 上月
    const lmD = new Date()
    lmD.setMonth(lmD.getMonth() - 1)
    const lmy = lmD.getFullYear()
    const lmm = String(lmD.getMonth() + 1).padStart(2, '0')

    data = [
      { id: '1', date: `${ty}-${tm}-${td}`, name: '排骨和五花肉', price: '65.50', category: '肉蛋' },
      { id: '2', date: `${ty}-${tm}-02`, name: '生菜洋葱', price: '12.80', category: '蔬菜' },
      { id: '3', date: `${lmy}-${lmm}-15`, name: '海鱼', price: '45.00', category: '水产' },
      { id: '4', date: `${lmy}-${lmm}-10`, name: '盐和酱油', price: '15.00', category: '调料' }
    ]
    uni.setStorageSync('costRecords', data)
  }
  
  list.value = data.map(item => {
    item.translateX = 0
    return item
  })
  
  // 默认展开当前月
  if (!expandedMonths.value.includes(currentMonthKey.value)) {
    expandedMonths.value.push(currentMonthKey.value)
  }
}

const save = () => {
  const dataToSave = list.value.map(item => ({
    id: item.id,
    price: item.price,
    name: item.name,
    date: item.date,
    category: item.category
  }))
  uni.setStorageSync('costRecords', dataToSave)
}

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

const saveModal = () => {
  if (!editForm.value.price) {
    return uni.showToast({ title: '请输入金额', icon: 'none' })
  }
  if (modalMode.value === 'add') {
    list.value.unshift({
      id: 'cost_' + Date.now(),
      price: editForm.value.price,
      name: editForm.value.name,
      date: editForm.value.date,
      category: editForm.value.category,
      translateX: 0
    })
    
    // 如果新增了不在当前选中月的数据，可以自动选过去或展开
    const mk = editForm.value.date.substring(0, 7)
    if (!expandedMonths.value.includes(mk)) {
      expandedMonths.value.push(mk)
    }
    
  } else {
    const idx = list.value.findIndex(v => v.id === editForm.value.id)
    if (idx !== -1) {
      list.value[idx].price = editForm.value.price
      list.value[idx].name = editForm.value.name
      list.value[idx].date = editForm.value.date
      list.value[idx].category = editForm.value.category
      
      const mk = editForm.value.date.substring(0, 7)
      if (!expandedMonths.value.includes(mk)) {
        expandedMonths.value.push(mk)
      }
    }
  }
  save()
  showModal.value = false
  uni.showToast({ title: '保存成功', icon: 'success' })
}

const deleteItem = (item) => {
  list.value = list.value.filter(v => v.id !== item.id)
  save()
  uni.showToast({ title: '已删除', icon: 'none' })
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
  background: #FFF5F7;
  min-height: ~"calc(100vh - 80rpx)";
  padding: 30rpx;
  padding-bottom: 160rpx;
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
      color: #FF8DA1;
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
  background: #FF8DA1;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 141, 161, 0.25);
  margin-bottom: 30rpx;
  .title {
    color: rgba(255, 255, 255, 0.9);
    font-size: 28rpx;
    display: block;
    margin-bottom: 15rpx;
  }
  .total-money {
    color: #fff;
    font-size: 64rpx;
    font-weight: bold;
    display: block;
  }
  .ratio-wrap {
    margin-top: 20rpx;
    background: rgba(255,255,255,0.2);
    display: inline-block;
    padding: 6rpx 24rpx;
    border-radius: 30rpx;
    .ratio-text {
      color: #fff;
      font-size: 24rpx;
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
      background: #FF8DA1;
      color: #fff;
      font-weight: bold;
      box-shadow: 0 4rpx 12rpx rgba(255, 141, 161, 0.2);
    }
  }
}

// 历史花费列表区
.list-section {
  .empty {
    text-align: center;
    color: #FFB3C1;
    font-size: 28rpx;
    margin-top: 80rpx;
  }
}

.month-group {
  margin-bottom: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(255, 141, 161, 0.05);

  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 30rpx;
    background: #fdfdfd;
    border-bottom: 2rpx solid #FFF5F7;
    position: relative;
    z-index: 5;
    
    .group-title {
      font-size: 30rpx;
      font-weight: bold;
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
        color: #FF8DA1;
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
  border-bottom: 2rpx solid #FFF5F7;
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
    background: #FFF0F3;
    color: #FF8DA1;
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
    color: #FF8DA1;
  }
}

// 悬浮层加号
.float-btn {
  position: fixed;
  right: 40rpx;
  bottom: 160rpx;
  background: #FF8DA1;
  color: #fff;
  border-radius: 100rpx;
  padding: 24rpx 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 141, 161, 0.4);
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
      border: 2rpx solid #FF8DA1;
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
      background: #FF8DA1;
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
    background: #FF8DA1;
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(255, 141, 161, 0.3);
  }
}
</style>

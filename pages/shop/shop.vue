<template>
  <view class="page">
    <view class="top-bar">
      <text class="title">🛒 购物清单</text>
      <view class="top-actions">
        <button class="action-btn-top clear" @click="clearDone">清空已购</button>
        <button class="action-btn-top add" @click="goAdd">+ 新增</button>
      </view>
    </view>

    <view class="main-layout">
      <!-- 左侧分类侧边栏 -->
      <view class="sidebar">
        <view class="nav-item" :class="{ active: currentCategory === '全部' }" @click="currentCategory = '全部'">
          <text class="nav-text">全部</text>
        </view>
        <view class="nav-item" v-for="cat in categories" :key="cat" :class="{ active: currentCategory === cat }" @click="currentCategory = cat">
          <text class="nav-text">{{ cat }}</text>
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
            <switch :checked="item.done" @change="toggle(item)" color="#FF93B6" style="transform: scale(0.8); margin-right: -10rpx;" />
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
    <view class="modal-mask" v-if="showModal">
      <view class="modal-content">
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
const categories = ['蔬菜', '水果', '肉蛋', '水产', '调料', '其他']
const currentCategory = ref('全部')

const showModal = ref(false)
const modalMode = ref('add')
const editData = ref({
  id: '',
  name: '',
  num: '',
  price: '',
  category: '蔬菜'
})

const filteredList = computed(() => {
  if (currentCategory.value === '全部') {
    return list.value;
  }
  return list.value.filter(item => (item.category || '其他') === currentCategory.value);
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

onShow(() => {
  load()
})

const load = () => {
  let data = uni.getStorageSync('shop') || [];
  list.value = data.map((item, index) => {
    if (!item.id) item.id = 'shop_' + Date.now() + '_' + index;
    item.done = !!item.done; 
    return item;
  });
}

const save = () => {
  uni.setStorageSync('shop', list.value);
}

const toggle = (item) => {
  item.done = !item.done;
  save();
}

const clearDone = () => {
  if (doneCount.value === 0) {
    return uni.showToast({ title: '暂无已购买的物品', icon: 'none' });
  }
  uni.showModal({
    title: '清理提示',
    content: '确定要一键清空所有已购买的项吗？',
    confirmColor: '#FF7DA8',
    success: (res) => {
      if (res.confirm) {
        list.value = list.value.filter(item => !item.done);
        save();
        uni.showToast({ title: '已清空', icon: 'success' });
      }
    }
  });
}

const deleteItem = (item) => {
  uni.showModal({
    title: '删除提示',
    content: `确定要移除「${item.name}」吗？`,
    confirmColor: '#FF7DA8',
    success: (res) => {
      if (res.confirm) {
        list.value = list.value.filter(v => v.id !== item.id);
        save();
        uni.showToast({ title: '删除成功', icon: 'success' });
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

const saveModal = () => {
  if (!editData.value.name) {
    return uni.showToast({ title: '必须要填写物品名称哦', icon: 'none' });
  }
  if (modalMode.value === 'add') {
    const newItem = {
      id: editData.value.id || ('shop_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
      name: editData.value.name,
      num: editData.value.num,
      price: editData.value.price,
      category: editData.value.category,
      done: false
    };
    list.value.unshift(newItem); 
    uni.showToast({ title: '添加成功', icon: 'success' });
  } else {
    const index = list.value.findIndex(item => item.id === editData.value.id);
    if (index !== -1) {
      list.value[index].name = editData.value.name;
      list.value[index].num = editData.value.num;
      list.value[index].price = editData.value.price;
      list.value[index].category = editData.value.category;
      uni.showToast({ title: '修改成功', icon: 'success' });
    }
  }
  save();
  showModal.value = false;
}

const checkCost = () => {
  uni.navigateTo({ url: '/pages/cost/cost' })
}
</script>

<style lang="less" scoped>
.page {
  background: #FFF1F5;
  min-height: ~"calc(100vh - 80rpx)";
  padding-bottom: 40rpx;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #FFF1F5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
}

.title {
  font-size: 42rpx;
  color: #333;
  font-weight: 800;
}

.top-actions {
  display: flex;
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
    color: #FF7DA8;
    border: 2rpx solid #FF93B6;
  }
  &.add {
    background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
    color: #fff;
    border: none;
    box-shadow: 0 6rpx 16rpx rgba(255, 125, 168, 0.25);
  }
  &::after {
    border: none;
  }
}

.stat-card {
  position: sticky;
  bottom: 40rpx;
  z-index: 100;
  background: var(--theme-grad, linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%));
  margin: 30rpx 40rpx;
  border-radius: 40rpx;
  padding: 30rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 12rpx 30rpx rgba(255, 125, 168, 0.4);
}

.stat-text {
  font-size: 28rpx;
  color: #fff;
  opacity: 0.9;
}

.stat-money {
  font-size: 32rpx;
  color: #fff;
  font-weight: 900;
}

.stat-money-num {
  font-size: 40rpx;
  margin-left: 10rpx;
  text-decoration: none;
}

.main-layout {
  display: flex;
  align-items: flex-start;
  padding: 0 20rpx;
  flex: 1;
}

.sidebar {
  position: sticky;
  top: 130rpx; /* 顶部 top-bar 高度约为 100-120rpx */
  width: 170rpx;
  background: #fff;
  border-radius: 36rpx;
  padding: 20rpx 0;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: fit-content;
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
      color: #FF7DA8;
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
      background: #FF7DA8;
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
  background: #FFF1F5;
  color: #FF7DA8;
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
    background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
    color: #fff;
    box-shadow: 0 6rpx 16rpx rgba(255, 125, 168, 0.25);
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
  background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(255, 125, 168, 0.25);
  &::after { border: none; }
}
</style>
<template>
  <view class="page">
    <view class="top-bar">
      <text class="title">🍅 家里食材</text>
      <button class="add-btn" @click="goAdd">+ 添加</button>
    </view>
    
    <view class="main-layout">
      <!-- 左侧分类导航 -->
      <view class="sidebar">
        <view 
          class="nav-item" 
          :class="{ active: currentCategory === '全部' }" 
          @click="switchCategory('全部')"
        >
          <text class="nav-text">全部</text>
        </view>
        <view 
          class="nav-item" 
          v-for="cat in categories" 
          :key="cat" 
          :class="{ active: currentCategory === cat }" 
          @click="switchCategory(cat)"
        >
          <text class="nav-text">{{ cat }}</text>
        </view>
      </view>

      <!-- 右侧食材列表 -->
      <view class="list-container">
        <view class="empty" v-if="filteredList.length === 0">
          <text>暂时没有食材哦～</text>
        </view>
        
        <view class="item-card" v-for="item in filteredList" :key="item.id">
          <view class="item-header">
            <view class="title-group">
              <text class="name">{{ item.name }}</text>
              <text class="cat-tag" v-if="currentCategory === '全部'">{{ item.category || '其他' }}</text>
            </view>
            <switch :checked="item.has" @change="toggle(item)" color="#FF93B6" style="transform: scale(0.8); margin-right: -10rpx;" />
          </view>
          
          <view class="item-body">
            <text class="num">数量：{{ item.num || '-' }}</text>
          </view>
          
          <view class="item-footer">
            <text class="action-btn edit" @click="editItem(item)">✏️ 编辑</text>
            <text class="action-btn delete" @click="deleteItem(item)">🗑️ 删除</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 编辑食材的弹窗 -->
    <view class="modal-mask" v-if="showModal">
      <view class="modal-content">
        <text class="modal-title">编辑食材</text>
        
        <input class="modal-input" v-model="editData.name" placeholder="请输入食材名称" />
        <input class="modal-input" v-model="editData.num" placeholder="数量 (选填)" />
        
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
          <button class="confirm-btn" @click="saveEdit">确定</button>
        </view>
      </view>
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
const editData = ref({
  id: '',
  name: '',
  num: '',
  category: ''
})

const filteredList = computed(() => {
  if (currentCategory.value === '全部') {
    return list.value;
  }
  return list.value.filter(item => (item.category || '其他') === currentCategory.value);
})

onShow(() => {
  load()
})

const load = () => {
  let data = uni.getStorageSync('stock') || [];
  list.value = data.map((item, index) => {
    if (!item.id) item.id = 'stock_' + Date.now() + '_' + index;
    return item;
  });
}

const save = () => {
  uni.setStorageSync('stock', list.value)
}

const switchCategory = (cat) => {
  currentCategory.value = cat;
}

const toggle = (item) => {
  item.has = !item.has;
  save();
}

const goAdd = () => {
  uni.navigateTo({ url: '/pages/addStock/addStock' });
}

const editItem = (item) => {
  editData.value = {
    id: item.id,
    name: item.name,
    num: item.num || '',
    category: item.category || '其他'
  };
  showModal.value = true;
}

const saveEdit = () => {
  if (!editData.value.name) {
    return uni.showToast({ icon: 'none', title: '请输入名称' });
  }
  const index = list.value.findIndex(item => item.id === editData.value.id);
  if (index !== -1) {
    list.value[index].name = editData.value.name;
    list.value[index].num = editData.value.num;
    list.value[index].category = editData.value.category;
    save();
  }
  showModal.value = false;
  uni.showToast({ icon: 'success', title: '修改成功' });
}

const deleteItem = (item) => {
  uni.showModal({
    title: '提示',
    content: `确定要删除「${item.name}」吗？`,
    confirmColor: '#FF7DA8',
    success: (res) => {
      if (res.confirm) {
        list.value = list.value.filter(v => v.id !== item.id);
        save();
        uni.showToast({ icon: 'success', title: '已删除' });
      }
    }
  });
}
</script>

<style lang="less" scoped>
.page {
  background: #FAFAFA;
  min-height: ~"calc(100vh - 60rpx)";
  padding-bottom: 40rpx;
  background-image: linear-gradient(180deg, #FFF5F7 0%, #FAFAFA 400rpx);
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #FFF5F7;
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

.add-btn {
  background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
  color: #fff;
  border-radius: 100rpx;
  padding: 0 40rpx;
  height: 64rpx;
  line-height: 64rpx;
  font-size: 28rpx;
  border: none;
  margin: 0;
  box-shadow: 0 8rpx 20rpx rgba(255, 125, 168, 0.25);
  transition: transform 0.2s;
  &:active { transform: scale(0.95); }
}

.main-layout {
  display: flex;
  align-items: flex-start;
  padding: 0 20rpx;
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
  max-height: calc(100vh - 160rpx);
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
  background: #FFF1F5;
  color: #FF7DA8;
  font-size: 20rpx;
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
  white-space: nowrap;
}

.item-body {
  margin-bottom: 24rpx;
}

.num {
  font-size: 26rpx;
  color: #888;
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
  &::after {
    border: none;
  }
}

.cancel-btn {
  background: #F5F5F5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(255, 125, 168, 0.25);
}
</style>
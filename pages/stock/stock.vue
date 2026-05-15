<template>
  <custom-header title="家里食材" icon="🍅" />
  <view class="page" :style="themeStyle">
    <view class="top-actions-bar">
      <button class="action-btn-top clear" @click="clearExpired">清除过期</button>
      <button class="action-btn-top add" @click="goAdd">+ 添加</button>
    </view>
    
    <view class="main-layout">
      <!-- 左侧分类导航 -->
      <view class="sidebar">
        <view class="sidebar-list">
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
        <view class="nav-item add-cat-btn-side" @click="showCatModal = true">
          <text class="nav-text" style="color: var(--primary)">+ 添加分类</text>
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
            <!-- <switch :checked="item.has" @change="toggle(item)" color="#FF93B6" style="transform: scale(0.8); margin-right: -10rpx;" /> -->
          </view>
          
          <view class="item-body">
            <view class="num-row">
              <text class="num">数量：{{ item.num || '-' }}</text>
              <view class="expire-tag" v-if="item.expire_date" :class="getExpireStatus(item.expire_date).type">
                <text>{{ getExpireStatus(item.expire_date).text }}</text>
              </view>
            </view>
            <text class="expire-date" v-if="item.expire_date">📅 过期：{{ item.expire_date }}</text>
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
        
        <input class="modal-input" v-model="editData.name" placeholder="请输入食材名称" />
        <input class="modal-input" v-model="editData.num" placeholder="数量 (选填)" />
        
        <picker mode="date" @change="onEditDateChange">
          <view class="modal-input picker-item">
            <text class="p-label">过期日期：</text>
            <text class="p-val">{{ editData.expire_date || '请选择 (选填)' }}</text>
          </view>
        </picker>
        
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
  const catName = categories.value[idx]
  uni.showModal({
    title: '提示',
    content: `确定要删除分类「${catName}」吗？`,
    confirmColor: '#FF7DA8',
    success: (res) => {
      if (res.confirm) {
        categories.value.splice(idx, 1)
        uni.setStorageSync('ingredient_categories', categories.value)
      }
    }
  })
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
import eatCo from '@/common/localDB.js'

const editData = ref({
  _id: '',
  id: '',
  name: '',
  num: '',
  category: '',
  expire_date: ''
})

const onEditDateChange = (e) => {
  editData.value.expire_date = e.detail.value
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
        for (const item of expired) {
          await eatCo.deleteStock(item._id)
        }
        list.value = list.value.filter(i => !(i.expire_date && i.expire_date < today))
        uni.showToast({ title: '已删除过期食材', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '删除失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

const filteredList = computed(() => {
  if (currentCategory.value === '全部') {
    return list.value;
  }
  return list.value.filter(item => (item.category || '其他') === currentCategory.value);
})

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
    const data = await eatCo.getStockList(familyId);
    list.value = data.map(item => ({ ...item, id: item._id }));
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
}

const switchCategory = (cat) => {
  currentCategory.value = cat;
}

const toggle = async (item) => {
  const newHas = !item.has;
  item.has = newHas; // 乐观更新
  try {
    await eatCo.updateStock(item._id, { has: newHas });
  } catch(e) {
    item.has = !newHas; // 失败回滚
    uni.showToast({ title: '状态更新失败', icon: 'none' });
  }
}

const goAdd = () => {
  uni.navigateTo({ url: '/pages/addStock/addStock' });
}

const editItem = (item) => {
  editData.value = {
    _id: item._id,
    id: item.id,
    name: item.name,
    num: item.num || '',
    category: item.category || '其他',
    expire_date: item.expire_date || ''
  };
  showModal.value = true;
}

const saveEdit = async () => {
  if (!editData.value.name) {
    return uni.showToast({ icon: 'none', title: '请输入名称' });
  }
  
  try {
    await eatCo.updateStock(editData.value._id, {
      name: editData.value.name,
      num: editData.value.num,
      category: editData.value.category,
      expire_date: editData.value.expire_date
    });
    uni.showToast({ icon: 'success', title: '修改成功' });
    
    const index = list.value.findIndex(item => item.id === editData.value.id);
    if (index !== -1) {
      list.value[index].name = editData.value.name;
      list.value[index].num = editData.value.num;
      list.value[index].category = editData.value.category;
      list.value[index].expire_date = editData.value.expire_date;
    }
    showModal.value = false;
  } catch(e) {
    uni.showToast({ title: '修改失败', icon: 'none' });
  }
}

const deleteItem = (item) => {
  uni.showModal({
    title: '提示',
    content: `确定要删除「${item.name}」吗？`,
    confirmColor: '#FF7DA8',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' });
        try {
          await eatCo.deleteStock(item._id);
          list.value = list.value.filter(v => v.id !== item.id);
          uni.showToast({ icon: 'success', title: '已删除' });
        } catch(e) {
          uni.showToast({ title: '删除失败', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
}
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

.add-cat-btn-side {
  flex-shrink: 0;
  border-top: 1rpx solid #F0F2F5;
}

.list-bottom-safe {
  height: 120rpx;
  flex-shrink: 0;
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
</style>
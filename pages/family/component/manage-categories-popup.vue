<!-- 分类管理弹窗 -->
<template>
  <view class="modal-mask" v-if="show" @click="close">
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
        <view class="add-cat-btn" @click="addCategory">添加</view>
      </view>
      <button class="close-modal-btn" @click="close">完成</button>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const categories = ref([])
const newCat = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    newCat.value = ''
    categories.value = uni.getStorageSync('ingredient_categories') || []
  }
})

const close = () => {
  emit('close')
}

const addCategory = () => {
  if (!newCat.value.trim()) return
  if (categories.value.includes(newCat.value.trim())) {
    return uni.showToast({ title: '分类已存在', icon: 'none' })
  }
  categories.value.push(newCat.value.trim())
  newCat.value = ''
  uni.setStorageSync('ingredient_categories', categories.value)
}

const removeCategory = (idx) => {
  categories.value.splice(idx, 1)
  uni.setStorageSync('ingredient_categories', categories.value)
}
</script>

<style lang="less" scoped>
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(10rpx);
}
.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
  .modal-title {
    font-size: 34rpx;
    font-weight: 800;
    color: #2C3E50;
    text-align: center;
    margin-bottom: 20rpx;
  }
}

.cat-manage-list {
  display: flex;
  flex-direction: column;
  
  .cat-manage-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 2rpx solid #F5F6F7;
    font-size: 28rpx;
    color: #2C3E50;
    
    .del-cat {
      font-size: 24rpx;
      color: #FF4D6D;
      font-weight: bold;
    }
  }
}

.add-cat-box {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
  margin-bottom: 30rpx;
  
  .add-cat-input {
    flex: 1;
    height: 80rpx;
    background: #F8F9FA;
    border-radius: 20rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
    color: #2C3E50;
  }
  
  .add-cat-btn {
    width: 140rpx;
    height: 80rpx;
    background: var(--primary);
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20rpx;
    box-shadow: 0 8rpx 16rpx var(--primary-shadow);
  }
}

.close-modal-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: #F5F6F7;
  color: #7F8C8D;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 100rpx;
  margin-top: 10rpx;
  border: none;
  &::after { border: none; }
}
</style>

<template>
  <view class="page">
    <view class="card">
      <text class="title">🏠 我的家庭</text>
      <view class="input-item">
        <text>家庭名称</text>
        <input v-model="familyName" placeholder="取个可爱名字" />
      </view>
      <button class="save-btn" @click="save">保存</button>
    </view>

    <view class="card member-card">
      <text class="title">👨‍👩‍👧‍👦 家庭成员</text>
      <view class="member" v-for="(item, i) in members" :key="i">
        <text>🥰 {{ item }}</text>
      </view>
    <view class="card category-card">
      <text class="title">🏷️ 食材分类设置</text>
      <view class="tags">
        <view class="tag" v-for="(cat, index) in categories" :key="index">
          <text>{{ cat }}</text>
          <text class="del" v-if="cat !== '其他'" @click="delCategory(index)">×</text>
        </view>
        <view class="tag add-tag" @click="showAddCategory = true" v-if="!showAddCategory">+ 添加</view>
      </view>
      
      <view class="add-box" v-if="showAddCategory">
        <input v-model="newCategory" placeholder="输入新分类名称" maxlength="6" />
        <button class="small-btn" @click="addCategory">确定</button>
        <button class="small-btn cancel" @click="showAddCategory = false; newCategory = ''">取消</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const familyName = ref('快乐干饭小家')
const members = ref(['爸爸', '妈妈', '宝宝'])

const categories = ref([])
const showAddCategory = ref(false)
const newCategory = ref('')

onShow(() => {
  categories.value = uni.getStorageSync('ingredient_categories') || ['蔬菜', '水果', '肉蛋', '水产', '调料', '其他']
})

const save = () => {
  uni.showToast({ title: '保存成功', icon: 'success' })
}

const saveCategories = () => {
  uni.setStorageSync('ingredient_categories', categories.value)
}

const delCategory = (index) => {
  uni.showModal({
    title: '提示',
    content: `确定删除分类「${categories.value[index]}」吗？`,
    confirmColor: '#FF7DA8',
    success: (res) => {
      if (res.confirm) {
        categories.value.splice(index, 1)
        saveCategories()
      }
    }
  })
}

const addCategory = () => {
  const name = newCategory.value.trim()
  if (!name) return uni.showToast({ title: '请输入名称', icon: 'none' })
  if (categories.value.includes(name)) return uni.showToast({ title: '分类已存在', icon: 'none' })
  
  categories.value.push(name)
  saveCategories()
  showAddCategory.value = false
  newCategory.value = ''
}
</script>

<style lang="less" scoped>
.page {
  background: #FAFAFA;
  padding: 40rpx;
  min-height: ~"calc(100vh - 80rpx)";
  background-image: linear-gradient(180deg, #FFF5F7 0%, #FAFAFA 400rpx);
}
.card {
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 16rpx 40rpx rgba(255, 141, 161, 0.08);
}
.title {
  font-size: 36rpx;
  color: #333;
  font-weight: 800;
  margin-bottom: 40rpx;
  display: block;
}
.input-item {
  margin-bottom: 40rpx;
  text {
    font-size: 28rpx;
    color: #888;
    margin-bottom: 20rpx;
    display: block;
  }
}
input {
  background: #F8F9FA;
  border-radius: 24rpx;
  height: 90rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  &:focus {
    border: 2rpx solid #FF8DA1;
    background: #FFF;
  }
}
.save-btn {
  background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
  color: #fff;
  border-radius: 100rpx;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(255, 125, 168, 0.25);
  transition: transform 0.2s;
  &:active { transform: scale(0.96); }
  &::after { border: none; }
}
.member {
  font-size: 30rpx;
  color: #333;
  padding: 16rpx 0;
  font-weight: 500;
}
.category-card {
  margin-bottom: 40rpx;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.tag {
  background: #F8F9FA;
  color: #555;
  padding: 12rpx 24rpx;
  border-radius: 100rpx;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  .del {
    color: #FF8F8F;
    font-size: 32rpx;
    line-height: 26rpx;
    font-weight: bold;
    padding-left: 8rpx;
    border-left: 2rpx solid #EAEAEA;
  }
}
.add-tag {
  color: #FF7DA8;
  background: #FFF1F5;
  font-weight: bold;
}
.add-box {
  margin-top: 30rpx;
  display: flex;
  gap: 20rpx;
  align-items: center;
  input {
    flex: 1;
    margin-bottom: 0;
    height: 70rpx;
  }
}
.small-btn {
  background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
  color: #fff;
  border-radius: 100rpx;
  height: 70rpx;
  line-height: 70rpx;
  font-size: 26rpx;
  padding: 0 30rpx;
  margin: 0;
  &::after { border: none; }
  &.cancel {
    background: #F5F5F5;
    color: #666;
  }
}
</style>
<template>
  <view class="page" :style="themeStyle">
    <custom-header title="添加购物" icon="🛒" :back="true" />
    <view class="card">
      <text class="title">🛒 添加购物清单</text>
      
      <view class="category-wrap">
        <text class="label">选择分类</text>
        <view class="tags">
          <text 
            class="tag" 
            :class="{ active: category === cat }" 
            v-for="cat in categories" 
            :key="cat" 
            @click="category = cat"
          >{{ cat }}</text>
        </view>
      </view>

      <input v-model="name" placeholder="请输入要购买的任务或物品" class="input" />
      <input v-model="num" placeholder="数量：例如 3个 (选填)" class="input" />
      <input v-model="price" placeholder="花费/单价 ¥ (选填)" class="input" />
      <button class="save-btn" @click="save">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const name = ref('')
const num = ref('')
const price = ref('')
const category = ref('蔬菜')
const categories = ref([])

onShow(() => {
  categories.value = uni.getStorageSync('ingredient_categories') || ['蔬菜', '水果', '肉蛋', '水产', '调料', '其他']
  if (!categories.value.includes(category.value)) {
    category.value = categories.value[0] || '其他'
  }
  currentTheme.value = uni.getStorageSync('current_theme') || 0
})

const themes = [
  { color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
  { color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
  { color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
  { color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
]
const currentTheme = ref(uni.getStorageSync('current_theme') || 0)
const themeStyle = computed(() => {
  const t = themes[currentTheme.value]
  return `--primary:${t.color};--primary-grad:${t.gradient};--primary-light:${t.light};--primary-shadow:${t.shadow};`
})

import eatCo from '@/common/localDB.js'

const save = async () => {
  if (!name.value) return uni.showToast({ icon: 'none', title: '请输入名称' })
  
  try {
    await eatCo.addShop({
      name: name.value,
      num: num.value,
      category: category.value,
      price: price.value,
      done: false,
      family_id: uni.getStorageSync('family_id') || 'default_family'
    })
    uni.showToast({ icon: 'success', title: '添加成功' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (e) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}
</script>

<style lang="less" scoped>
.page {
  background: #FAFAFA;
  padding: 40rpx;
  min-height: ~"calc(100vh - 80rpx)";
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 400rpx);
}
.card {
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 16rpx 40rpx rgba(255, 141, 161, 0.08);
}
.title {
  font-size: 40rpx;
  color: #333;
  font-weight: 800;
  margin-bottom: 50rpx;
  display: block;
  text-align: center;
}
.category-wrap {
  margin-bottom: 40rpx;
}
.label {
  font-size: 28rpx;
  color: #888;
  margin-bottom: 24rpx;
  display: block;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
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
    box-shadow: 0 4rpx 12rpx var(--primary-shadow);
  }
}
.input {
  background: #F8F9FA;
  border-radius: 24rpx;
  height: 90rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  margin-bottom: 30rpx;
  &:focus {
    border: 2rpx solid var(--primary);
    background: #FFF;
  }
}
.save-btn {
  background: var(--primary-grad);
  color: #fff;
  border-radius: 100rpx;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx var(--primary-shadow);
  transition: transform 0.2s;
  &:active { transform: scale(0.96); }
  &::after { border: none; }
}
</style>
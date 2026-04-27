<template>
  <view class="page">
    <view class="form-card">
      <view class="cover-uploader">
        <input class="input-line cover-input" v-model="form.cover" placeholder="请输入封面图片网络链接 (选填)" />
        <image class="cover-preview" v-if="form.cover" :src="form.cover" mode="aspectFill" style="background-color: #FFF5F7;" />
      </view>

      <view class="input-group">
        <text class="label">菜名</text>
        <input class="input-line" v-model="form.name" placeholder="起个响亮的名字" />
      </view>

      <view class="horizontal-group">
        <view class="input-group flex-1">
          <text class="label">分类</text>
          <picker :value="categoryIndex" :range="categories" @change="onCategoryChange">
            <view class="input-line picker-view">{{ form.category || '请选择' }}</view>
          </picker>
        </view>
        <view class="input-group flex-1">
          <text class="label">所需时间</text>
          <input class="input-line" v-model="form.duration" placeholder="如 30分钟" />
        </view>
        <view class="input-group flex-1">
          <text class="label">难度</text>
          <picker :value="difficultyIndex" :range="difficulties" @change="onDifficultyChange">
            <view class="input-line picker-view">{{ form.difficulty || '请选择' }}</view>
          </picker>
        </view>
      </view>
    </view>

    <view class="form-card">
      <view class="section-header">
        <text class="label">所需主食材</text>
        <text class="add-text" @click="addMainIng" style="color: #FF7DA8;">+ 添加食材</text>
      </view>
      <view class="array-list">
        <view class="array-item" v-for="(ing, i) in mainIngs" :key="i">
          <view class="remove-btn" @click="removeMainIng(i)">-</view>
          <input class="input-line flex-2" v-model="ing.name" placeholder="名称 (如 番茄)" />
          <input class="input-line flex-1" v-model="ing.amount" placeholder="用量 (如 2个)" />
        </view>
        <view class="empty-state" v-if="mainIngs.length === 0">请添加主食材</view>
      </view>
    </view>

    <view class="form-card">
      <view class="section-header">
        <text class="label">所需调料</text>
        <text class="add-text" @click="addSeasoning" style="color: #F39C12;">+ 添加调料</text>
      </view>
      <view class="array-list">
        <view class="array-item" v-for="(ing, i) in seasoningIngs" :key="i">
          <view class="remove-btn seasoning-remove" @click="removeSeasoning(i)">-</view>
          <input class="input-line flex-2" v-model="ing.name" placeholder="名称 (如 生抽)" />
          <input class="input-line flex-1" v-model="ing.amount" placeholder="用量 (如 2勺)" />
        </view>
        <view class="empty-state" v-if="seasoningIngs.length === 0">选填：您还可以添加调配料</view>
      </view>
    </view>

    <view class="form-card">
      <view class="section-header">
        <text class="label">烹饪步骤</text>
        <text class="add-text" @click="addStep" style="color: #FF7DA8;">+ 添加一步</text>
      </view>
      <view class="array-list">
        <view class="array-item step-item" v-for="(step, i) in form.steps" :key="i">
          <view class="step-index" style="background-color: #FF7DA8; color: #fff;">{{ i + 1 }}</view>
          <textarea class="textarea-line" v-model="form.steps[i]" placeholder="描述一下这一步的内容..." auto-height />
          <view class="remove-btn auto-remove" @click="removeStep(i)">-</view>
        </view>
        <view class="empty-state" v-if="form.steps.length === 0">请添加步骤</view>
      </view>
    </view>

    <button class="save-btn" @click="save">保存菜谱</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const isEdit = ref(false)
const recipeId = ref('')

const categories = ['家常菜', '快手菜', '素食', '肉类', '汤品']
const categoryIndex = ref(0)
const difficulties = ['简单', '中等', '困难']
const difficultyIndex = ref(0)

const seasoningKeywords = ['盐', '糖', '生抽', '老抽', '料酒', '醋', '姜', '葱', '大蒜', '蒜', '油', '花椒', '八角', '胡椒', '酱', '精', '孜然']

const form = ref({
  id: '',
  name: '',
  category: '家常菜',
  cover: '',
  duration: '30分钟',
  difficulty: '简单',
  ingredients: [],
  steps: [''],
  favorite: false,
  own: true
})

const mainIngs = ref([{ name: '', amount: '' }])
const seasoningIngs = ref([])

onLoad((options) => {
  if (options.recipeId) {
    isEdit.value = true
    recipeId.value = options.recipeId
    loadData()
  }
})

const eatCo = uniCloud.importObject('eat-co')

const loadData = async () => {
  uni.showLoading({ title: '加载中...' })
  try {
    const list = await eatCo.getRecipeList()
    const target = list.find(r => r._id === recipeId.value)
    if (target) {
      form.value = { ...target, id: target._id }
      categoryIndex.value = Math.max(0, categories.indexOf(form.value.category))
      difficultyIndex.value = Math.max(0, difficulties.indexOf(form.value.difficulty))
      
      if (form.value.ingredients && form.value.ingredients.length > 0) {
        mainIngs.value = []
        seasoningIngs.value = []
        form.value.ingredients.forEach(ing => {
          const isS = ing.isSeasoning !== undefined ? ing.isSeasoning : seasoningKeywords.some(k => ing.name.includes(k))
          if (isS) seasoningIngs.value.push({ name: ing.name, amount: ing.amount })
          else mainIngs.value.push({ name: ing.name, amount: ing.amount })
        })
      }
    }
    uni.hideLoading().catch(() => {})
  } catch (e) {
    uni.hideLoading().catch(() => {})
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const onCategoryChange = (e) => {
  categoryIndex.value = e.detail.value
  form.value.category = categories[categoryIndex.value]
}

const onDifficultyChange = (e) => {
  difficultyIndex.value = e.detail.value
  form.value.difficulty = difficulties[difficultyIndex.value]
}

const addMainIng = () => mainIngs.value.push({ name: '', amount: '' })
const removeMainIng = (i) => mainIngs.value.splice(i, 1)

const addSeasoning = () => seasoningIngs.value.push({ name: '', amount: '' })
const removeSeasoning = (i) => seasoningIngs.value.splice(i, 1)

const addStep = () => form.value.steps.push('')
const removeStep = (i) => form.value.steps.splice(i, 1)

const save = async () => {
  if (!form.value.name.trim()) return uni.showToast({ title: '菜名不能为空', icon: 'none' })
  
  const filteredMain = mainIngs.value.filter(ing => ing.name.trim()).map(ing => ({ ...ing, isSeasoning: false }))
  const filteredSeasoning = seasoningIngs.value.filter(ing => ing.name.trim()).map(ing => ({ ...ing, isSeasoning: true }))
  
  form.value.ingredients = [...filteredMain, ...filteredSeasoning]
  form.value.steps = form.value.steps.filter(step => step.trim())
  
  if (form.value.ingredients.length === 0) return uni.showToast({ title: '请至少保留一个食材或调料', icon: 'none' })
  if (form.value.steps.length === 0) return uni.showToast({ title: '请至少保留一个步骤', icon: 'none' })

  uni.showLoading({ title: '保存中...' })
  try {
    const submitData = {
      name: form.value.name,
      category: form.value.category,
      cover: form.value.cover,
      duration: form.value.duration,
      difficulty: form.value.difficulty,
      ingredients: form.value.ingredients,
      steps: form.value.steps,
      favorite: form.value.favorite,
      own: true
    }

    if (isEdit.value) {
      await eatCo.updateRecipe(recipeId.value, submitData)
    } else {
      await eatCo.addRecipe(submitData)
    }
    
    uni.hideLoading().catch(() => {})
    uni.showToast({ title: isEdit.value ? '修改成功' : '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (e) {
    uni.hideLoading().catch(() => {})
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}
</script>

<style lang="less" scoped>
.page {
  background: #FFF5F7;
  min-height: 100vh;
  padding: 30rpx 24rpx 80rpx;
}
.form-card {
  background: #ffffff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 12rpx 30rpx rgba(0,0,0,0.03);
  margin-bottom: 30rpx;
}
.cover-uploader {
  margin-bottom: 50rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.cover-input {
  text-align: center;
  font-weight: bold;
}
.cover-preview {
  width: 100%;
  height: 360rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.05);
}
.input-group {
  margin-bottom: 40rpx;
  &:last-child {
    margin-bottom: 0;
  }
}
.label {
  font-size: 30rpx;
  color: #2c3e50;
  font-weight: 900;
  display: block;
  margin-bottom: 20rpx;
  letter-spacing: 1rpx;
}
.input-line {
  background: #f8f9fa;
  height: 96rpx;
  line-height: 96rpx;
  padding: 0 30rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  color: #2c3e50;
  border: 4rpx solid transparent;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-weight: 500;
  &:focus {
    border: 4rpx solid #FF7DA8;
    background: #ffffff;
    box-shadow: 0 8rpx 20rpx rgba(255, 125, 168, 0.25);
  }
}
.picker-view {
  color: #2c3e50;
}
.horizontal-group {
  display: flex;
  gap: 24rpx;
}
.flex-1 { flex: 1; min-width: 0; }
.flex-2 { flex: 2; min-width: 0; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  .label { margin-bottom: 0; }
}
.add-text {
  font-size: 28rpx;
  font-weight: 800;
  padding: 10rpx 20rpx;
  background: rgba(0,0,0,0.02);
  border-radius: 100rpx;
  transition: transform 0.2s;
  &:active {
    transform: scale(0.95);
  }
}
.array-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}
.remove-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #fff0f3;
  color: #ff4757;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: bold;
  flex-shrink: 0;
  transition: transform 0.2s;
  &:active { transform: scale(0.9); }
}
.seasoning-remove {
  background: #FFF9F0;
  color: #F39C12;
}
.empty-state {
  font-size: 26rpx;
  color: #95a5a6;
  text-align: center;
  padding: 30rpx 0;
}
.step-item {
  align-items: flex-start;
  background: #f8f9fa;
  padding: 24rpx;
  border-radius: 24rpx;
  border: 2rpx solid #ecf0f1;
}
.step-index {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 900;
  flex-shrink: 0;
  margin-top: 6rpx;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
}
.textarea-line {
  flex: 1;
  min-height: 90rpx;
  font-size: 30rpx;
  color: #2c3e50;
  line-height: 1.6;
  padding: 10rpx 0;
  background: transparent;
}
.auto-remove {
  margin-top: 6rpx;
}
.save-btn {
  background: linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%);
  color: #fff;
  border-radius: 100rpx;
  height: 108rpx;
  line-height: 108rpx;
  font-size: 36rpx;
  font-weight: 900;
  box-shadow: 0 16rpx 40rpx rgba(255, 125, 168, 0.25);
  border: none;
  margin-top: 50rpx;
  transition: opacity 0.2s, transform 0.2s;
  &::after { border: none; }
  &:active { 
    opacity: 0.9;
    transform: translateY(4rpx);
  }
}
</style>
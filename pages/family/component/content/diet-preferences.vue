<!-- 饮食偏好设置与口味忌口添加自治组件 -->
<template>
  <view class="prefs-container">
    <view class="pref-group">
      <text class="p-label">全家口味 (长按管理)</text>
      <view class="p-options">
        <view class="p-tag" :class="{ active: true, editing: isEditingTaste }" v-for="t in tasteOptions" :key="t.id" 
          @click.stop="selectTaste(t)"
          @longpress.stop="isEditingTaste = !isEditingTaste"
        >
          <text>{{ t.title }}</text>
          <view class="p-del" v-if="isEditingTaste" @click.stop="removeTaste(t)">×</view>
        </view>
        <view class="p-tag add-btn" @click.stop="openAddTasteModal">
          <text class="plus">+</text>
        </view>
      </view>
    </view>
    
    <view class="pref-group">
      <text class="p-label">忌口不吃 (长按管理)</text>
      <view class="p-options">
        <view class="p-tag" :class="{ active: true, editing: isEditingPrefs }" v-for="a in avoidOptions" :key="a.id" @click.stop="toggleAvoid(a)"
          @longpress.stop="isEditingPrefs = !isEditingPrefs"
        >
          <text>{{ a.title }}</text>
          <view class="p-del" v-if="isEditingPrefs" @click.stop="removeAvoid(a)">×</view>
        </view>
        <!-- 添加按钮 -->
        <view class="p-tag add-btn" @click.stop="openAddAvoidModal">
          <text class="plus">+</text>
        </view>
      </view>
    </view>

    <!-- 1. 添加口味偏好自治弹窗 -->
    <view class="modal-mask" v-if="showAddTasteModal" @click="showAddTasteModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加口味偏好</text>
        <view class="input-box">
          <input class="join-input" v-model="newTaste" placeholder="输入口味名称，如：麻辣" focus />
        </view>
        <view class="modal-btns">
          <button class="m-btn-sub" @click="showAddTasteModal = false">取消</button>
          <button class="m-btn-main" @click="confirmAddTaste">添加</button>
        </view>
      </view>
    </view>

    <!-- 2. 添加忌口不吃自治弹窗 -->
    <view class="modal-mask" v-if="showAddAvoidModal" @click="showAddAvoidModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加忌口食物</text>
        <view class="input-box">
          <input class="join-input" v-model="newAvoid" placeholder="输入忌口食物，如：香菜" focus />
        </view>
        <view class="modal-btns">
          <button class="m-btn-sub" @click="showAddAvoidModal = false">取消</button>
          <button class="m-btn-main" @click="confirmAddAvoid">添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import familyApi from '@/common/api/family.js'

const props = defineProps({
  familyCode: {
    type: String,
    default: ''
  }
})

const tasteOptions = ref([])
const avoidOptions = ref([])
const isEditingTaste = ref(false)
const isEditingPrefs = ref(false)

// --- 添加口味自治弹窗状态与逻辑 ---
const showAddTasteModal = ref(false)
const newTaste = ref('')

const openAddTasteModal = () => {
  newTaste.value = ''
  showAddTasteModal.value = true
}

const confirmAddTaste = async () => {
  const val = newTaste.value.trim()
  if (!val) return
  if (tasteOptions.value.some(x => x.title === val)) {
    return uni.showToast({ title: '已在列表中', icon: 'none' })
  }
  
  uni.showLoading({ title: '正在添加...', mask: true })
  try {
    await familyApi.saveFamilyDietPreference(props.familyCode, JSON.stringify({
      title: val,
      type: 'family_taste'
    }))
    uni.showToast({ title: '添加成功', icon: 'success' })
    showAddTasteModal.value = false
    await loadDietPreferences()
  } catch (e) {
    console.error('添加口味失败', e)
    uni.showToast({ title: '添加失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// --- 添加忌口自治弹窗状态与逻辑 ---
const showAddAvoidModal = ref(false)
const newAvoid = ref('')

const openAddAvoidModal = () => {
  newAvoid.value = ''
  showAddAvoidModal.value = true
}

const confirmAddAvoid = async () => {
  const val = newAvoid.value.trim()
  if (!val) return
  if (avoidOptions.value.some(x => x.title === val)) {
    return uni.showToast({ title: '已在列表中', icon: 'none' })
  }
  
  uni.showLoading({ title: '正在添加...', mask: true })
  try {
    await familyApi.saveFamilyDietPreference(props.familyCode, JSON.stringify({
      title: val,
      type: 'avoid_food'
    }))
    uni.showToast({ title: '添加成功', icon: 'success' })
    showAddAvoidModal.value = false
    await loadDietPreferences()
  } catch (e) {
    console.error('添加忌口失败', e)
    uni.showToast({ title: '添加失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// --- 偏好项删除与状态交互 ---
const selectTaste = (t) => {
  if (isEditingTaste.value) return
  uni.showToast({ title: '💡 长按可删除该口味', icon: 'none' })
}

const toggleAvoid = (a) => {
  if (isEditingPrefs.value) return
  uni.showToast({ title: '💡 长按可删除该忌口', icon: 'none' })
}

const removeTaste = async (t) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除“${t.title}”口味偏好吗？`,
    confirmColor: '#FF4D6D',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在删除...', mask: true })
        try {
          await familyApi.deleteFamilyDietPreference(props.familyCode, t.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          
          const resTaste = await familyApi.getFamilyDietPreferences(props.familyCode, 'family_taste')
          tasteOptions.value = resTaste.data?.preferences || []
          
          if (tasteOptions.value.length === 0) isEditingTaste.value = false
        } catch (e) {
          console.error('删除口味失败', e)
          uni.showToast({ title: '删除失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

const removeAvoid = async (a) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除忌口“${a.title}”吗？`,
    confirmColor: '#FF4D6D',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在删除...', mask: true })
        try {
          await familyApi.deleteFamilyDietPreference(props.familyCode, a.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          
          const resAvoid = await familyApi.getFamilyDietPreferences(props.familyCode, 'avoid_food')
          avoidOptions.value = resAvoid.data?.preferences || []
          
          if (avoidOptions.value.length === 0) isEditingPrefs.value = false
        } catch (e) {
          console.error('删除忌口失败', e)
          uni.showToast({ title: '删除失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// --- 数据拉取与预置 ---
const loadDietPreferences = async () => {
  if (!props.familyCode) return
  try {
    const resTaste = await familyApi.getFamilyDietPreferences(props.familyCode, 'family_taste')
    tasteOptions.value = resTaste.data?.preferences || []
    
    const resAvoid = await familyApi.getFamilyDietPreferences(props.familyCode, 'avoid_food')
    avoidOptions.value = resAvoid.data?.preferences || []
    
    // 如果该家庭尚未配置过任何口味和忌口，启动温情静默预置常见口味与忌口
    if (tasteOptions.value.length === 0 && avoidOptions.value.length === 0) {
      await initDefaultDietPreferences()
    }
  } catch (e) {
    console.error('加载饮食偏好失败', e)
  }
}

const initDefaultDietPreferences = async () => {
  try {
    const defaultTastes = ['清淡', '适中', '重口']
    for (const title of defaultTastes) {
      await familyApi.saveFamilyDietPreference(props.familyCode, JSON.stringify({
        title,
        type: 'family_taste'
      }))
    }
    
    const defaultAvoids = ['海鲜', '香菜']
    for (const title of defaultAvoids) {
      await familyApi.saveFamilyDietPreference(props.familyCode, JSON.stringify({
        title,
        type: 'avoid_food'
      }))
    }
    
    // 初始化后重新拉取
    const resTaste = await familyApi.getFamilyDietPreferences(props.familyCode, 'family_taste')
    tasteOptions.value = resTaste.data?.preferences || []
    const resAvoid = await familyApi.getFamilyDietPreferences(props.familyCode, 'avoid_food')
    avoidOptions.value = resAvoid.data?.preferences || []
  } catch (e) {
    console.error('初始化默认偏好出错', e)
  }
}

watch(() => props.familyCode, (newVal) => {
  if (newVal) {
    loadDietPreferences()
  }
}, { immediate: true })

const cancelEdit = () => {
  isEditingTaste.value = false
  isEditingPrefs.value = false
}

defineExpose({
  loadDietPreferences,
  cancelEdit
})
</script>

<style lang="less" scoped>
.prefs-container {
  margin-top: 20rpx;
}

.pref-group {
  margin-bottom: 30rpx;
  &:last-child { margin-bottom: 0; }
  
  .p-label {
    font-size: 26rpx;
    color: #7F8C8D;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .p-options {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }
  
  .p-tag {
    padding: 12rpx 32rpx;
    border-radius: 100rpx;
    background: #F8F9FA;
    color: #7F8C8D;
    font-size: 24rpx;
    font-weight: 500;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    position: relative;
    
    &.active {
      background: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary);
    }

    &.editing {
      animation: shake 0.5s infinite;
    }

    &.add-btn {
      border: 2rpx dashed #BDC3C7;
      background: transparent;
      color: #BDC3C7;
      padding: 12rpx 32rpx;
      .plus { font-size: 24rpx; font-weight: bold; }
    }

    .p-del {
      position: absolute;
      top: -12rpx;
      right: -12rpx;
      width: 32rpx;
      height: 32rpx;
      background: #FF4757;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20rpx;
      font-weight: 900;
      z-index: 10;
      box-shadow: 0 4rpx 8rpx rgba(255, 71, 87, 0.3);
    }
  }
}

@keyframes shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
}

// --- 公共弹窗Less样式 ---
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
  align-items: center;
  
  .modal-title {
    font-size: 34rpx;
    font-weight: 800;
    color: #2C3E50;
    text-align: center;
    margin-bottom: 30rpx;
  }
}

.input-box {
  background: #F8F9FA;
  border-radius: 30rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 24rpx;
  width: 100%;
  box-sizing: border-box;
  
  .join-input {
    width: 100%;
    height: 60rpx;
    font-size: 28rpx;
    color: #2C3E50;
    text-align: center;
  }
}

.modal-btns {
  display: flex;
  gap: 30rpx;
  margin-top: 20rpx;
  width: 100%;
  
  button {
    flex: 1;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 100rpx;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    &::after { border: none; }
  }
  
  .m-btn-sub {
    background: #F8F9FA;
    color: #7F8C8D;
  }
  
  .m-btn-main {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 8rpx 20rpx var(--primary-shadow);
  }
}
</style>

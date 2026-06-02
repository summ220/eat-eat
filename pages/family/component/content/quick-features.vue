<!-- 快捷功能宫格与抽菜管理自治组件 -->
<template>
  <view class="quick-features-container">
    <view class="quick-grid">
      <view class="quick-item" v-for="(q, i) in quickFuncs" :key="i" @click="handleSetting(q.name)">
        <view class="q-icon-wrap"><text class="q-icon">{{ q.icon }}</text></view>
        <text class="q-text">{{ q.name }}</text>
      </view>
    </view>

    <!-- 随机抽菜池管理弹窗直接融合入快捷功能，不新增子组件 -->
    <view class="modal-mask" v-if="showRandomMenuModal" @click="showRandomMenuModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">随机抽菜池管理</text>

        <!-- 场景 Tab -->
        <view class="scene-tabs">
          <view
            class="scene-tab"
            v-for="tab in sceneTabs"
            :key="tab.type"
            :class="{ active: activeType === tab.type }"
            @click="activeType = tab.type"
          >
            <text class="tab-icon">{{ tab.icon }}</text>
            <text class="tab-label">{{ tab.label }}</text>
          </view>
        </view>

        <scroll-view scroll-y style="max-height: 460rpx; margin-top: 16rpx; margin-bottom: 16rpx;" :show-scrollbar="false">
          <view class="cat-manage-list">
            <view class="cat-manage-item" v-for="(dish, idx) in filteredMenu" :key="dish.id || idx">
              <text>{{ dish.name || dish }}</text>
              <text class="del-cat" @click="removeRandomDish(dish)">删除</text>
            </view>
            <view class="cat-manage-item empty-tip" v-if="filteredMenu.length === 0" style="justify-content: center; color: #999; font-size: 24rpx; border-bottom: none;">
              <text>这个场景还没有菜，快去添加吧~</text>
            </view>
          </view>
        </scroll-view>
        <view class="add-cat-box">
          <input class="add-cat-input" v-model="newRandomDish" :placeholder="'新增' + sceneTabs.find(t => t.type === activeType).label + '菜名'" />
          <view class="add-cat-btn" @click="addRandomDish">添加</view>
        </view>
        <button class="close-modal-btn" @click="showRandomMenuModal = false">完成</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import familyApi from '@/common/api/family.js'

const props = defineProps({
  familyCode: {
    type: String,
    default: ''
  }
})

const quickFuncs = ref([
  { icon: '🎲', name: '抽菜配置' },
  { icon: '🦺', name: '随手记' },
  { icon: '🗑️', name: '每日计划' },
  { icon: '💵', name: '清空花费' },
  { icon: '🧹', name: '清理数据' },
  { icon: '📤', name: '个性主题' },
  { icon: '📥', name: '饮食偏好' },
  { icon: '📊', name: '开销统计' }
])

// --- 抽菜池管理 ---
const showRandomMenuModal = ref(false)
const randomMenu = ref([])
const newRandomDish = ref('')

// 场景 tab 配置
const sceneTabs = [
  { label: '自己做', type: '做饭', icon: '🍳' },
  { label: '外卖',   type: '外卖', icon: '🛫' },
  { label: '出去吃', type: '堂食', icon: '🏪' }
]
const activeType = ref('做饭') // 默认自己做

// 按当前 tab 过滤（兼容旧数据: type 为空或 manual 归入「做饭」）
const filteredMenu = computed(() =>
  randomMenu.value.filter(dish => {
    const t = dish.type
    if (activeType.value === '做饭') return !t || t === '做饭' || t === 'manual'
    return t === activeType.value
  })
)

const loadRandomMenu = async () => {
  if (!props.familyCode) return
  try {
    const res = await familyApi.getFamilyRecipePoolItems(props.familyCode)
    randomMenu.value = res.data.dishes || []
  } catch (e) {
    console.error('加载抽菜池失败', e)
  }
}

const addRandomDish = async () => {
  const val = newRandomDish.value.trim()
  if (!val) return
  const dishJson = { name: val, type: activeType.value }
  try {
    await familyApi.saveFamilyRecipePoolItem(props.familyCode, dishJson)
    uni.showToast({ title: '添加成功', icon: 'none' })
    newRandomDish.value = ''
    loadRandomMenu()
  } catch (e) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

const removeRandomDish = async (dish) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该抽菜项吗？',
    successText: '确认删除',
    successColor: '#FF4444',
    success: async (res) => {
      if (res.confirm) {
        try {
          await familyApi.deleteFamilyRecipePoolItem(dish.id)
          uni.showToast({ title: '已删除', icon: 'none' })
          loadRandomMenu()
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// 统一按钮分发
const handleSetting = (name) => {
  if (name === '抽菜配置') {
    loadRandomMenu()
    showRandomMenuModal.value = true
  } else if (name === '随手记') {
    uni.navigateTo({
      url: '/pages/family/component/singlePage/memo?type=personal'
    })
  } else {
    uni.showToast({ title: `功能「${name}」开发中...`, icon: 'none' })
  }
}
</script>

<style lang="less" scoped>
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx 20rpx;
  padding: 10rpx 0;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.92);
  }
  
  .q-icon-wrap {
    width: 100rpx;
    height: 100rpx;
    background: #F8F9FA;
    border-radius: 32rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.01);
  }
  
  .q-icon {
    font-size: 44rpx;
  }
  
  .q-text {
    font-size: 22rpx;
    color: #7F8C8D;
    font-weight: 500;
  }
}

// --- 弹窗公共及抽菜专用Less样式 ---
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
// --- 场景 Tab 样式 ---
.scene-tabs {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.scene-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 16rpx 0;
  border-radius: 20rpx;
  background: #F5F6F7;
  transition: all 0.2s;

  .tab-icon { font-size: 30rpx; }
  .tab-label { font-size: 22rpx; color: #999; font-weight: 500; }

  &.active {
    background: var(--primary-light, #FFE8EE);
    .tab-label { color: var(--primary, #FF6B8B); font-weight: 700; }
  }

  &:active { transform: scale(0.95); }
}
</style>

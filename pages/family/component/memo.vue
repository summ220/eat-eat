<template>
  <view class="page" :style="themeStyle">
    <custom-header title="家庭备忘录" icon="📝" back />
    
    <view class="content">
      <view class="memo-list">
        <view class="memo-card" v-for="(item, index) in memos" :key="item.id" @click="editMemo(item)">
          <text class="memo-text">{{ getFirstLine(item.content) }}</text>
          <text class="delete-btn" @click.stop="deleteMemo(index)">删除</text>
        </view>
        <view class="empty-state" v-if="memos.length === 0">
          <text>暂无备忘录，快来添加一条吧~</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer-actions">
      <button class="add-btn" @click="addMemo">+ 新增备忘录</button>
    </view>

    <!-- 编辑弹窗 -->
    <view class="modal-mask" v-if="showModal" @click="showModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{ currentMemo.id ? '编辑备忘录' : '新增备忘录' }}</text>
        <textarea class="memo-input" v-model="currentMemo.content" placeholder="输入备忘内容..." auto-height />
        <view class="modal-btns">
          <button class="cancel-btn" @click="showModal = false">取消</button>
          <button class="confirm-btn" @click="saveMemo">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// 主题支持
const themes = [
  { color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
  { color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
  { color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
  { color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
]
const currentTheme = ref(0)
const themeStyle = computed(() => {
  const t = themes[currentTheme.value]
  return `
    --primary: ${t.color};
    --primary-grad: ${t.gradient};
    --primary-light: ${t.light};
    --primary-shadow: ${t.shadow};
  `
})

const memos = ref([])
const showModal = ref(false)
const currentMemo = ref({ id: '', content: '' })

onShow(() => {
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  loadMemos()
})

const loadMemos = () => {
  memos.value = uni.getStorageSync('family_memos') || []
}

const getFirstLine = (text) => {
  if (!text) return ''
  const lines = text.split('\n')
  return lines[0].length > 20 ? lines[0].substring(0, 20) + '...' : lines[0]
}

const addMemo = () => {
  currentMemo.value = { id: '', content: '' }
  showModal.value = true
}

const editMemo = (item) => {
  currentMemo.value = { ...item }
  showModal.value = true
}

const deleteMemo = (index) => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定删除吗？',
    confirmColor: '#FF4D4F',
    success: (res) => {
      if (res.confirm) {
        memos.value.splice(index, 1)
        uni.setStorageSync('family_memos', memos.value)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

const saveMemo = () => {
  if (!currentMemo.value.content.trim()) {
    return uni.showToast({ title: '内容不能为空', icon: 'none' })
  }
  
  if (currentMemo.value.id) {
    const idx = memos.value.findIndex(m => m.id === currentMemo.value.id)
    if (idx !== -1) {
      memos.value[idx].content = currentMemo.value.content
    }
  } else {
    memos.value.unshift({
      id: Date.now().toString(),
      content: currentMemo.value.content,
      time: new Date().getTime()
    })
  }
  
  uni.setStorageSync('family_memos', memos.value)
  showModal.value = false
  uni.showToast({ title: '保存成功', icon: 'success' })
}
</script>

<style lang="less" scoped>
.page {
  background: #FAFAFA;
  min-height: 100vh;
  padding-bottom: 180rpx;
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 400rpx);
}

.content {
  padding: 30rpx 40rpx;
}

.memo-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
}

.memo-text {
  font-size: 30rpx;
  color: #2C3E50;
  font-weight: bold;
  flex: 1;
  margin-right: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  font-size: 26rpx;
  color: #FF4D4F;
  background: #FFF0F0;
  padding: 10rpx 24rpx;
  border-radius: 100rpx;
  font-weight: bold;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 150rpx;
  color: #95A5A6;
  font-size: 28rpx;
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx 40rpx 60rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.add-btn {
  background: var(--primary-grad);
  color: #fff;
  border-radius: 100rpx;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx var(--primary-shadow);
  border: none;
  &::after { border: none; }
}

.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  width: 620rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.1);
}

.modal-title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  font-weight: 800;
  color: #333;
  margin-bottom: 40rpx;
}

.memo-input {
  width: 100%;
  min-height: 200rpx;
  background: #F8F9FA;
  border-radius: 24rpx;
  padding: 30rpx;
  font-size: 30rpx;
  color: #2C3E50;
  line-height: 1.5;
  margin-bottom: 40rpx;
  box-sizing: border-box;
}

.modal-btns {
  display: flex;
  gap: 30rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 100rpx;
  font-size: 30rpx;
  font-weight: bold;
  margin: 0;
  &::after { border: none; }
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
</style>

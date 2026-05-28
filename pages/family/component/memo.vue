<template>
  <custom-header :title="memoType === 'personal' ? '随手记' : '家庭备忘录'" icon="📝" back />
  <view class="page" :style="themeStyle">
    <view class="content">
      <view class="memo-list">
        <view class="memo-card" v-for="(item, index) in memos" :key="item.id" @click="editMemo(item)">
          <text class="memo-text">{{ getFirstLine(item.content) }}</text>
          <text class="delete-btn" @click.stop="deleteMemo(item, index)">删除</text>
        </view>
        <view class="empty-state" v-if="memos.length === 0">
          <text>{{ memoType === 'personal' ? '暂无随手记，快来添加一条吧~' : '暂无备忘录，快来添加一条吧~' }}</text>
        </view>
      </view>
    </view>

    <!-- 底部固定的新增按钮 -->
    <view class="footer-actions">
      <button class="add-btn" @click="addMemo">{{ memoType === 'personal' ? '+ 新增随手记' : '+ 新增备忘录' }}</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import familyApi from '@/common/api/family.js'

const familyCode = uni.getStorageSync('family_code')
const memoType = ref('family')

onLoad((options) => {
  if (options.type) {
    memoType.value = options.type
  }
})

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

onShow(() => {
  currentTheme.value = uni.getStorageSync('current_theme') || 0
  loadMemos()
})

// 监听跨页面全局刷新事件，实现多保险即时接口刷新
uni.$on('refreshMemos', () => {
  loadMemos()
})

import { onUnload } from '@dcloudio/uni-app'
onUnload(() => {
  uni.$off('refreshMemos')
})

const loadMemos = async () => {
  try {
    const res = memoType.value === 'personal'
      ? await familyApi.getPersonalNotes()
      : await familyApi.getFamilyMemos(familyCode)
    
    if (res && res.data) {
      // 兼容后端返回的不同结构属性 notes 或 memos
      memos.value = (memoType.value === 'personal' ? res.data.notes : res.data.memos) || res.data || []
    }
  } catch (err) {
    console.error('获取备忘录列表失败:', err)
  }
}

// 剔除 HTML 标签提取纯文本
const getFirstLine = (text) => {
  if (!text) return ''
  const plainText = text.replace(/<[^>]+>/g, '').trim()
  return plainText.length > 20 ? plainText.substring(0, 20) + '...' : plainText
}

const addMemo = () => {
  uni.navigateTo({
    url: `/pages/family/component/memo-edit?type=${memoType.value}`
  })
}

const editMemo = (item) => {
  uni.navigateTo({
    url: `/pages/family/component/memo-edit?id=${item.id}&type=${memoType.value}`
  })
}

const deleteMemo = (item, index) => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定删除吗？',
    confirmColor: '#FF4D4F',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中...' })
        try {
          if (memoType.value === 'personal') {
            await familyApi.deletePersonalNote(item.id)
          } else {
            await familyApi.deleteFamilyMemo(familyCode, item.id)
          }
          memos.value.splice(index, 1)
          uni.showToast({ title: '已删除', icon: 'success' })
        } catch (err) {
          console.error('删除备忘录失败:', err)
          uni.showToast({ title: '删除失败，请重试', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}
</script>

<style lang="less" scoped>
.page {
  background: #FAFAFA;
  height: 89vh;
  padding-bottom: 220rpx;
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
  padding-top: 80rpx;
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
</style>

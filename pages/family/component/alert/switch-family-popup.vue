<!-- 切换家庭弹窗组件 -->
<template>
  <view class="modal-mask" v-if="show" @click="emitClose">
    <view class="modal-content switch-family-modal" @click.stop :style="themeStyle">
      <view class="modal-header-box">
        <text class="modal-title">{{ familyCode ? '切换家庭' : '选择/创建家庭' }}</text>
        <text class="close-btn" @click="emitClose">✕</text>
      </view>
      
      <!-- 当前使用 -->
      <view class="family-section-label" v-if="familyCode">当前使用</view>
      <view class="active-family-card" v-if="familyCode">
        <view class="active-family-left">
          <image class="active-family-avatar" :src="familyAvatar ? (familyAvatar.startsWith('http') ? familyAvatar : config.imgBaseUrl + familyAvatar) : config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'" mode="aspectFill" />
          <view class="active-family-info">
            <text class="active-family-name">{{ familyName || '默认家庭' }}</text>
            <text class="active-family-role-label">{{ familyRole === 'owner' ? '管理员' : '成员' }}</text>
          </view>
        </view>
        <view class="active-family-badge">
          <text class="badge-text">✔ 当前</text>
        </view>
      </view>

      <!-- 其他家庭 -->
      <view class="family-section-label">我加入的其他家庭</view>
      <view v-if="loadingFamilies" class="other-families-loading">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">正在加载家庭列表...</text>
      </view>
      <block v-else>
        <scroll-view scroll-y class="other-families-scroll" v-if="otherFamilies.length > 0">
          <view 
            class="other-family-card-item" 
            v-for="fam in otherFamilies" 
            :key="fam.familyCode"
            @click="switchFamily(fam)"
          >
            <view class="active-family-left">
              <image class="active-family-avatar" :src="fam.avatarUrl ? (fam.avatarUrl.startsWith('http') ? fam.avatarUrl : config.imgBaseUrl + fam.avatarUrl) : config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'" mode="aspectFill" />
              <view class="active-family-info">
                <text class="active-family-name">{{ fam.familyName }}</text>
                <text class="active-family-role-label">{{ fam.role === 'owner' ? '管理员' : '成员' }}</text>
              </view>
            </view>
            <view class="other-family-action-arrow">👉</view>
          </view>
        </scroll-view>
        <view class="other-families-empty" v-else>
          <view class="empty-icon-wrap">👪</view>
          <text class="empty-tip-text">暂无其他可切换家庭</text>
        </view>
      </block>

      <!-- 底部操作按钮 -->
      <view class="bottom-modal-actions">
        <button class="action-btn-primary" @click="handleCreateFamily">
          <text class="btn-icon">＋</text> 创建新家庭
        </button>
        <button class="action-btn-secondary" @click="handleJoinFamily">
          <text class="btn-icon">🔗</text> 加入已有家庭
        </button>
      </view>
      <view class="text-center">
        <text class="abandon-btn" @click="abandonFamily">
          找回其他家庭
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import familyApi from '@/common/api/family.js'
import config from '@/common/config.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  familyCode: {
    type: String,
    default: ''
  },
  familyName: {
    type: String,
    default: ''
  },
  familyAvatar: {
    type: String,
    default: ''
  },
  familyRole: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'join'])

const families = ref([])
const loadingFamilies = ref(false)
const themeStyle = ref('')

const otherFamilies = computed(() => {
  return families.value.filter(fam => fam.familyCode !== props.familyCode)
})

// 获取家庭列表
const loadMyFamilies = async () => {
  loadingFamilies.value = true
  try {
    const res = await familyApi.getMyFamilies()
    if (res && res.data) {
      families.value = res.data.families || []
    }
  } catch (e) {
    console.error('加载家庭列表失败', e)
    uni.showToast({ title: '加载家庭列表失败', icon: 'none' })
  } finally {
    loadingFamilies.value = false
  }
}

watch(() => props.show, async (newVal) => {
  if (newVal) {
    await loadMyFamilies()
    
    // 动态计算主题色彩
    const themeIdx = uni.getStorageSync('current_theme') || 0
    const themes = [
      { name: '温柔粉', color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
      { name: '清新绿', color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
      { name: '雾霾蓝', color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
      { name: '暖杏黄', color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
    ]
    const t = themes[themeIdx]
    themeStyle.value = `
      --primary: ${t.color};
      --primary-grad: ${t.gradient};
      --primary-light: ${t.light};
      --primary-shadow: ${t.shadow};
    `
  }
})

const emitClose = () => {
  emit('close')
}

// 切换家庭业务逻辑
const switchFamily = async (fam) => {
  if (fam.familyCode === props.familyCode) return
  uni.showLoading({ title: '切换中...' })
  try {
    uni.setStorageSync('family_code', fam.familyCode)
    uni.setStorageSync('family_name', fam.familyName)
    uni.setStorageSync('family_avatar', fam.avatarUrl || '')
    uni.setStorageSync('family_role', fam.role || 'member')
    
    uni.showToast({ title: '已切换至 ' + fam.familyName, icon: 'success' })
    emitClose()
    
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/family/family' })
    }, 500)
  } catch (e) {
    console.error('切换家庭失败', e)
    uni.showToast({ title: '切换失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 创建新家庭逻辑
const handleCreateFamily = () => {
  emitClose()
  uni.showModal({
    title: '创建新家庭',
    placeholderText: '请输入新家庭名称，如：温馨之家',
    editable: true,
    success: async (res) => {
      if (res.confirm) {
        const newName = res.content ? res.content.trim() : ''
        if (!newName) {
          uni.showToast({ title: '家庭名称不能为空', icon: 'none' })
          return
        }
        uni.showLoading({ title: '正在创建新家庭...' })
        try {
          const apiRes = await familyApi.createFamily(newName)
          if (apiRes && apiRes.data) {
            const fam = apiRes.data.family
            const member = apiRes.data.member
            uni.setStorageSync('family_code', fam.familyCode)
            uni.setStorageSync('family_name', fam.familyName)
            uni.setStorageSync('family_avatar', fam.avatarUrl || '')
            uni.setStorageSync('family_role', member.role || 'owner')
            
            uni.showToast({ title: '创建家庭成功', icon: 'success' })
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/family/family' })
            }, 500)
          } else {
            uni.showToast({ title: apiRes.message || '创建家庭失败', icon: 'none' })
          }
        } catch (e) {
          console.error(e)
          uni.showToast({ title: '创建家庭失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 加入已有家庭按钮触发
const handleJoinFamily = () => {
  emitClose()
  emit('join')
}

// 找回家庭
const abandonFamily = () => {
  emitClose()
  uni.navigateTo({
    url: '/pages/welcome/welcome?action=restore'
  })
}
</script>

<style lang="less" scoped>
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #fff;
  border-radius: 40rpx;
  width: 85%;
  max-width: 600rpx;
  padding: 40rpx;
  box-sizing: border-box;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.switch-family-modal {
  padding: 40rpx 36rpx;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  flex-shrink: 0;
  
  .modal-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #2C3E50;
  }
  .close-btn {
    font-size: 32rpx;
    color: #95A5A6;
    padding: 10rpx;
  }
}

.family-section-label {
  font-size: 24rpx;
  font-weight: 800;
  color: #7F8C8D;
  margin: 20rpx 0 12rpx 6rpx;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  flex-shrink: 0;
}

.active-family-card {
  background: var(--primary-light);
  border: 2rpx solid var(--primary);
  border-radius: 28rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  flex-shrink: 0;
}

.active-family-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.active-family-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  border: 2rpx solid rgba(0,0,0,0.05);
}

.active-family-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.active-family-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #2C3E50;
}

.active-family-role-label {
  font-size: 20rpx;
  background: var(--primary);
  color: #fff;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  align-self: flex-start;
  font-weight: bold;
}

.active-family-badge {
  .badge-text {
    font-size: 22rpx;
    color: var(--primary);
    font-weight: bold;
  }
}

.other-families-scroll {
  max-height: 360rpx;
  margin-bottom: 30rpx;
  flex: 1;
}

.other-family-card-item {
  background: #F8F9FA;
  border: 2rpx solid transparent;
  border-radius: 28rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  transition: all 0.2s ease;
  
  &:active {
    background: #EFEFEF;
  }
}

.other-family-action-arrow {
  font-size: 24rpx;
  color: #BDC3C7;
}

.other-families-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  gap: 12rpx;
  
  .loading-icon {
    font-size: 40rpx;
    animation: spin 1s linear infinite;
  }
  .loading-text {
    font-size: 22rpx;
    color: #95A5A6;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.other-families-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  gap: 12rpx;
  
  .empty-icon-wrap {
    font-size: 50rpx;
  }
  .empty-tip-text {
    font-size: 24rpx;
    color: #BDC3C7;
  }
}

.bottom-modal-actions {
  display: flex;
  // flex-direction: column;
  gap: 16rpx;
  margin-top: 10rpx;
  flex-shrink: 0;
  
  .action-btn-primary {
    background: var(--primary-grad);
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    box-shadow: 0 8rpx 16rpx var(--primary-shadow);
    border: none;
    &::after { border: none; }
  }
  
  .action-btn-secondary {
    background: #fff;
    color: #2C3E50;
    font-size: 28rpx;
    font-weight: bold;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    border: 2rpx solid var(--primary);
  }
}

.text-center {
  text-align: center;
  margin-top: 20rpx;
  flex-shrink: 0;
}

.abandon-btn {
  font-size: 24rpx;
  color: #7F8C8D;
  text-decoration: underline;
  padding: 10rpx;
}
</style>

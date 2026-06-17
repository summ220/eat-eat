<!-- 管理员专属：馆长收件箱弹窗 -->
<template>
  <view class="modal-mask" v-if="show" @click="!isSubmitting && close">
    <view class="modal-content" @click.stop>
      <!-- 头部主题 -->
      <view class="post-header">
        <text class="post-emoji">👩‍🍳</text>
        <view class="post-title-wrap">
          <text class="post-title">馆长收信箱</text>
          <text class="post-sub">阅览小厨房用户寄来的每一封信，并予以回信</text>
        </view>
      </view>

      <!-- 反馈心情筛选 Tab -->
      <view class="filter-tabs">
        <view 
          class="tab-item" 
          :class="{ active: filterType === 'all' }" 
          @click="filterType = 'all'"
        >全部</view>
        <view 
          class="tab-item" 
          :class="{ active: filterType === 'pending' }" 
          @click="filterType = 'pending'"
        >未回复</view>
        <view 
          class="tab-item" 
          :class="{ active: filterType === 'replied' }" 
          @click="filterType = 'replied'"
        >已回复</view>
      </view>

      <!-- 用户来信列表 -->
      <scroll-view class="admin-history-list" scroll-y :show-scrollbar="false">
        <view v-if="loading" class="list-state">
          <view class="loading-spinner"></view>
          <text class="state-text">正在翻阅信箱中...</text>
        </view>
        
        <view v-else-if="filteredList.length === 0" class="list-state empty">
          <text class="empty-emoji">📭</text>
          <text class="state-text">空空如也的信箱</text>
          <text class="state-sub">目前没有对应的用户来信哦～</text>
        </view>

        <view v-else class="letter-cards">
          <view v-for="item in filteredList" :key="item.id" class="letter-card">
            <view class="card-top-meta">
              <view class="meta-left">
                <text class="mood-tag" :class="item.type">{{ getTypeEmoji(item.type) }} {{ getTypeText(item.type) }}</text>
                <text class="date-text">{{ item.date }}</text>
              </view>
              <text class="id-text">ID: {{ item.id }}</text>
            </view>

            <!-- 来信详情 -->
            <view class="sender-content">
              <text class="sc-text">{{ item.content }}</text>
            </view>

            <!-- 附带联系方式 -->
            <view class="contact-desc" v-if="item.contact">
              <text class="c-tag">📮 联系方式：</text>
              <text class="c-val" @click="copyText(item.contact)">{{ item.contact }} 📋</text>
            </view>

            <!-- 馆长回信区 -->
            <view class="reply-section">
              <!-- 已回复：直接展示回复文本 -->
              <view v-if="item.replied" class="replied-box">
                <view class="reply-meta">
                  <text class="rm-avatar">👩‍🍳</text>
                  <text class="rm-label">已回复：</text>
                </view>
                <text class="reply-text">{{ item.replyText }}</text>
              </view>

              <!-- 未回复：提供输入框和提笔按钮 -->
              <view v-else class="reply-input-box">
                <textarea 
                  class="reply-textarea" 
                  v-model="replyInputs[item.id]" 
                  placeholder="提笔给小主人回一封信吧..." 
                  maxlength="200"
                  cursor-spacing="100"
                />
                <button 
                  class="reply-send-btn" 
                  :disabled="isSubmitting" 
                  @click="submitReply(item)"
                >
                  <text>寄出回信 🕊️</text>
                </button>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作按钮 -->
      <view class="modal-btns">
        <button class="m-btn-main" @click="close">离开收信箱</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import familyApi from '@/common/api/family.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const isSubmitting = ref(false)
const filterType = ref('all') // all / pending / replied
const allFeedbacks = ref([])
const replyInputs = reactive({}) // 绑定每一封信件的输入框

const getTypeEmoji = (type) => {
  if (type === 'love') return '🥰'
  if (type === 'idea') return '💡'
  return '😢'
}

const getTypeText = (type) => {
  if (type === 'love') return '夸一夸'
  if (type === 'idea') return '提建议'
  return '遇Bug'
}

// 过滤后的列表
const filteredList = computed(() => {
  if (filterType.value === 'pending') {
    return allFeedbacks.value.filter(item => !item.replied)
  }
  if (filterType.value === 'replied') {
    return allFeedbacks.value.filter(item => item.replied)
  }
  return allFeedbacks.value
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    filterType.value = 'all'
    loadAllFeedbacks()
  }
})

const close = () => {
  emit('close')
}

// 提示输入 Token
const promptToken = () => {
  uni.showModal({
    title: '管理员密码箱',
    placeholderText: '请输入馆长管理 Token',
    editable: true,
    success: (res) => {
      if (res.confirm) {
        const token = res.content.trim()
        if (token) {
          uni.setStorageSync('admin_feedback_token', token)
          loadAllFeedbacks()
        } else {
          uni.showToast({ title: 'Token 不能为空', icon: 'none' })
          close()
        }
      } else {
        close()
      }
    }
  })
}

// 载入全部用户的意见反馈
const loadAllFeedbacks = async () => {
  const token = uni.getStorageSync('admin_feedback_token')
  if (!token) {
    promptToken()
    return
  }

  loading.value = true
  try {
    const res = await familyApi.getAdminFeedbackList(token)
    const list = Array.isArray(res) ? res : (res && res.data ? res.data : [])
    allFeedbacks.value = list.map(item => ({
      id: item.id || Date.now(),
      type: item.type || 'love',
      content: item.content || '',
      contact: item.contact || '',
      date: item.date || '',
      replied: !!item.replied,
      replyText: item.replyText || ''
    }))
  } catch (e) {
    console.error('拉取管理员反馈列表失败:', e)
    uni.showModal({
      title: '拉取失败',
      content: '管理员Token可能已过期或无效，是否重新输入？',
      success: (confirmRes) => {
        if (confirmRes.confirm) {
          uni.removeStorageSync('admin_feedback_token')
          promptToken()
        } else {
          close()
        }
      }
    })
  } finally {
    loading.value = false
  }
}

// 提交回信给特定用户
const submitReply = async (item) => {
  const replyContent = replyInputs[item.id] || ''
  if (!replyContent.trim()) {
    uni.showToast({ title: '回信内容空空如也，无法飞信哦～', icon: 'none' })
    return
  }

  const token = uni.getStorageSync('admin_feedback_token')
  if (!token) {
    uni.showToast({ title: 'Token 未授权，请重新打开页面', icon: 'none' })
    return
  }

  isSubmitting.value = true
  uni.showLoading({ title: '飞鸽回传中...', mask: true })

  try {
    await familyApi.replyFeedback(item.id, replyContent.trim())
    uni.showToast({ title: '回信成功寄出！', icon: 'success' })
    // 前端更新状态
    item.replied = true
    item.replyText = replyContent.trim()
    replyInputs[item.id] = '' // 清空输入框
  } catch (e) {
    console.error('管理员回复信件失败:', e)
    uni.showToast({ title: '回复接口异常，请重试', icon: 'none' })
  } finally {
    isSubmitting.value = false
    uni.hideLoading()
  }
}

// 一键复制联系方式
const copyText = (text) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制联系方式', icon: 'success' })
    }
  })
}
</script>

<style lang="less" scoped>
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  width: 660rpx;
  background: #FFFDF9;
  border-radius: 48rpx;
  padding: 50rpx 36rpx;
  box-sizing: border-box;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.08);
  border: 4rpx solid #F3EFE6;
  animation: modalScaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

/* 头部 */
.post-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;

  .post-emoji {
    font-size: 54rpx;
  }

  .post-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .post-title {
    font-size: 32rpx;
    font-weight: 800;
    color: #4A3E3D;
  }

  .post-sub {
    font-size: 20rpx;
    color: #A39391;
  }
}

/* 过滤 Tab 标签 */
.filter-tabs {
  display: flex;
  background: #F4EFE0;
  border-radius: 100rpx;
  padding: 6rpx;
  margin-bottom: 24rpx;
  gap: 6rpx;

  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 22rpx;
    font-weight: bold;
    color: #8C7B6B;
    padding: 12rpx 0;
    border-radius: 100rpx;
    transition: all 0.2s;

    &.active {
      background: #FFF;
      color: #4A3E3D;
      box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.04);
    }
  }
}

/* 滚动历史列表 */
.admin-history-list {
  max-height: 640rpx;
  margin-bottom: 30rpx;
  padding-right: 6rpx;
}

/* 各种列表状态 */
.list-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  text-align: center;

  .loading-spinner {
    width: 48rpx;
    height: 48rpx;
    border: 4rpx solid #E5DEC9;
    border-top: 4rpx solid var(--primary, #FF6B8B);
    border-radius: 50%;
    animation: spin 1s infinite linear;
    margin-bottom: 24rpx;
  }

  .state-text {
    font-size: 26rpx;
    font-weight: bold;
    color: #8C7B6B;
  }

  &.empty {
    .empty-emoji {
      font-size: 72rpx;
      margin-bottom: 20rpx;
    }
    .state-sub {
      font-size: 20rpx;
      color: #BDC3C7;
      margin-top: 6rpx;
    }
  }
}

.letter-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.letter-card {
  background: #FFFBF4;
  border: 2rpx solid #EAE5D9;
  border-radius: 28rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.01);

  .card-top-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .meta-left {
      display: flex;
      align-items: center;
      gap: 12rpx;
    }

    .mood-tag {
      font-size: 18rpx;
      font-weight: bold;
      padding: 6rpx 16rpx;
      border-radius: 100rpx;
      
      &.love { background: #FFE8EE; color: #FF5A79; }
      &.idea { background: #E6F7F0; color: #45A57F; }
      &.bug { background: #EDF2F7; color: #718096; }
    }

    .date-text {
      font-size: 20rpx;
      color: #BDC3C7;
    }

    .id-text {
      font-size: 18rpx;
      color: #C0C4CC;
    }
  }

  .sender-content {
    font-size: 24rpx;
    color: #4A3E3D;
    line-height: 1.5;
    margin-bottom: 16rpx;
    word-break: break-all;
  }

  .contact-desc {
    background: #F4EFE0;
    padding: 10rpx 16rpx;
    border-radius: 12rpx;
    font-size: 20rpx;
    margin-bottom: 16rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .c-tag {
      color: #8C7B6B;
      font-weight: bold;
    }

    .c-val {
      color: #4A3E3D;
      text-decoration: underline;
    }
  }

  /* 回信输入与处理 */
  .reply-section {
    margin-top: 16rpx;
    border-top: 2rpx dashed #E5DEC9;
    padding-top: 16rpx;

    /* 已回复 */
    .replied-box {
      background: var(--primary-light, #FFE8EE);
      border-radius: 16rpx;
      padding: 16rpx 20rpx;
      border-left: 6rpx solid var(--primary, #FF6B8B);

      .reply-meta {
        display: flex;
        align-items: center;
        gap: 6rpx;
        margin-bottom: 6rpx;

        .rm-avatar { font-size: 24rpx; }
        .rm-label { font-size: 20rpx; font-weight: bold; color: var(--primary, #FF6B8B); }
      }

      .reply-text {
        font-size: 22rpx;
        color: var(--primary, #FF6B8B);
        line-height: 1.5;
      }
    }

    /* 未回复：输入回信 */
    .reply-input-box {
      display: flex;
      flex-direction: column;
      gap: 12rpx;

      .reply-textarea {
        width: 100%;
        height: 120rpx;
        background: #F8F6F0;
        border-radius: 16rpx;
        padding: 16rpx;
        box-sizing: border-box;
        font-size: 22rpx;
        color: #4A3E3D;
        line-height: 1.4;
      }

      .reply-send-btn {
        align-self: flex-end;
        height: 60rpx;
        line-height: 60rpx;
        padding: 0 24rpx;
        background: var(--primary-grad, linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%));
        color: #fff;
        font-size: 20rpx;
        font-weight: bold;
        border-radius: 30rpx;
        margin: 0;
        border: none;
        box-shadow: 0 4rpx 10rpx rgba(255, 90, 121, 0.2);
        display: flex;
        align-items: center;
        gap: 6rpx;

        &[disabled] {
          opacity: 0.6;
        }

        &::after { border: none; }
      }
    }
  }
}

/* 按钮 */
.modal-btns {
  button {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    font-size: 26rpx;
    font-weight: bold;
    border-radius: 44rpx;
    background: #E5DEC9;
    color: #6C5B5A;
    border: none;
    margin: 0;
    
    &::after { border: none; }
    
    &:active {
      opacity: 0.9;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalScaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

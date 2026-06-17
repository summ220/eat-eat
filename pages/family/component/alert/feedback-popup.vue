<!-- 时光邮局反馈弹窗 -->
<template>
  <view class="modal-mask" v-if="show" @click="!isSending && close">
    <view class="modal-content" @click.stop>
      <!-- 右上角小信箱切换按钮 -->
      <view class="post-toggle-btn" v-if="!isSending && !isSent" @click="showHistory = !showHistory">
        <text class="t-icon">{{ showHistory ? '✍️ 我要写信' : '📬 我的信箱' }}</text>
      </view>

      <block v-if="!isSending && !isSent">
        <!-- 1. 写信模式 -->
        <block v-if="!showHistory">
          <!-- 头部主题 -->
          <view class="post-header">
            <text class="post-emoji">✉️</text>
            <view class="post-title-wrap">
              <text class="post-title">时光邮局</text>
              <text class="post-sub">给馆长寄一封信吧，我们会认真阅读的～</text>
            </view>
          </view>

          <!-- 反馈心情/类型选择 -->
          <view class="feedback-types">
            <view 
              class="type-item" 
              :class="{ active: activeType === 'love' }"
              @click="activeType = 'love'"
            >
              <text class="t-emoji">🥰</text>
              <text class="t-label">夸一夸</text>
            </view>
            <view 
              class="type-item" 
              :class="{ active: activeType === 'idea' }"
              @click="activeType = 'idea'"
            >
              <text class="t-emoji">💡</text>
              <text class="t-label">提建议</text>
            </view>
            <view 
              class="type-item" 
              :class="{ active: activeType === 'bug' }"
              @click="activeType = 'bug'"
            >
              <text class="t-emoji">😢</text>
              <text class="t-label">遇到Bug</text>
            </view>
          </view>

          <!-- 信纸输入区域 -->
          <view class="letter-paper">
            <textarea 
              class="letter-textarea" 
              v-model="content" 
              :placeholder="placeholderText"
              maxlength="300"
            />
            <view class="letter-word-count">{{ content.length }}/300</view>
          </view>

          <!-- 联系方式 -->
          <view class="contact-box">
            <text class="c-label">📮 留下联系方式 (选填)：</text>
            <input 
              class="contact-input" 
              v-model="contact" 
              placeholder="微信号 / 手机号 / 邮箱" 
              maxlength="50"
            />
          </view>

          <!-- 按钮 -->
          <view class="modal-btns">
            <button class="m-btn-sub" @click="close">收起信封</button>
            <button class="m-btn-main" @click="submitFeedback">投入邮筒</button>
          </view>
        </block>

        <!-- 2. 历史记录模式 -->
        <block v-else>
          <!-- 头部主题 -->
          <view class="post-header">
            <text class="post-emoji">📬</text>
            <view class="post-title-wrap">
              <text class="post-title">我的信箱</text>
              <text class="post-sub">已寄出的信件与馆长的温馨回信</text>
            </view>
          </view>

          <!-- 信件历史列表 -->
          <scroll-view class="history-list" scroll-y :show-scrollbar="false">
            <view v-if="feedbackList.length === 0" class="empty-mailbox">
              <text class="empty-emoji">📭</text>
              <text class="empty-text">邮箱里空空如也...</text>
              <text class="empty-sub">写一封寄给馆长的信件试试吧～</text>
            </view>
            <view v-else class="letter-cards">
              <view v-for="item in feedbackList" :key="item.id" class="letter-card">
                <view class="letter-card-header">
                  <view class="type-badge" :class="item.type">
                    <text class="tb-icon">{{ getTypeEmoji(item.type) }}</text>
                    <text class="tb-label">{{ getTypeText(item.type) }}</text>
                  </view>
                  <text class="letter-date">{{ item.date }}</text>
                </view>
                
                <!-- 寄信人原信件 -->
                <view class="letter-sender-body">
                  <text class="ls-text">{{ item.content }}</text>
                </view>

                <!-- 馆长回信 -->
                <view class="letter-reply-box" :class="{ 'has-replied': item.replied }">
                  <view class="reply-header">
                    <text class="rh-avatar">👩‍🍳</text>
                    <text class="rh-title">馆长回信：</text>
                  </view>
                  <text class="reply-content">{{ item.replied ? item.replyText : '📪 馆长正在阅读此信件...' }}</text>
                </view>
              </view>
            </view>
          </scroll-view>

          <!-- 按钮 -->
          <view class="modal-btns" style="margin-top: 20rpx;">
            <button class="m-btn-main" style="width: 100%;" @click="close">关闭信箱</button>
          </view>
        </block>
      </block>

      <!-- 寄信中的飞信动效 -->
      <view class="sending-box" v-else-if="isSending">
        <view class="loading-icon-wrap">
          <text class="loading-emoji">🕊️</text>
          <view class="loading-pulse"></view>
        </view>
        <text class="sending-text">飞鸽传书中...</text>
        <text class="sending-subtext">信件正飞往馆长的厨房，请稍候</text>
      </view>

      <!-- 投递成功状态 -->
      <view class="sending-box" v-else-if="isSent">
        <view class="success-icon-wrap">
          <text class="success-emoji">📮</text>
        </view>
        <text class="sending-text">投递成功！</text>
        <text class="sending-subtext">您的信件已安稳装入邮筒，感谢您的温暖相伴！</text>
        <button class="m-btn-main" style="width: 320rpx; margin-top: 40rpx;" @click="closeAndSwitch">去信箱查看回信</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import familyApi from '@/common/api/family.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const activeType = ref('love')
const content = ref('')
const contact = ref('')
const isSending = ref(false)
const isSent = ref(false)
const showHistory = ref(false)
const feedbackList = ref([])

const placeholderText = computed(() => {
  if (activeType.value === 'love') return '写下您觉得小厨房最贴心或者惊喜的地方吧，我们会开心一整天的～'
  if (activeType.value === 'idea') return '有什么灵光一闪的想法，或者希望增加的烹饪功能呢？馆长随时倾听～'
  return '哎呀，是遇到了什么麻烦或者报错吗？快告诉我们，我们会尽快修复的！'
})

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

watch(() => props.show, (newVal) => {
  if (newVal) {
    activeType.value = 'love'
    content.value = ''
    contact.value = ''
    isSending.value = false
    isSent.value = false
    showHistory.value = false
    fetchFeedbackList()
  }
})

const close = () => {
  emit('close')
}

const closeAndSwitch = () => {
  isSent.value = false
  showHistory.value = true
  fetchFeedbackList()
}

// 获取信件列表（对接服务端 /feedback/list）
const fetchFeedbackList = async () => {
  try {
    const res = await familyApi.getFeedbackList()
    console.log(res, 'feedback')
    const serverList = Array.isArray(res) ? res : (res && res.data ? res.data : [])
    feedbackList.value = serverList.map(item => ({
      id: item.id || Date.now(),
      type: item.type || 'love',
      content: item.content || '',
      contact: item.contact || '',
      date: item.date || '',
      replied: !!item.replied,
      replyText: item.replyText || ''
    }))
  } catch (e) {
    console.error('从服务器获取信箱列表失败:', e)
    uni.showToast({ title: '拉取信件历史失败', icon: 'none' })
  }
}

// 提交意见反馈（对接服务端 POST /feedback）
const submitFeedback = async () => {
  if (!content.value.trim()) {
    uni.showToast({ title: '信纸上空空的，写点什么吧～', icon: 'none' })
    return
  }

  isSending.value = true
  
  try {
    await familyApi.submitFeedback(activeType.value, content.value.trim(), contact.value.trim())
    // 成功，触发飞信成功动效
    setTimeout(() => {
      isSending.value = false
      isSent.value = true
    }, 1800)
  } catch (e) {
    console.error('提交反馈接口调用失败:', e)
    isSending.value = false
    uni.showToast({ title: '投递失败，请稍后重试', icon: 'none' })
  }
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
  width: 620rpx;
  background: #FFFDF9; // 米黄色信纸温馨质感
  border-radius: 48rpx;
  padding: 50rpx 40rpx;
  box-sizing: border-box;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.08);
  border: 4rpx solid #F3EFE6;
  animation: modalScaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

/* 右上角信箱切换按钮 */
.post-toggle-btn {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  background: #F4EFE0;
  border-radius: 100rpx;
  padding: 8rpx 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
  z-index: 100;
  
  &:active {
    transform: scale(0.92);
    opacity: 0.8;
  }

  .t-icon {
    font-size: 20rpx;
    font-weight: bold;
    color: #8C7B6B;
  }
}

/* 头部 */
.post-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 36rpx;
  padding-right: 180rpx; // 避开右上角按钮

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

/* 反馈心情类型 */
.feedback-types {
  display: flex;
  gap: 16rpx;
  margin-bottom: 30rpx;

  .type-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx 0;
    background: #F8F6F0;
    border-radius: 24rpx;
    border: 2rpx solid transparent;
    transition: all 0.25s ease;

    &:active {
      transform: scale(0.95);
    }

    .t-emoji {
      font-size: 38rpx;
    }

    .t-label {
      font-size: 22rpx;
      color: #6C5B5A;
      font-weight: bold;
    }

    &.active {
      background: var(--primary-light, #FFE8EE);
      border-color: var(--primary, #FF6B8B);
      
      .t-label {
        color: var(--primary, #FF6B8B);
      }
    }
  }
}

/* 信纸区域 */
.letter-paper {
  background: #FFFBF2;
  border: 2rpx dashed #E5DEC9;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  position: relative;

  .letter-textarea {
    width: 100%;
    height: 180rpx;
    font-size: 26rpx;
    line-height: 1.6;
    color: #4A3E3D;
  }

  .letter-word-count {
    font-size: 20rpx;
    color: #BDC3C7;
    text-align: right;
  }
}

/* 联系方式 */
.contact-box {
  margin-bottom: 40rpx;

  .c-label {
    font-size: 24rpx;
    font-weight: bold;
    color: #6C5B5A;
    display: block;
    margin-bottom: 12rpx;
  }

  .contact-input {
    width: 100%;
    height: 76rpx;
    background: #F8F6F0;
    border-radius: 20rpx;
    padding: 0 24rpx;
    box-sizing: border-box;
    font-size: 26rpx;
    color: #4A3E3D;
  }
}

/* 历史列表区域 */
.history-list {
  max-height: 580rpx;
  margin-bottom: 30rpx;
  padding-right: 6rpx;
}

.empty-mailbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  text-align: center;

  .empty-emoji {
    font-size: 72rpx;
    margin-bottom: 24rpx;
    animation: bounce 2s infinite ease-in-out;
  }

  .empty-text {
    font-size: 28rpx;
    font-weight: bold;
    color: #8C7B6B;
    margin-bottom: 10rpx;
  }

  .empty-sub {
    font-size: 22rpx;
    color: #BDC3C7;
  }
}

.letter-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.letter-card {
  background: #FFFDF9;
  border: 2rpx solid #EAE5D9;
  border-radius: 28rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.01);

  .letter-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .type-badge {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 6rpx 16rpx;
      border-radius: 100rpx;
      font-size: 18rpx;
      font-weight: bold;
      
      &.love { background: #FFE8EE; color: #FF5A79; }
      &.idea { background: #E6F7F0; color: #45A57F; }
      &.bug { background: #EDF2F7; color: #718096; }
    }

    .letter-date {
      font-size: 20rpx;
      color: #BDC3C7;
    }
  }

  .letter-sender-body {
    font-size: 24rpx;
    color: #5C4A49;
    line-height: 1.5;
    margin-bottom: 16rpx;
    word-break: break-all;
  }

  .letter-reply-box {
    background: #F8F6F0;
    border-radius: 16rpx;
    padding: 16rpx 20rpx;
    border-left: 6rpx solid #BDC3C7;
    transition: all 0.3s;

    &.has-replied {
      background: var(--primary-light, #FFE8EE);
      border-left-color: var(--primary, #FF6B8B);
      
      .reply-content {
        color: var(--primary, #FF6B8B);
      }
    }

    .reply-header {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 6rpx;

      .rh-avatar {
        font-size: 24rpx;
      }
      
      .rh-title {
        font-size: 20rpx;
        font-weight: bold;
        color: #8C7B6B;
      }
    }

    .reply-content {
      font-size: 22rpx;
      color: #9E938B;
      line-height: 1.5;
    }
  }
}

/* 按钮组 */
.modal-btns {
  display: flex;
  gap: 20rpx;

  button {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    font-size: 26rpx;
    font-weight: bold;
    border-radius: 44rpx;
    margin: 0;
    
    &::after { border: none; }
  }

  .m-btn-sub {
    background: #E5DEC9;
    color: #6C5B5A;
  }

  .m-btn-main {
    background: var(--primary-grad, linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%));
    color: #fff;
    box-shadow: 0 8rpx 20rpx var(--primary-shadow, rgba(255, 90, 121, 0.3));
    
    &:active {
      transform: scale(0.96);
    }
  }
}

/* 动效态 */
.sending-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50rpx 0;
  text-align: center;

  .loading-icon-wrap, .success-icon-wrap {
    width: 120rpx;
    height: 120rpx;
    background: var(--primary-light, #FFE8EE);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 32rpx;
    position: relative;
  }

  .success-icon-wrap {
    background: #EAFDF5;
  }

  .loading-emoji, .success-emoji {
    font-size: 54rpx;
    z-index: 2;
  }

  .loading-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--primary, #FF6B8B);
    opacity: 0.2;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .sending-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #4A3E3D;
    margin-bottom: 12rpx;
  }

  .sending-subtext {
    font-size: 24rpx;
    color: #A39391;
    line-height: 1.5;
  }

  .m-btn-main {
    background: var(--primary-grad, linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%));
    color: #fff;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 26rpx;
    font-weight: bold;
    border-radius: 40rpx;
    border: none;
    &::after { border: none; }
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

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(1); opacity: 0.3; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}
</style>

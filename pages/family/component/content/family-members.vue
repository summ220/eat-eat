<!-- 家庭成员列表与退出/解散、邀请、编辑及大图查看一体自治组件 -->
<template>
  <view class="members-container">
    <scroll-view scroll-x class="member-scroll" :show-scrollbar="false">
      <view class="member-list">
        <view class="member-card" v-for="(m, idx) in members" :key="idx" @click.stop="handleMemberClick(m)" >
          <view class="avatar-wrap">
            <image class="m-avatar" :class="{ 'is-owner': m.role === 'owner' }" :src="m.avatarUrl ? (m.avatarUrl.startsWith('http') ? m.avatarUrl : config.imgBaseUrl + m.avatarUrl) : config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbqsd7_0d13d785d123.jpg'" mode="aspectFill" @click.stop="previewImage(m.avatarUrl)" />
            <view class="edit-tag" v-if="m.isSelf" @click.stop="handleMemberClick(m)">✏️</view>
            <view class="edit-tag" v-if="m.role === 'owner' && !m.isSelf" @click.stop="handleMemberClick(m)">👑</view>
          </view>
          <text class="m-nick">{{ m.name || '干饭人' }}{{ m.isSelf ? ' (我)' : '' }}</text>
          <view class="m-role"><text>{{ m.title || '大主厨' }}</text></view>
        </view>
      </view>
    </scroll-view>
    
    <view class="family-ops" v-if="members.length > 1 && familyRole != 'owner'">
      <text class="exit-btn" @click="leaveFamily">退出当前家庭</text>
    </view>
    <view class="family-ops" v-if="familyRole === 'owner'">
      <text class="exit-btn" @click="disbandFamily">{{ members.length > 1 ? '解散当前家庭' : '注销当前家庭' }}</text>
    </view>

    <!-- 1. 邀请家人加入弹窗 -->
    <view class="modal-mask" v-if="showInviteModal" @click="closeInvite">
      <view class="modal-content invite-modal" @click.stop>
        <text class="modal-title">邀请家人加入</text>
        <view class="invite-info">
          <text class="invite-desc">让家人扫描二维码或输入邀请码</text>
          <view class="invite-code-box">
            <text class="code-val">{{ inviteCode }}</text>
            <text class="copy-btn" @click="copyCode">复制</text>
          </view>
          <view class="invite-expire-tip">
            <text class="expire-icon">⏱️</text>
            <text class="expire-text">邀请码有效期5分钟</text>
            <text class="expire-countdown">{{ formattedCountdown }}</text>
          </view>
          <view class="qr-placeholder">
            <text class="qr-icon">📱</text>
            <text>扫码加入家庭</text>
          </view>
        </view>
        <button class="close-modal-btn prim" @click="closeInvite">完成</button>
      </view>
    </view>

    <!-- 2. 编辑家庭成员昵称/角色弹窗 -->
    <view class="modal-mask" v-if="showNickModal" @click="showNickModal = false">
      <view class="modal-content" @click.stop>
        <view class="avatar-box">
          <image class="avatar" :src="tempAvatarUrl ? (tempAvatarUrl.startsWith('http') ? tempAvatarUrl : config.imgBaseUrl + tempAvatarUrl) : config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbqsd7_0d13d785d123.jpg'" mode="aspectFill" @click.stop="previewImage(tempAvatarUrl)"></image>
          <view class="camera-icon" @click.stop="chooseAvatar">📷</view>
        </view>
        <view class="input-box">
          <input class="join-input" v-model="tempNick" placeholder="请输入新昵称" />
        </view>
        <view class="input-box">
          <input class="join-input" v-model="tempTitle" placeholder="请输入新角色" />
        </view>
        <view class="modal-btns">
          <button class="m-btn-sub" @click="showNickModal = false">取消</button>
          <button class="m-btn-main" @click="confirmNick">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import familyApi from '@/common/api/family.js'
import recipeApi from '@/common/api/recipe.js'
import config from '@/common/config'

const props = defineProps({
  familyCode: {
    type: String,
    default: ''
  },
  familyRole: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['family-changed', 'show-switch-modal'])

const members = ref([])
const familyRole = ref(uni.getStorageSync('family_role') || 'member')

// --- 邀请弹窗的自治状态与逻辑 ---
const showInviteModal = ref(false)
const inviteCode = ref('')
const inviteCodeExpireTime = ref(0)
const countdownSeconds = ref(0)
let countdownTimer = null

watch(showInviteModal, (newVal) => {
  if (newVal) {
    initInvite()
  } else {
    clearTimer()
  }
})

const openInvite = () => {
  showInviteModal.value = true
}

const closeInvite = () => {
  showInviteModal.value = false
}

const clearTimer = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

onBeforeUnmount(() => {
  clearTimer()
})

const initInvite = async () => {
  if (!props.familyCode) return
  // 检查邀请码是否有效（5分钟内）
  if (inviteCode.value && Date.now() <= inviteCodeExpireTime.value) {
    startCountdown()
  } else {
    await getInviteCode()
  }
}

const getInviteCode = async () => {
  try {
    const res = await familyApi.createFamilyInvite(props.familyCode, 300)
    if (res && res.data) {
      inviteCode.value = res.data.inviteCode
      inviteCodeExpireTime.value = Date.now() + 5 * 60 * 1000
      startCountdown()
    } else {
      uni.showToast({ title: '获取验证码失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '获取验证码失败', icon: 'none' })
  }
}

const startCountdown = () => {
  clearTimer()
  
  const updateCountdown = () => {
    const remaining = Math.max(0, Math.ceil((inviteCodeExpireTime.value - Date.now()) / 1000))
    countdownSeconds.value = remaining
    if (remaining <= 0) {
      clearTimer()
    }
  }
  
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
}

const formattedCountdown = computed(() => {
  const minutes = Math.floor(countdownSeconds.value / 60)
  const seconds = countdownSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const copyCode = () => {
  if (!inviteCode.value) return
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => uni.showToast({ title: '复制成功' })
  })
}

// --- 编辑家庭成员昵称/角色自治逻辑 ---
const activeMember = ref({})
const showNickModal = ref(false)
const tempAvatarUrl = ref('')
const tempNick = ref('')
const tempTitle = ref('')

const handleMemberClick = (m) => {
  activeMember.value = m
  tempAvatarUrl.value = m.avatarUrl || ''
  tempNick.value = m.name || '干饭人'
  tempTitle.value = m.title || '大主厨'
  showNickModal.value = true
}

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...' })
      try {
        const fileManager = uni.getFileSystemManager()
        const base64 = fileManager.readFileSync(tempFilePath, 'base64')
        const imageData = 'data:image/jpeg;base64,' + base64
        
        const response = await recipeApi.uploadFamilyRecipeCover(props.familyCode || 'default_family', imageData)
        if (response && response.data && response.data.coverUrl) {
          tempAvatarUrl.value = response.data.coverUrl
          uni.showToast({ title: '上传成功', icon: 'success' })
        } else {
          uni.showToast({ title: '上传失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

const confirmNick = async () => {
  const nick = tempNick.value.trim()
  const title = tempTitle.value.trim()
  if (!nick) {
    return uni.showToast({ title: '昵称不能为空', icon: 'none' })
  }
  
  uni.showLoading({ title: '正在保存...', mask: true })
  try {
    const res = await familyApi.updateMyFamilyMemberProfile(props.familyCode, nick, title, tempAvatarUrl.value)
    if (res && res.data) {
      uni.showToast({ title: '更新成功', icon: 'success' })
      showNickModal.value = false
      await loadFamilyMembers()
    } else {
      uni.showToast({ title: res.message || '更新失败,请稍后重试', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// --- 查看大图官方预览自治逻辑 ---
const previewImage = (avatarUrl) => {
  const defaultUrl = config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbqsd7_0d13d785d123.jpg'
  const fullUrl = avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : config.imgBaseUrl + avatarUrl) : defaultUrl
  uni.previewImage({
    urls: [fullUrl]
  })
}

// --- 家庭成员数据拉取与退出解散逻辑 ---
const loadFamilyMembers = async () => {
  if (!props.familyCode) {
    members.value = []
    return
  }
  try {
    const res = await familyApi.getFamilyMembers(props.familyCode)
    if (res && res.data) {
      members.value = res.data || []
      // 找出自己
      members.value.forEach(m => {
        if (m.deviceId === uni.getStorageSync('device_id')) {
          m.isSelf = true
        } else {
          m.isSelf = false
        }
      })
      // 自己排到第一位，管理员第二，其他按加入时间倒序
      members.value.sort((a, b) => {
        if (a.isSelf) return -1
        if (b.isSelf) return 1
        if (a.role === 'owner') return -1
        if (b.role === 'owner') return 1
        return 1
      })
      const selfRole = members.value.find(m => m.isSelf)?.role || 'member'
      uni.setStorageSync('family_role', selfRole)
      familyRole.value = selfRole
      
      emit('family-changed', {
        role: selfRole,
        membersCount: members.value.length,
        membersList: members.value
      })
    }
  } catch (e) {
    console.error('加载家庭成员失败', e)
  }
}

const leaveFamily = () => {
  uni.showModal({
    title: '退出提醒',
    content: '确定要退出当前家庭吗？退出后将无法查看该家庭数据。',
    confirmColor: '#FF4D4F',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在退出...', mask: true })
        try {
          const resLeave = await familyApi.leaveFamily(props.familyCode)
          if (resLeave && resLeave.data) {
            uni.showToast({ title: '已退出家庭', icon: 'success' })
            
            // 查询最新的家庭列表
            const listRes = await familyApi.getMyFamilies()
            if (listRes && listRes.data && listRes.data.families && listRes.data.families.length > 0) {
              const newFam = listRes.data.families[0]
              uni.setStorageSync('family_code', newFam.familyCode)
              uni.setStorageSync('family_name', newFam.familyName)
              uni.setStorageSync('family_avatar', newFam.avatarUrl || '')
              uni.setStorageSync('family_role', newFam.role || 'member')
              
              uni.showToast({ title: '已自动切换至 ' + newFam.familyName, icon: 'success' })
              setTimeout(() => {
                uni.reLaunch({ url: '/pages/family/family' })
              }, 800)
            } else {
              // 没有任何可用家庭了，重置状态
              uni.setStorageSync('family_code', '')
              uni.setStorageSync('family_name', '')
              uni.setStorageSync('family_avatar', '')
              uni.setStorageSync('family_role', '')
              
              emit('show-switch-modal')
            }
          } else {
            uni.showToast({ title: resLeave.message || '退出家庭失败,请稍后重试', icon: 'none' })
          }
        } catch (e) {
          console.error('退出家庭出错', e)
          uni.showToast({ title: '退出失败，请重试', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

const disbandFamily = () => {
  if (members.value.length > 1) {
    uni.showModal({
      title: '无法注销家庭',
      content: '当前家庭中还存在其他成员。为了保障大家的共有数据资产安全，请先请其他成员主动退出，仅剩您一人时方可注销当前家庭。',
      showCancel: false,
      confirmColor: '#FF4D4F'
    })
    return
  }

  uni.showModal({
    title: '注销家庭',
    content: '确定要注销当前家庭吗？注销后该家庭的全部关联数据（食材、菜谱、账本）将被彻底清除且无法恢复！',
    confirmColor: '#FF4D4F',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在注销...', mask: true })
        try {
          const resDelete = await familyApi.deleteFamily(props.familyCode)
          if (resDelete && resDelete.data) {
            uni.showToast({ title: '已注销家庭', icon: 'success' })
            
            // 查询最新的家庭列表
            const listRes = await familyApi.getMyFamilies()
            if (listRes && listRes.data && listRes.data.families && listRes.data.families.length > 0) {
              const newFam = listRes.data.families[0]
              uni.setStorageSync('family_code', newFam.familyCode)
              uni.setStorageSync('family_name', newFam.familyName)
              uni.setStorageSync('family_avatar', newFam.avatarUrl || '')
              uni.setStorageSync('family_role', newFam.role || 'member')
              
              uni.showToast({ title: '已自动切换至 ' + newFam.familyName, icon: 'success' })
              setTimeout(() => {
                uni.reLaunch({ url: '/pages/family/family' })
              }, 800)
            } else {
              // 没有任何可用家庭了，重置状态
              uni.setStorageSync('family_code', '')
              uni.setStorageSync('family_name', '')
              uni.setStorageSync('family_avatar', '')
              uni.setStorageSync('family_role', '')
              
              emit('show-switch-modal')
            }
          } else {
            uni.showToast({ title: resDelete.message || '注销家庭失败,请稍后重试', icon: 'none' })
          }
        } catch (e) {
          console.error('注销家庭出错', e)
          uni.showToast({ title: '注销失败，请重试', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 自动响应 familyCode 变化拉取
watch(() => props.familyCode, (newVal) => {
  if (newVal) {
    loadFamilyMembers()
  }
}, { immediate: true })

defineExpose({
  loadFamilyMembers,
  openInvite
})
</script>

<style lang="less" scoped>
.member-scroll {
  width: 100%;
  white-space: nowrap;
}
.member-list {
  display: inline-flex;
  gap: 30rpx;
  padding: 10rpx 0;
}
.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #F8F9FA;
  padding: 30rpx 40rpx;
  border-radius: 36rpx;
  min-width: 160rpx;
  position: relative;
  transition: all 0.3s;
  &:active { transform: scale(0.95); background: #F0F2F5; }
  
  .avatar-wrap {
    position: relative;
    margin-bottom: 16rpx;
    .m-avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      border: 4rpx solid #fff;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    }
    .is-owner {
      border-color: var(--primary);
    }
    .edit-tag {
      position: absolute;
      right: -6rpx;
      bottom: -6rpx;
      background: var(--primary);
      color: #fff;
      width: 36rpx;
      height: 36rpx;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20rpx;
      border: 2rpx solid #fff;
    }
  }
  .m-nick {
    font-size: 28rpx;
    font-weight: bold;
    color: #2C3E50;
    margin-bottom: 8rpx;
  }
  .m-role {
    font-size: 20rpx;
    color: var(--primary);
    background: var(--primary-light);
    padding: 4rpx 16rpx;
    border-radius: 100rpx;
    transition: all 0.5s ease;
  }
}

.family-ops {
  margin-top: 30rpx;
  display: flex;
  justify-content: center;
  .exit-btn {
    font-size: 24rpx;
    color: #BDC3C7;
    text-decoration: underline;
    padding: 10rpx;
  }
}

// --- 公用磨砂弹窗遮罩及布局 ---
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
}

// 邀请弹窗专用额外修饰
.invite-modal {
  .modal-title {
    font-size: 34rpx;
    font-weight: 800;
    color: #2C3E50;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .invite-info {
    text-align: center;
    padding: 20rpx 0;
    width: 100%;
    
    .invite-desc {
      font-size: 26rpx;
      color: #7F8C8D;
      display: block;
      margin-bottom: 40rpx;
    }
    
    .invite-code-box {
      background: #F8F9FA;
      padding: 30rpx;
      border-radius: 24rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      border: 2rpx dashed var(--primary);
      box-sizing: border-box;
      
      .code-val {
        font-size: 48rpx;
        font-weight: 900;
        color: var(--primary);
        letter-spacing: 4rpx;
      }
      
      .copy-btn {
        font-size: 24rpx;
        color: #fff;
        background: var(--primary);
        padding: 10rpx 24rpx;
        border-radius: 100rpx;
        font-weight: bold;
      }
    }
    
    .invite-expire-tip {
      margin-bottom: 30rpx;
      color: #ccc;
      font-size: 22rpx;
      .expire-countdown {
        margin-left: 18rpx;
        color: #FF4D6D;
        font-weight: bold;
      }
    }
    
    .qr-placeholder {
      width: 280rpx;
      height: 280rpx;
      background: #fff;
      border: 2rpx solid #F0F2F5;
      border-radius: 30rpx;
      margin: 0 auto 30rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16rpx;
      color: #BDC3C7;
      font-size: 22rpx;
      
      .qr-icon { font-size: 80rpx; }
    }
  }
  
  .close-modal-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 100rpx;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    &::after { border: none; }
    
    &.prim {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 8rpx 20rpx var(--primary-shadow);
    }
  }
}

// --- 编辑自己昵称角色弹窗额外修饰 ---
.avatar-box {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 40rpx;
  
  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4rpx solid #fff;
    box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.08);
  }
  
  .camera-icon {
    position: absolute;
    right: 0;
    bottom: 0;
    background: var(--primary);
    color: #fff;
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24rpx;
    border: 2rpx solid #fff;
    box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
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
  margin-top: 10rpx;
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

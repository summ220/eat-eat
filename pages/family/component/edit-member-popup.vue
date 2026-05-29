<!-- 编辑家庭成员 -->
<template>
  <view class="modal-mask" v-if="show" @click="close">
    <view class="modal-content" @click.stop>
      <view class="avatar-box">
        <image class="avatar" :src="tempAvatarUrl ? (tempAvatarUrl.startsWith('http') ? tempAvatarUrl : config.imgBaseUrl + tempAvatarUrl) : config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbqsd7_0d13d785d123.jpg'" mode="aspectFill" @click.stop="preview(tempAvatarUrl || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbqsd7_0d13d785d123.jpg')"></image>
        <view class="camera-icon" @click.stop="chooseAvatar">📷</view>
      </view>
      <view class="input-box">
        <input class="join-input" v-model="tempNick" placeholder="请输入新昵称" />
      </view>
      <view class="input-box">
        <input class="join-input" v-model="tempTitle" placeholder="请输入新角色" />
      </view>
      <view class="modal-btns">
        <button class="m-btn-sub" @click="close">取消</button>
        <button class="m-btn-main" @click="confirmNick">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import familyApi from '@/common/api/family.js'
import recipeApi from '@/common/api/recipe.js'
import config from '@/common/config'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  familyCode: {
    type: String,
    default: ''
  },
  member: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'saved', 'preview'])

const tempAvatarUrl = ref('')
const tempNick = ref('')
const tempTitle = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    tempAvatarUrl.value = props.member.avatarUrl || ''
    tempNick.value = props.member.name || '干饭人'
    tempTitle.value = props.member.title || '大主厨'
  }
})

const close = () => {
  emit('close')
}

const preview = (url) => {
  emit('preview', url)
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
      emit('saved')
      close()
    } else {
      uni.showToast({ title: res.message || '更新失败,请稍后重试', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="less" scoped>
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

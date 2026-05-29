<!-- 编辑家庭 -->
<template>
  <view class="modal-mask" v-if="show" @click="close">
    <view class="modal-content" @click.stop>
      <view class="avatar-box">
        <image class="avatar" :src="tempAvatar ? (tempAvatar.startsWith('http') ? tempAvatar : config.imgBaseUrl + tempAvatar) : config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg'" mode="aspectFill" @click.stop="preview(tempAvatar || config.imgBaseUrl + '/uploads/recipe-covers/fam_74a1bdb4ebab2367/mpmbk9w0_fa7dd116dd69.jpg')" />
        <view class="camera-icon" @click.stop="changeAv">📷</view>
      </view>
      <view class="input-box">
        <input class="join-input" v-model="tempFamilyName" placeholder="请输入新名称" maxlength="15" />
      </view>
      <view class="modal-btns">
        <button class="m-btn-sub" @click="close">取消</button>
        <button class="m-btn-main" @click="saveFamilyName">保存</button>
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
  familyName: {
    type: String,
    default: ''
  },
  familyAvatar: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'saved', 'preview'])

const tempFamilyName = ref('')
const tempAvatar = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    tempFamilyName.value = props.familyName
    tempAvatar.value = props.familyAvatar
  }
})

const close = () => {
  emit('close')
}

const preview = (url) => {
  emit('preview', url)
}

const changeAv = () => {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...' })
      try {
        const fileManager = uni.getFileSystemManager()
        const base64 = fileManager.readFileSync(tempFilePath, 'base64')
        const imageData = 'data:image/jpeg;base64,' + base64
        
        const response = await recipeApi.uploadFamilyRecipeCover(props.familyCode || 'default_family', imageData)
        if (response && response.data && response.data.coverUrl) {
          tempAvatar.value = response.data.coverUrl
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

const saveFamilyName = async () => {
  const newName = tempFamilyName.value.trim()
  const avatar = tempAvatar.value
  if (!newName) {
    return uni.showToast({ title: '名称不能为空', icon: 'none' })
  }
  
  uni.showLoading({ title: '正在保存...', mask: true })
  try {
    const res = await familyApi.updateFamily(props.familyCode, newName, avatar)
    if (res && res.data) {
      uni.setStorageSync('family_name', res.data.familyName)
      uni.setStorageSync('family_avatar', res.data.avatarUrl)
      uni.showToast({ title: '修改成功', icon: 'success' })
      emit('saved', { familyName: res.data.familyName, avatarUrl: res.data.avatarUrl })
      close()
    } else {
      uni.showToast({
        title: res.message || '修改失败',
        icon: 'none'
      })
    }
  } catch (err) {
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
  margin-bottom: 30rpx;
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

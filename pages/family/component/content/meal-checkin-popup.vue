<template>
  <view class="bottom-modal-mask" v-if="show" @click="closePopup">
    <view class="meal-checkin-modal" @click.stop :style="themeStyle">
      <view class="mc-head">
        <text class="mc-title">📸 美食打卡 · {{ meal?.name }}</text>
        <view class="mc-close" @click="closePopup">✕</view>
      </view>
      
      <scroll-view scroll-y class="mc-scroll-body" :show-scrollbar="false">
        <!-- 1. 用餐来源 -->
        <view class="mc-group">
          <view class="mc-label">🍳 就餐来源</view>
          <view class="source-options">
            <view class="source-opt" :class="{ active: checkinData.source === '自己做' }" @click="checkinData.source = '自己做'">🍳 自己做</view>
            <view class="source-opt" :class="{ active: checkinData.source === '外卖' }" @click="checkinData.source = '外卖'">🛫 叫外卖</view>
            <view class="source-opt" :class="{ active: checkinData.source === '出去吃' }" @click="checkinData.source = '出去吃'">🏪 出去吃</view>
          </view>
        </view>
        
        <!-- 2. 今日心情美味度 -->
        <view class="mc-group">
          <view class="mc-label">😋 今日美味与心情</view>
          <view class="emoji-options">
            <view class="emoji-opt" v-for="e in ['😋', '🥰', '😐', '😪', '🥳']" :key="e" :class="{ active: checkinData.emoji === e }" @click="checkinData.emoji = e">
              {{ e }}
            </view>
          </view>
        </view>
        
        <!-- 3. 美食随手拍 -->
        <view class="mc-group">
          <view class="mc-label">📸 美食照片</view>
          <view class="photo-uploader" @click="chooseMealPhoto">
            <image class="uploaded-img" v-if="checkinData.photo" :src="getFullUrl(checkinData.photo)" mode="aspectFill" />
            <view class="upload-placeholder" v-else>
              <text class="plus-icon">+</text>
              <text class="text">上传美食照</text>
            </view>
          </view>
        </view>

        <!-- 4. 消费金额 (外卖/出去吃展示) -->
        <view class="mc-group" v-if="checkinData.source !== '自己做'">
          <view class="mc-label">💵 花费金额 (元)</view>
          <input class="mc-input" type="digit" v-model="checkinData.cost" placeholder="输入本次就餐花费金额" placeholder-style="color: #ccc;" />
          <view class="mc-checkbox-row" @click="checkinData.syncCost = !checkinData.syncCost">
            <checkbox :checked="checkinData.syncCost" color="#FF7DA8" style="transform:scale(0.75);" />
            <text class="checkbox-label">自动同步记录至记账本</text>
          </view>
        </view>

        <!-- 5. 饮食小标签 -->
        <view class="mc-group">
          <view class="mc-label">🏷️ 膳食标签</view>
          <view class="tag-pool">
            <view class="tag-chip" v-for="tag in ['健康少油', '低脂轻食', '高蛋白', '多吃蔬菜', '大鱼大肉', '甜食偏多', '碳水炸弹']" :key="tag" :class="{ active: checkinData.tags.includes(tag) }" @click="toggleCheckinTag(tag)">
              # {{ tag }}
            </view>
          </view>
        </view>

        <!-- 6. 碎碎念/日志 -->
        <view class="mc-group" style="margin-bottom: 200rpx;">
          <view class="mc-label">📝 备忘录 / 随手记 / 感受</view>
          <textarea class="mc-textarea" v-model="checkinData.notes" placeholder="记录一下今天就餐的心情或感受吧..." placeholder-style="color: #ccc;" />
        </view>

      </scroll-view>

      <view class="mc-footer">
        <button class="mc-confirm-btn" @click="submitCheckin">确认打卡 🌟</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import familyApi from '@/common/api/family.js'
import costApi from '@/common/api/cost.js'
import config from '@/common/config.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  meal: {
    type: Object,
    default: () => null
  },
  familyCode: {
    type: String,
    default: ''
  },
  themeStyle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:show', 'success'])

const checkinData = ref({
  source: '自己做',
  emoji: '😋',
  photo: '',
  cost: '',
  syncCost: true,
  tags: [],
  notes: ''
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.meal && props.meal.record) {
      const rec = props.meal.record
      checkinData.value = {
        source: rec.source || '自己做',
        emoji: rec.emoji || '😋',
        photo: rec.photo || '',
        cost: rec.cost !== undefined && rec.cost !== null ? String(rec.cost) : '',
        syncCost: rec.syncCost !== undefined ? rec.syncCost : true,
        tags: Array.isArray(rec.tags) ? [...rec.tags] : [],
        notes: rec.notes || ''
      }
    } else {
      checkinData.value = {
        source: '自己做',
        emoji: '😋',
        photo: '',
        cost: '',
        syncCost: true,
        tags: [],
        notes: ''
      }
    }
  }
})

const getFullUrl = (url) => {
  if (!url) return ''
  return url.startsWith('http') ? url : config.imgBaseUrl + url
}

const closePopup = () => {
  emit('update:show', false)
}

const toggleCheckinTag = (tag) => {
  const idx = checkinData.value.tags.indexOf(tag)
  if (idx === -1) {
    checkinData.value.tags.push(tag)
  } else {
    checkinData.value.tags.splice(idx, 1)
  }
}

const chooseMealPhoto = () => {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传美食照中...' })
      try {
        const fileManager = uni.getFileSystemManager()
        const base64 = fileManager.readFileSync(tempFilePath, 'base64')
        const imageData = 'data:image/jpeg;base64,' + base64
        
        // 替换为最新的专用接口
        const response = await familyApi.uploadMealPhoto(props.familyCode || 'default_family', imageData)
        if (response && response.data && response.data.photoUrl) {
          checkinData.value.photo = response.data.photoUrl
          uni.showToast({ title: '照片上传成功', icon: 'success' })
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

const submitCheckin = async () => {
  if (!props.meal) return
  
  uni.showLoading({ title: '打卡中...', mask: true })
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // 构造打卡明细
    const record = {
      source: checkinData.value.source,
      emoji: checkinData.value.emoji,
      photo: checkinData.value.photo,
      cost: checkinData.value.cost ? parseFloat(checkinData.value.cost) : null,
      tags: checkinData.value.tags,
      notes: checkinData.value.notes
    }
    
    // 1. 同步数据至云端
    if (props.familyCode) {
      try {
        // 使用云端用餐计划打卡专用接口
        await familyApi.getFamilyMealPlanStatus(props.familyCode, today, props.meal.name, 1, record)
      } catch (err) {
        console.error('同步打卡明细至云端出错', err)
      }
    }
    
    // 2. 本地缓存三餐打卡明细，用于历史饮食日记直接读取
    uni.setStorageSync(`meal_record_cache_${today}_${props.meal.name}`, record)
    
    // 3. 如果是非自己做，且勾选了自动同步消费记录，同步添加记账
    if (checkinData.value.source !== '自己做' && checkinData.value.cost && checkinData.value.syncCost) {
      try {
        const consumptionRecordJson = {
          name: `${props.meal.name}就餐: ${props.meal.recipes.join(' · ') || '便餐'}`,
          price: parseFloat(checkinData.value.cost),
          categoryId: '',
          date: today
        }
        await costApi.saveFamilyConsumptionRecord(props.familyCode || 'default_family', JSON.stringify(consumptionRecordJson))
      } catch (err) {
        console.error('同步记账失败', err)
      }
    }
    
    uni.showToast({ title: '打卡成功', icon: 'success' })
    emit('success', record)
    closePopup()
  } catch (err) {
    uni.showToast({ title: '打卡失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="less" scoped>
.bottom-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.meal-checkin-modal {
  background: #fff;
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  padding-bottom: env(safe-area-inset-bottom);
  position: relative;
}

.mc-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 40rpx 30rpx;
  flex-shrink: 0;
  border-bottom: 2rpx dashed #EDF2F7;
  
  .mc-title { font-size: 32rpx; font-weight: 900; color: #2D3748; }
  .mc-close { font-size: 32rpx; color: #95A5A6; padding: 10rpx; }
}

.mc-scroll-body {
  flex: 1;
  height: 0;
  padding: 30rpx 40rpx;
  box-sizing: border-box;
}

.mc-group {
  margin-bottom: 40rpx;
  
  .mc-label {
    font-size: 26rpx;
    font-weight: 800;
    color: #4A5568;
    margin-bottom: 20rpx;
  }
}

.source-options {
  display: flex;
  gap: 20rpx;
}
.source-opt {
  flex: 1;
  height: 80rpx;
  background: #F7FAFC;
  border-radius: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 26rpx;
  color: #718096;
  font-weight: 600;
  transition: all 0.2s;
  border: 2rpx solid transparent;
  
  &.active {
    background: var(--primary-light);
    color: var(--primary);
    border-color: var(--primary);
    transform: scale(0.98);
  }
}

.emoji-options {
  display: flex;
  justify-content: space-around;
  background: #F7FAFC;
  padding: 16rpx 20rpx;
  border-radius: 24rpx;
}
.emoji-opt {
  font-size: 50rpx;
  transition: all 0.2s;
  padding: 10rpx;
  
  &.active {
    transform: scale(1.3);
    filter: drop-shadow(0 4rpx 10rpx var(--primary-shadow));
  }
}

.photo-uploader {
  width: 100%;
  height: 320rpx;
  background: #F7FAFC;
  border-radius: 28rpx;
  border: 4rpx dashed #E2E8F0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  
  .uploaded-img {
    width: 100%;
    height: 100%;
  }
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    
    .plus-icon { font-size: 50rpx; color: #A0AEC0; }
    .text { font-size: 24rpx; color: #718096; font-weight: 600; }
  }
}

.mc-input {
  background: #F7FAFC;
  height: 90rpx;
  border-radius: 20rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #2C3E50;
  font-weight: bold;
}
.mc-checkbox-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 16rpx;
  
  .checkbox-label {
    font-size: 22rpx;
    color: #718096;
    font-weight: 600;
  }
}

.tag-pool {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.tag-chip {
  background: #F7FAFC;
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  color: #718096;
  font-weight: 600;
  transition: all 0.2s;
  
  &.active {
    background: var(--primary-light);
    color: var(--primary);
    transform: scale(0.96);
  }
}

.mc-textarea {
  background: #F7FAFC;
  width: 100%;
  height: 160rpx;
  border-radius: 20rpx;
  padding: 24rpx;
  box-sizing: border-box;
  font-size: 26rpx;
  color: #2D3748;
}

.mc-footer {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, #fff 80%, rgba(255,255,255,0) 100%);
  padding: 30rpx 40rpx calc(30rpx + env(safe-area-inset-bottom));
  flex-shrink: 0;
  z-index: 100;
  
  .mc-confirm-btn {
    background: var(--primary-grad);
    color: #fff;
    height: 96rpx;
    border-radius: 100rpx;
    display: flex; align-items: center; justify-content: center;
    font-size: 30rpx; font-weight: 800;
    box-shadow: 0 12rpx 32rpx var(--primary-shadow);
    border: none;
    &::after { border: none; }
  }
}
</style>

<template>
  <custom-header :title="memoType === 'personal' ? '随手记' : '备忘录'" icon="📝" back />
  <view class="page" :style="themeStyle">
    <view class="content edit-view">
      <!-- 极简治愈系富文本工具栏（支持横向滑动，手感极佳） -->
      <scroll-view class="editor-toolbar" scroll-x show-scrollbar="false">
        <view class="toolbar-item" @click="undo">
          <text class="toolbar-text">↩️</text>
        </view>
        <view class="toolbar-item" @click="redo">
          <text class="toolbar-text">↪️</text>
        </view>
        <view class="toolbar-divider"></view>
        
        <view class="toolbar-item" @click="format('bold')">
          <text class="toolbar-text bold">B</text>
        </view>
        <view class="toolbar-item" @click="format('italic')">
          <text class="toolbar-text italic">I</text>
        </view>
        <view class="toolbar-item" @click="format('underline')">
          <text class="toolbar-text underline">U</text>
        </view>
        <view class="toolbar-item" @click="format('strike')">
          <text class="toolbar-text strike">S</text>
        </view>
        <view class="toolbar-item" @click="format('header', 'h2')">
          <text class="toolbar-text bold">H</text>
        </view>
        <view class="toolbar-divider"></view>

        <view class="toolbar-item" @click="format('list', 'check')">
          <text class="toolbar-text">☑️</text>
        </view>
        <view class="toolbar-item" @click="format('list', 'bullet')">
          <text class="toolbar-text">•</text>
        </view>
        <view class="toolbar-item" @click="format('list', 'ordered')">
          <text class="toolbar-text">1.</text>
        </view>
        <view class="toolbar-divider"></view>

        <view class="toolbar-item" @click="format('align', 'left')">
          <text class="toolbar-text">左</text>
        </view>
        <view class="toolbar-item" @click="format('align', 'center')">
          <text class="toolbar-text">中</text>
        </view>
        <view class="toolbar-item" @click="format('align', 'right')">
          <text class="toolbar-text">右</text>
        </view>
        <view class="toolbar-divider"></view>

        <view class="toolbar-item" @click="insertImage">
          <text class="toolbar-text">🖼️</text>
        </view>
        <view class="toolbar-item" @click="format('removeFormat')">
          <text class="toolbar-text font-clear">🧹</text>
        </view>
      </scroll-view>
      
      <view class="editor-wrapper">
        <editor 
          id="editor" 
          class="ql-container" 
          placeholder="在这记录点什么吧，支持富文本排版..." 
          @ready="onEditorReady">
        </editor>
      </view>
    </view>

    <!-- 底部固定的动作按钮组 -->
    <view class="footer-actions">
      <view class="edit-btns">
        <button class="cancel-btn" @click="handleCancel">取消</button>
        <button class="confirm-btn" @click="saveMemo">保存备忘</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import familyApi from '@/common/api/family.js'
import recipeApi from '@/common/api/recipe.js'
import config from '@/common/config'

const familyCode = uni.getStorageSync('family_code')

// 主题支持
const themes = [
  { color: '#FF6B8B', gradient: 'linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%)', light: '#FFE8EE', shadow: 'rgba(255,90,121,0.3)' },
  { color: '#4DB88F', gradient: 'linear-gradient(135deg, #68CBA6 0%, #45A57F 100%)', light: '#E6F7F0', shadow: 'rgba(77,184,143,0.3)' },
  { color: '#5B89E5', gradient: 'linear-gradient(135deg, #7AA3ED 0%, #4A78D6 100%)', light: '#E8F0FE', shadow: 'rgba(91,137,229,0.3)' },
  { color: '#F2A13B', gradient: 'linear-gradient(135deg, #F5B96B 0%, #ED9121 100%)', light: '#FEF4E8', shadow: 'rgba(242,161,59,0.3)' }
]
const currentTheme = ref(0)
const themeStyle = computed(() => {
  const t = themes[currentTheme.value] || themes[0]
  return `
    --primary: ${t.color};
    --primary-grad: ${t.gradient};
    --primary-light: ${t.light};
    --primary-shadow: ${t.shadow};
  `
})

const memos = ref([])
const memoId = ref('')
const currentMemo = ref({ id: '', content: '' })
const memoType = ref('family')

let editorCtx = null

onLoad(async (options) => {
  currentTheme.value = Number(uni.getStorageSync('current_theme') || 0)
  memos.value = uni.getStorageSync('family_memos') || []
  
  if (options.type) {
    memoType.value = options.type
  }
  
  if (options.id) {
    memoId.value = options.id
    const res = memoType.value === 'personal'
      ? await familyApi.getPersonalNote(options.id)
      : await familyApi.getFamilyMemo(familyCode, options.id)
    if (res && res.data) {
      currentMemo.value = (memoType.value === 'personal' ? res.data.note : res.data.memo) || {}
      console.log('详情接口已返回:', currentMemo.value)
      
      // 【双向竞态兼容】若编辑器比接口先 Ready，在此直接装载内容！
      if (editorCtx && currentMemo.value.content) {
        editorCtx.setContents({
          html: currentMemo.value.content
        })
      }
    }
  }
  
  // 动态设置微信原生顶部导航栏的标题
  uni.setNavigationBarTitle({
    title: memoType.value === 'personal'
      ? (memoId.value ? '编辑随手记' : '新增随手记')
      : (memoId.value ? '编辑备忘录' : '新增备忘录')
  })
})

// 绑定富文本编辑器初始化
const onEditorReady = () => {
  uni.createSelectorQuery().select('#editor').context((res) => {
    editorCtx = res.context
    console.log('编辑器已就绪。当前数据状态:', currentMemo.value)
    
    // 【双向竞态兼容】若接口比编辑器先 Ready，在此直接装载内容！
    if (currentMemo.value.content && editorCtx) {
      editorCtx.setContents({
        html: currentMemo.value.content
      })
    }
  }).exec()
}

// 富文本格式化接口
const format = (name, value) => {
  if (editorCtx) {
    editorCtx.format(name, value)
  }
}

const undo = () => {
  if (editorCtx) {
    editorCtx.undo()
  }
}

const redo = () => {
  if (editorCtx) {
    editorCtx.redo()
  }
}

const insertImage = () => {
  if (!editorCtx) return
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...', mask: true })
      try {
        const fileManager = uni.getFileSystemManager()
        const base64 = fileManager.readFileSync(tempFilePath, 'base64')
        const imageData = 'data:image/jpeg;base64,' + base64
        
        const response = await recipeApi.uploadFamilyRecipeCover(familyCode || 'default_family', imageData)
        if (response && response.data && response.data.coverUrl) {
          const rawUrl = response.data.coverUrl
          // 智能拼接为绝对网络图片路径，防小程序端因相对域名路径渲染白图
          const fullUrl = rawUrl.startsWith('http') ? rawUrl : config.imgBaseUrl + rawUrl
          
          editorCtx.insertImage({
            src: fullUrl,
            alt: '图片',
            width: '100%'
          })
          uni.showToast({ title: '上传成功', icon: 'success' })
        } else {
          uni.showToast({ title: '上传失败', icon: 'none' })
        }
      } catch (e) {
        console.error('上传图片失败:', e)
        uni.showToast({ title: '上传失败，请重试', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

const handleCancel = () => {
  uni.navigateBack()
}

const saveMemo = () => {
  if (!editorCtx) return
  
  editorCtx.getContents({
    success: async (res) => {
      const htmlContent = res.html
      const textContent = res.text.trim()
      
      if (!textContent || htmlContent === '<p><br></p>') {
        return uni.showToast({ title: '内容不能为空', icon: 'none' })
      }
      
      uni.showLoading({ title: '正在保存...', mask: true })
      
      try {
        if (memoId.value) {
          // 编辑更新
          const memoJson = {
            id: memoId.value,
            content: htmlContent
          }
          if (memoType.value === 'personal') {
            await familyApi.updatePersonalNote(memoJson)
          } else {
            await familyApi.updateFamilyMemo(familyCode, memoJson)
          }
        } else {
          // 新建保存
          const memoJson = {
            content: htmlContent
          }
          if (memoType.value === 'personal') {
            await familyApi.savePersonalNote(memoJson)
          } else {
            await familyApi.saveFamilyMemo(familyCode, memoJson)
          }
        }
        
        // 广播全局刷新事件，通知列表页强力刷新接口
        uni.$emit('refreshMemos')
        
        uni.showToast({
          title: '保存成功',
          icon: 'success',
          success: () => {
            setTimeout(() => {
              uni.navigateBack()
            }, 800)
          }
        })
      } catch (err) {
        console.error('保存备忘录失败:', err)
        uni.showToast({ title: '保存失败，请重试', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    fail: () => {
      uni.showToast({ title: '内容获取失败，请重试', icon: 'none' })
    }
  })
}
</script>

<style lang="less" scoped>
.page {
  background: #FAFAFA;
  min-height: 89vh;
  background-image: linear-gradient(180deg, var(--primary-light) 0%, #FAFAFA 400rpx);
}

.content {
  padding: 30rpx 40rpx;
  
  &.edit-view {
    display: flex;
    flex-direction: column;
    gap: 28rpx;
  }
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

/* 高级富文本专属样式区 */
.editor-wrapper {
  background: #ffffff;
  border-radius: 36rpx;
  padding: 40rpx 36rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.02);
  border: 2rpx solid var(--primary-light);
  box-sizing: border-box;
}

.ql-container {
  width: 100%;
  height:calc(60vh);
  font-size: 30rpx;
  color: #2C3E50;
  line-height: 1.6;
}

.editor-toolbar {
  white-space: nowrap;
  width: 100%;
  background: #ffffff;
  border-radius: 100rpx;
  padding: 16rpx 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03);
  border: 2rpx solid var(--primary-light);
  box-sizing: border-box;
  
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

.toolbar-item {
  display: inline-flex;
  vertical-align: middle;
  width: 70rpx;
  height: 70rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
  cursor: pointer;

  &:active {
    background: var(--primary-light);
  }
}

.toolbar-text {
  font-size: 28rpx;
  color: #555555;
  font-weight: 500;
  
  &.bold {
    font-weight: bold;
    color: #2c3e50;
  }
  
  &.italic {
    font-style: italic;
    font-family: serif;
  }
  
  &.underline {
    text-decoration: underline;
  }
  
  &.strike {
    text-decoration: line-through;
  }
  
  &.font-clear {
    font-size: 32rpx;
  }
}

.toolbar-divider {
  display: inline-block;
  vertical-align: middle;
  width: 2rpx;
  height: 36rpx;
  background: #f0f0f0;
  margin: 0 10rpx;
}

.edit-btns {
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

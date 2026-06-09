<!-- 使用帮助指南弹窗（五大Tab操作手册） -->
<template>
  <view class="modal-mask" v-if="show" @click="close">
    <view class="modal-content help-modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">📖 Eat-Eat 全攻略指南</text>
        <text class="modal-subtitle">从今天起，和家人一起记录有温度的餐桌时光</text>
      </view>
      
      <!-- 横向导航目录，点击快速锚定/定位 -->
      <scroll-view scroll-x class="tab-nav-bar" :show-scrollbar="false">
        <view 
          v-for="(tab, index) in tabGuides" 
          :key="index"
          class="nav-item"
          :class="{ active: currentActiveTab === index }"
          @click="scrollToTab(index)"
        >
          <text class="nav-icon">{{ tab.icon }}</text>
          <text class="nav-text">{{ tab.title }}</text>
        </view>
      </scroll-view>

      <scroll-view 
        scroll-y 
        class="help-scroll-view" 
        :show-scrollbar="false"
        :scroll-into-view="'sec-' + currentActiveTab"
        scroll-with-animation
      >
        <view 
          v-for="(tab, index) in tabGuides" 
          :key="index"
          :id="'sec-' + index"
          class="help-section"
          :style="{ borderLeftColor: tab.color }"
        >
          <view class="sec-title" :style="{ backgroundColor: tab.bgColor }">
            <text class="sec-icon">{{ tab.icon }}</text>
            <text class="sec-name" :style="{ color: tab.color }">Tab {{ index + 1 }} : {{ tab.fullName }}</text>
          </view>
          
          <view class="sec-content">
            <view class="content-item" v-for="(tip, tIndex) in tab.tips" :key="tIndex">
              <text class="dot" :style="{ color: tab.color }">✦</text>
              <view class="item-body">
                <text class="item-title">{{ tip.title }}</text>
                <text class="item-desc">{{ tip.desc }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <button class="close-help-btn" @click="close">开启美食之旅</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const currentActiveTab = ref(0)

const tabGuides = ref([
  {
    title: '吃什么',
    fullName: '吃什么 (首页灵感)',
    icon: '🍳',
    color: '#FF6B8B',
    bgColor: '#FFF0F2',
    tips: [
      {
        title: '纠结吃什么？摇号抽菜',
        desc: '点击中央的“随机抽菜”或分类抽菜，系统会从您的家庭菜谱池或预设灵感中进行滚动挑选，治疗选择困难症。'
      },
      {
        title: '温馨小管家与天气',
        desc: '顶部疗愈卡片整合了当前天气、气温以及黄历宜忌（例如：宜煲汤、忌大鱼大肉），让每一天的开炉都充满生活的仪式感。'
      }
    ]
  },
  {
    title: '库存',
    fullName: '食材库存 (科学管理)',
    icon: '🥦',
    color: '#4DB88F',
    bgColor: '#EEF9F5',
    tips: [
      {
        title: '保质期智能预警',
        desc: '录入食材时设置生产日期与保质期，食材卡片会通过绿（安全）、黄（临期）、红（已过期）智能标识，防止食材浪费。'
      },
      {
        title: '动态库存分区',
        desc: '支持冷冻、冷藏、常温分区，您可以一键修改剩余数量或直接标记为“已消耗”，维持食材账目的一致。'
      }
    ]
  },
  {
    title: '菜谱',
    fullName: '菜谱 (做菜灵感)',
    icon: '📖',
    color: '#5B89E5',
    bgColor: '#EEF3FD',
    tips: [
      {
        title: '做菜一键扣减库存',
        desc: '在心仪的菜谱详情页中点击“我做这道菜”，系统会自动对比当前食材库。制作完成后，会自动扣减关联食材的剩余库存。'
      },
      {
        title: '共建家庭私房菜谱',
        desc: '点击新增菜谱，可详细输入烹饪步骤、主料辅料及调料，全家成员均可实时共享查看，代代传承。'
      }
    ]
  },
  {
    title: '清单',
    fullName: '购物清单 (智能记账)',
    icon: '🛒',
    color: '#F2A13B',
    bgColor: '#FFF7ED',
    tips: [
      {
        title: '缺料自动加入清单',
        desc: '在食材库存不足或制作菜谱短缺时，可点击一键生成采购清单。去菜场买菜时可边买边勾选。'
      },
      {
        title: '记账同步到花费',
        desc: '买完勾选时会触发输入实际消费的弹窗，勾选“同步到花费”并输入价格后，该笔支出会自动入账到家庭月度消费明细。'
      }
    ]
  },
  {
    title: '家庭',
    fullName: '家庭 (协作与安全)',
    icon: '🏡',
    color: '#9B5DE5',
    bgColor: '#F6F0FE',
    tips: [
      {
        title: '双重密保与找回 (重要)',
        desc: '在家庭设置中可复制您的“家庭编码”，并强烈建议设置密保问题。误删小程序或换手机时，可在欢迎页一键100%找回共有数据。'
      },
      {
        title: '家人协作共享',
        desc: '复制邀请码发送给家人，加入后即可实现多人多端数据实时互通，爸爸买菜、妈妈做菜，数据秒级同步。'
      },
      {
        title: '三餐打卡与饮食手账',
        desc: '制定家庭三餐计划，餐后打卡撰写饮食手账（支持心形打分、吃货心情与拍照上传），留下全家餐桌的温馨记忆。'
      }
    ]
  }
])

const scrollToTab = (index) => {
  currentActiveTab.value = index
}

const close = () => {
  emit('close')
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

.help-modal {
  width: 660rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  animation: modalScaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  .modal-header {
    margin-bottom: 24rpx;
    padding: 0 10rpx;
    display: flex;
    flex-direction: column;
    
    .modal-title {
      font-size: 34rpx;
      font-weight: 800;
      color: #2C3E50;
      margin-bottom: 8rpx;
    }
    
    .modal-subtitle {
      font-size: 24rpx;
      color: #95A5A6;
    }
  }
}

.tab-nav-bar {
  white-space: nowrap;
  width: 100%;
  margin-bottom: 24rpx;
  padding: 0 10rpx;
  box-sizing: border-box;
  
  .nav-item {
    display: inline-flex;
    align-items: center;
    gap: 6rpx;
    padding: 12rpx 24rpx;
    background: #F5F6F7;
    border-radius: 30rpx;
    margin-right: 16rpx;
    transition: all 0.2s ease;
    
    .nav-icon {
      font-size: 26rpx;
    }
    
    .nav-text {
      font-size: 24rpx;
      color: #7F8C8D;
      font-weight: bold;
    }
    
    &.active {
      background: #34495E;
      
      .nav-text {
        color: #fff;
      }
    }
  }
}

.help-scroll-view {
  max-height: 700rpx;
  margin-bottom: 30rpx;
  padding: 0 10rpx;
  box-sizing: border-box;
}

.help-section {
  background: #FFFFFF;
  border-radius: 28rpx;
  border: 2rpx solid #EFEFEF;
  border-left-width: 8rpx;
  margin-bottom: 30rpx;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.01);
  
  .sec-title {
    padding: 16rpx 24rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    
    .sec-icon {
      font-size: 30rpx;
    }
    
    .sec-name {
      font-size: 26rpx;
      font-weight: 800;
    }
  }
  
  .sec-content {
    padding: 20rpx 24rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    
    .content-item {
      display: flex;
      align-items: flex-start;
      gap: 12rpx;
      
      .dot {
        font-size: 20rpx;
        margin-top: 6rpx;
      }
      
      .item-body {
        flex: 1;
        
        .item-title {
          font-size: 26rpx;
          font-weight: 700;
          color: #2C3E50;
          display: block;
          margin-bottom: 4rpx;
        }
        
        .item-desc {
          font-size: 23rpx;
          color: #7F8C8D;
          line-height: 1.5;
        }
      }
    }
  }
}

.close-help-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: linear-gradient(135deg, #FF7DA8 0%, #FF5A79 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 100rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 90, 121, 0.25);
  border: none;
  &::after { border: none; }
}

@keyframes modalScaleIn {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>

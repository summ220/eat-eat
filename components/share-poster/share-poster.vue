<template>
  <view class="share-canvas-container">
    <canvas 
      canvas-id="shareCanvas" 
      style="width: 600px; height: 800px; position: fixed; left: -9999px;"
    ></canvas>
  </view>
</template>

<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()

const props = defineProps({
  themeColor: {
    type: String,
    default: '#FF6B8B'
  },
  result: {
    type: String,
    default: ''
  },
  sceneIcon: {
    type: String,
    default: '🍳'
  },
  sceneLabel: {
    type: String,
    default: '自己做'
  },
  phrase: {
    type: String,
    default: ''
  },
  dateStr: {
    type: String,
    default: ''
  }
})

// 辅助绘制圆角矩形
const drawRoundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// 绘制海报图
const draw = (posterStyle = 0) => {
  return new Promise((resolve) => {
    const ctx = uni.createCanvasContext('shareCanvas', instance)
    const color = props.themeColor
    
    if (posterStyle === 1) {
      // 样式二：拍立得文艺手绘风
      // 1. 绘制米黄色复古背景
      ctx.setFillStyle('#FAF8F5')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 绘制四周精致的手绘虚线边框
      ctx.setStrokeStyle('#D4CFC9')
      ctx.setLineWidth(2)
      ctx.setLineDash([8, 8])
      drawRoundRect(ctx, 24, 24, 552, 752, 28)
      ctx.stroke()
      ctx.setLineDash([]) // 恢复实线

      // 3. 绘制顶部半透明胶带纸效果
      ctx.setFillStyle('rgba(212, 207, 201, 0.35)')
      ctx.beginPath()
      ctx.moveTo(270, 36)
      ctx.lineTo(330, 44)
      ctx.lineTo(325, 68)
      ctx.lineTo(265, 60)
      ctx.closePath()
      ctx.fill()

      // 4. 绘制日期与来源场景
      ctx.setFontSize(16)
      ctx.setFillStyle('#8C8882')
      ctx.setTextAlign('center')
      ctx.fillText(props.dateStr, 300, 100)

      ctx.setFontSize(13)
      ctx.setFillStyle('#B0AAA0')
      ctx.fillText(`✦ ${props.sceneIcon} ${props.sceneLabel} ✦`, 300, 130)

      // 5. 绘制中部白色网格信纸卡片区
      ctx.setFillStyle('#ffffff')
      ctx.shadowColor = 'rgba(140, 136, 130, 0.08)'
      ctx.shadowBlur = 24
      ctx.shadowOffsetY = 8
      drawRoundRect(ctx, 60, 165, 480, 290, 24)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // 5.1 绘制信纸内部浅色横线 (横格信纸风)
      ctx.setStrokeStyle('#F3EFE9')
      ctx.setLineWidth(1.5)
      for (let yLine = 220; yLine <= 410; yLine += 48) {
        ctx.beginPath()
        ctx.moveTo(90, yLine)
        ctx.lineTo(510, yLine)
        ctx.stroke()
      }

      // 5.2 绘制深炭色菜名大字
      ctx.setFontSize(50)
      ctx.setFillStyle('#3E3A35')
      ctx.setTextAlign('center')
      ctx.fillText(props.result, 300, 275)

      // 5.3 绘制手绘装饰划线 (使用当前主题颜色作为高亮呼应)
      ctx.setStrokeStyle(color)
      ctx.setLineWidth(4)
      ctx.beginPath()
      ctx.moveTo(220, 305)
      ctx.lineTo(380, 305)
      ctx.stroke()

      // 5.4 绘制信纸下半部分的治愈推荐语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#7A756E')
      ctx.setTextAlign('center')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 370)
        ctx.fillText(line2, 300, 405)
      } else {
        ctx.fillText(phrase, 300, 385)
      }

      // 6. 底部手绘文艺区域
      ctx.setTextAlign('left')
      ctx.setFontSize(22)
      ctx.setFillStyle('#3E3A35')
      ctx.fillText('오늘 뭐 먹지?', 70, 642) // 韩文“今天吃什么”

      ctx.setFontSize(26)
      ctx.fillText('🍴', 215, 642)

      ctx.setFontSize(14)
      ctx.setFillStyle('#8C8882')
      ctx.fillText('✨ 治愈生活，从认真对待每一餐开始', 70, 685)
      ctx.fillText('—— 微信小程序 · EatEat', 70, 715)

      // 6.1 绘制右下角太阳码 (带手绘感蕾丝边框)
      ctx.setStrokeStyle('#D4CFC9')
      ctx.setLineWidth(1.5)
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(470, 670, 70, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.setLineDash([])

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 410, 610, 120, 120)
    } else if (posterStyle === 2) {
      // 样式三：可爱卡通手绘风
      // 1. 绘制淡粉橘背景
      ctx.setFillStyle('#FFF0EB')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 绘制白色波浪内卡片框
      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 30, 30, 540, 740, 40)
      ctx.fill()

      // 3. 绘制左上角可爱荷包蛋小插画
      ctx.setFillStyle('#FFDE7D')
      ctx.beginPath()
      ctx.arc(80, 80, 24, 0, 2 * Math.PI)
      ctx.fill()
      ctx.setFillStyle('#ffffff')
      ctx.beginPath()
      ctx.arc(75, 75, 12, 0, 2 * Math.PI)
      ctx.fill()
      ctx.setFillStyle('#FFA45C')
      ctx.beginPath()
      ctx.arc(83, 83, 10, 0, 2 * Math.PI)
      ctx.fill() // 蛋黄

      // 3.1 右上角画一个小红心
      ctx.setFontSize(28)
      ctx.fillText('💖', 510, 90)

      // 4. 日期标签
      ctx.setFontSize(15)
      ctx.setFillStyle('#FF8A8A')
      ctx.setTextAlign('center')
      ctx.fillText(`🐾 ${props.dateStr} 🐾`, 300, 140)

      // 5. 绘制可爱的对话气泡框，里面包裹菜品名
      ctx.setFillStyle('#FFF5F2')
      ctx.setStrokeStyle(color || '#FF6B8B')
      ctx.setLineWidth(4)
      drawRoundRect(ctx, 80, 180, 440, 130, 35)
      ctx.fill()
      ctx.stroke()

      // 5.1 绘制气泡小尾巴
      ctx.setFillStyle('#FFF5F2')
      ctx.beginPath()
      ctx.moveTo(280, 310)
      ctx.lineTo(300, 335)
      ctx.lineTo(320, 310)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(280, 310)
      ctx.lineTo(300, 335)
      ctx.lineTo(320, 310)
      ctx.stroke()

      // 5.2 绘制深咖啡色菜名大字 (配可爱腮红)
      ctx.setFontSize(46)
      ctx.setFillStyle('#5C3D2E')
      ctx.setTextAlign('center')
      ctx.fillText(props.result, 300, 262)

      // 5.3 左右腮红
      ctx.setFillStyle('rgba(255, 138, 138, 0.25)')
      ctx.beginPath()
      ctx.arc(150, 245, 15, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(450, 245, 15, 0, 2 * Math.PI)
      ctx.fill()

      // 6. 绘制卡通语录
      ctx.setFontSize(22)
      ctx.setFillStyle('#865439')
      ctx.setTextAlign('center')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 395)
        ctx.fillText(line2, 300, 435)
      } else {
        ctx.fillText(phrase, 300, 410)
      }

      // 7. 手绘简笔画小徽标点缀
      ctx.setFontSize(40)
      ctx.fillText('🍭', 120, 520)
      ctx.fillText('🍩', 480, 520)

      // 8. 底部餐桌布条纹圆角框
      ctx.setFillStyle('#FFF0EB')
      drawRoundRect(ctx, 50, 585, 500, 155, 24)
      ctx.fill()

      ctx.setTextAlign('left')
      ctx.setFontSize(18)
      ctx.setFillStyle('#5C3D2E')
      ctx.fillText('“一口吃掉今日小确幸 😋”', 80, 645)

      ctx.setFontSize(13)
      ctx.setFillStyle('#A88B7E')
      ctx.fillText('✨ 扫码发现更多美味推荐 · EatEat', 80, 692)

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 410, 600, 120, 120)
    } else if (posterStyle === 3) {
      // 1. 绘制深黑曜石渐变背景 (改用线性渐变以确保各端小程序的高兼容性)
      const blackGrad = ctx.createLinearGradient(0, 0, 0, 800)
      blackGrad.addColorStop(0, '#2A2D35')
      blackGrad.addColorStop(0.5, '#1A1C20')
      blackGrad.addColorStop(1, '#111215')
      ctx.setFillStyle(blackGrad)
      ctx.fillRect(0, 0, 600, 800)

      // 2. 绘制金色发光渐变边框
      const goldGrad = ctx.createLinearGradient(0, 0, 600, 800)
      goldGrad.addColorStop(0, '#FFEAA7')
      goldGrad.addColorStop(0.5, '#D4AF37')
      goldGrad.addColorStop(1, '#AA7C11')
      
      ctx.setStrokeStyle(goldGrad)
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 24, 24, 552, 752, 28)
      ctx.stroke()

      // 3. 顶部艺术字
      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.4)')
      ctx.setTextAlign('center')
      ctx.fillText('—  M I D N I G H T   D I N E R  —', 300, 85)

      ctx.setFontSize(15)
      ctx.setFillStyle('#E8C373')
      ctx.fillText(`✦ ${props.sceneLabel} 推荐 ✦`, 300, 120)

      // 4. 绘制聚光灯照亮框 (深灰色卡片)
      ctx.setFillStyle('rgba(255, 255, 255, 0.03)')
      ctx.setStrokeStyle('rgba(212, 175, 55, 0.15)')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 60, 170, 480, 270, 20)
      ctx.fill()
      ctx.stroke()

      // 5. 绘制超大金色菜品名大字 (配霓虹发光阴影)
      ctx.setFontSize(60)
      ctx.setFillStyle('#E8C373')
      ctx.setTextAlign('center')
      ctx.shadowColor = 'rgba(212, 175, 55, 0.5)'
      ctx.shadowBlur = 18
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.fillText(props.result, 300, 280)
      ctx.shadowColor = 'transparent' // 恢复
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // 5.1 菜名下的金色修饰线
      ctx.setStrokeStyle('#E8C373')
      ctx.setLineWidth(2)
      ctx.beginPath()
      ctx.moveTo(200, 320)
      ctx.lineTo(400, 320)
      ctx.stroke()

      // 6. 治愈语录
      ctx.setFontSize(18)
      ctx.setFillStyle('rgba(255, 255, 255, 0.85)')
      ctx.setTextAlign('center')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 370)
        ctx.fillText(line2, 300, 405)
      } else {
        ctx.fillText(phrase, 300, 385)
      }

      // 7. 日期
      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.3)')
      ctx.fillText(`DATE: ${props.dateStr}`, 300, 500)

      // 8. 底部黑金高级太阳码区域
      ctx.setFillStyle('rgba(0, 0, 0, 0.35)')
      ctx.setStrokeStyle('rgba(212, 175, 55, 0.25)')
      ctx.setLineWidth(1)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#E8C373')
      ctx.fillText('“孤独的人，总能在这里被美食治愈”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.45)')
      ctx.fillText('✨ 扫上方二维码 · 开启治愈避风港', 70, 705)

      // 右下角太阳码 (黑白安全盒保护)
      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 410, 615, 120, 120, 16)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 415, 620, 110, 110)
    } else if (posterStyle === 4) {
      // 样式五：温馨手账风
      // 1. 绘制暖洋洋燕麦色背景
      ctx.setFillStyle('#F5EBE6')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 四周花边白框
      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 30, 30, 540, 740, 32)
      ctx.fill()

      // 3. 绘制可爱窥视猫咪线稿
      // 头部
      ctx.setFillStyle('#F5D7A1')
      ctx.beginPath()
      ctx.arc(100, 160, 25, 0, 2 * Math.PI)
      ctx.fill()
      // 耳朵 1
      ctx.beginPath()
      ctx.moveTo(80, 145)
      ctx.lineTo(85, 125)
      ctx.lineTo(100, 140)
      ctx.closePath()
      ctx.fill()
      // 耳朵 2
      ctx.beginPath()
      ctx.moveTo(100, 140)
      ctx.lineTo(115, 125)
      ctx.lineTo(120, 145)
      ctx.closePath()
      ctx.fill()
      // 闭眼笑
      ctx.setStrokeStyle('#865439')
      ctx.setLineWidth(2.5)
      ctx.beginPath()
      ctx.arc(90, 158, 3, Math.PI, 0)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(110, 158, 3, Math.PI, 0)
      ctx.stroke()
      // 两撇胡子
      ctx.beginPath()
      ctx.moveTo(65, 160)
      ctx.lineTo(50, 157)
      ctx.moveTo(65, 165)
      ctx.lineTo(50, 168)
      ctx.moveTo(135, 160)
      ctx.lineTo(150, 157)
      ctx.moveTo(135, 165)
      ctx.lineTo(150, 168)
      ctx.stroke()

      // 4. 右上角绘制一个小云朵
      ctx.setFontSize(36)
      ctx.fillText('☁️', 480, 110)

      // 5. 日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#865439')
      ctx.setTextAlign('center')
      ctx.fillText(`✎ 今日食记 · ${props.dateStr}`, 300, 125)

      // 6. 中部撕纸贴纸区域 (白底，带咖啡色虚线边框)
      ctx.setFillStyle('#FCFAF7')
      ctx.setStrokeStyle('#C4B4A9')
      ctx.setLineWidth(2)
      ctx.setLineDash([6, 4])
      drawRoundRect(ctx, 70, 180, 460, 280, 24)
      ctx.fill()
      ctx.stroke()
      ctx.setLineDash([]) // 恢复

      // 6.1 菜名
      ctx.setFontSize(48)
      ctx.setFillStyle('#5C3D2E')
      ctx.setTextAlign('center')
      ctx.fillText(props.result, 300, 275)

      // 6.2 星星装饰与虚线划线
      ctx.setStrokeStyle('#865439')
      ctx.setLineWidth(1.5)
      ctx.beginPath()
      ctx.moveTo(150, 315)
      ctx.lineTo(450, 315)
      ctx.stroke()

      ctx.setFontSize(22)
      ctx.fillText('★   Y U M M Y   ★', 300, 345)

      // 6.3 治愈推荐语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#865439')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 395)
        ctx.fillText(line2, 300, 425)
      } else {
        ctx.fillText(phrase, 300, 410)
      }

      // 7. 丰富的手账贴纸元素
      ctx.setFontSize(26)
      ctx.fillText('🍄', 100, 525)
      ctx.fillText('🎈', 500, 525)
      ctx.fillText('✨', 300, 525)

      // 8. 底部区域 (手账拼贴纸)
      ctx.setFillStyle('#F5EBE6')
      drawRoundRect(ctx, 50, 585, 500, 155, 24)
      ctx.fill()

      ctx.setTextAlign('left')
      ctx.setFontSize(18)
      ctx.setFillStyle('#5C3D2E')
      ctx.fillText('“把温暖塞进胃里，把快乐存入心底”', 80, 642)

      ctx.setFontSize(13)
      ctx.setFillStyle('#A88B7E')
      ctx.fillText('✍ 记录与分享你的生活风味 · EatEat', 80, 690)

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 410, 600, 120, 120)
    } else if (posterStyle === 5) {
      // 样式六：法式气质风
      // 1. 莫兰迪米色法式优雅背景
      ctx.setFillStyle('#EAE5D9')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 墨绿色相框细双实线边框
      ctx.setStrokeStyle('#1E4D2B')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 24, 24, 552, 752, 28)
      ctx.stroke()
      
      ctx.setStrokeStyle('#1E4D2B')
      ctx.setLineWidth(1)
      drawRoundRect(ctx, 30, 30, 540, 740, 24)
      ctx.stroke()

      // 3. 顶部法式英文装饰
      ctx.setFontSize(13)
      ctx.setFillStyle('#1E4D2B')
      ctx.setTextAlign('center')
      ctx.fillText('—  L E   P E T I T   B I S T R O  —', 300, 80)

      ctx.setFontSize(14)
      ctx.setFillStyle('#8C7E6A')
      ctx.fillText('BON APPÉTIT', 300, 110)

      // 4. 绘制法式古典拱门内标签
      ctx.setFillStyle('#FBF9F6')
      ctx.setStrokeStyle('#1E4D2B')
      ctx.setLineWidth(2)
      // 绘制拱形门底图
      ctx.beginPath()
      ctx.arc(300, 230, 120, Math.PI, 2 * Math.PI)
      ctx.lineTo(420, 420)
      ctx.lineTo(180, 420)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // 4.1 墨绿色菜名
      ctx.setFontSize(45)
      ctx.setFillStyle('#1E4D2B')
      ctx.setTextAlign('center')
      ctx.fillText(props.result, 300, 290)

      // 4.2 拱门内的法式细横线与小英文
      ctx.setStrokeStyle('#D4CFC9')
      ctx.setLineWidth(1)
      ctx.beginPath()
      ctx.moveTo(220, 325)
      ctx.lineTo(380, 325)
      ctx.stroke()

      ctx.setFontSize(12)
      ctx.setFillStyle('#8C7E6A')
      ctx.fillText('✦ EXQUISITE CHOICE ✦', 300, 350)

      // 4.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#5C5446')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 385)
        ctx.fillText(line2, 300, 412)
      } else {
        ctx.fillText(phrase, 300, 395)
      }

      // 5. 日期与装饰
      ctx.setFontSize(13)
      ctx.setFillStyle('#1E4D2B')
      ctx.fillText(`SAISON D'AMOUR  ·  ${props.dateStr}`, 300, 490)

      // 6. 底部手绘纤细红酒杯线稿
      ctx.setStrokeStyle('#1E4D2B')
      ctx.setLineWidth(1.5)
      // 绘制高脚杯杯口
      ctx.beginPath()
      ctx.arc(120, 610, 10, 0, 2 * Math.PI)
      ctx.stroke()
      // 杯身
      ctx.beginPath()
      ctx.moveTo(105, 610)
      ctx.arcTo(120, 640, 135, 610, 15)
      ctx.stroke()
      // 杯梗
      ctx.beginPath()
      ctx.moveTo(120, 630)
      ctx.lineTo(120, 665)
      ctx.stroke()
      // 杯底
      ctx.beginPath()
      ctx.moveTo(108, 665)
      ctx.lineTo(132, 665)
      ctx.stroke()

      // 6.1 左侧法式配字
      ctx.setTextAlign('left')
      ctx.setFontSize(20)
      ctx.setFillStyle('#1E4D2B')
      ctx.fillText('La Vie en Rose', 160, 632)

      ctx.setFontSize(13)
      ctx.setFillStyle('#8C7E6A')
      ctx.fillText('✨ 在食物的光晕中，探寻法式慵懒之美', 160, 665)
      ctx.fillText('—— 微信小程序 · EatEat', 160, 692)

      // 7. 右侧太阳码 (法式墨绿相框)
      ctx.setStrokeStyle('#1E4D2B')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 420, 600, 110, 110, 16)
      ctx.stroke()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 605, 100, 100)
    } else if (posterStyle === 6) {
      // 样式七：像素复古街机风
      // 1. 像素霓虹背景
      ctx.setFillStyle('#1A0B2E')
      ctx.fillRect(0, 0, 600, 800)
      
      // 绘制青蓝色像素网格线
      ctx.setStrokeStyle('rgba(0, 242, 254, 0.08)')
      ctx.setLineWidth(1)
      for (let x = 0; x <= 600; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, 800)
        ctx.stroke()
      }
      for (let y = 0; y <= 800; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(600, y)
        ctx.stroke()
      }

      // 2. 双重霓虹边框
      ctx.setStrokeStyle('#00F2FE')
      ctx.setLineWidth(4)
      drawRoundRect(ctx, 24, 24, 552, 752, 16)
      ctx.stroke()
      ctx.setStrokeStyle('#FF007F')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 30, 30, 540, 740, 12)
      ctx.stroke()

      // 3. 街机像素小元素
      ctx.setFontSize(28)
      ctx.fillText('👾', 80, 80)
      ctx.fillText('🎮', 520, 80)
      ctx.fillText('⚡', 300, 80)

      // 4. 游戏状态和日期
      ctx.setFontSize(16)
      ctx.setFillStyle('#00F2FE')
      ctx.setTextAlign('center')
      ctx.fillText(`PLAYER: EATEAT   DATE: ${props.dateStr}`, 300, 120)
      
      // 5. 街机像素框包裹菜名
      ctx.setFillStyle('#0A0216')
      ctx.setStrokeStyle('#FF007F')
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 60, 160, 480, 240, 8)
      ctx.fill()
      ctx.stroke()

      // 5.1 菜名 (霓虹黄大字)
      ctx.setFontSize(54)
      ctx.setFillStyle('#FFFF00')
      ctx.fillText(props.result, 300, 250)

      // 5.2 状态提示
      ctx.setFontSize(16)
      ctx.setFillStyle('#00F2FE')
      ctx.fillText('✦ STAGE CLEAR! HP +999 ✦', 300, 300)

      // 5.3 闪烁的光标点缀
      ctx.setFillStyle('#FFFF00')
      ctx.fillRect(420, 230, 15, 25)

      // 6. 语录 (使用亮青色)
      ctx.setFontSize(18)
      ctx.setFillStyle('#00F2FE')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 350)
        ctx.fillText(line2, 300, 380)
      } else {
        ctx.fillText(phrase, 300, 365)
      }

      // 7. 像素红心生命值
      ctx.setFontSize(24)
      ctx.fillText('❤️❤️❤️', 300, 450)

      // 8. 底部网格太阳码框
      ctx.setFillStyle('rgba(10, 2, 22, 0.8)')
      ctx.setStrokeStyle('#00F2FE')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 40, 595, 520, 160, 16)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#FFFF00')
      ctx.fillText('“按 A 键开始今天的美食冒险 🕹️”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#00F2FE')
      ctx.fillText('✨ 扫码启动游戏 · 随机获取今日美食灵感', 70, 705)

      // 右侧太阳码 (白色衬底防反色)
      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 8)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 7) {
      // 样式八：绿野仙踪插画风
      // 1. 舒适森林绿背景
      ctx.setFillStyle('#E6EDE9')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 浅木色森林画框
      ctx.setStrokeStyle('#A2B5AC')
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 24, 24, 552, 752, 36)
      ctx.stroke()

      // 3. 绘制四周的藤蔓绿叶点缀 (手绘风小绿叶)
      ctx.setFillStyle('#88A89A')
      // 左上角树叶群
      ctx.beginPath(); ctx.arc(50, 50, 15, 0, 2*Math.PI); ctx.fill()
      ctx.beginPath(); ctx.arc(75, 45, 10, 0, 2*Math.PI); ctx.fill()
      ctx.beginPath(); ctx.arc(40, 75, 12, 0, 2*Math.PI); ctx.fill()
      // 右下角树叶群
      ctx.beginPath(); ctx.arc(550, 750, 20, 0, 2*Math.PI); ctx.fill()
      ctx.beginPath(); ctx.arc(525, 755, 12, 0, 2*Math.PI); ctx.fill()
      ctx.beginPath(); ctx.arc(560, 725, 15, 0, 2*Math.PI); ctx.fill()

      // 4. 顶部清新手体小字
      ctx.setFontSize(15)
      ctx.setFillStyle('#3E5C50')
      ctx.setTextAlign('center')
      ctx.fillText(`🍀 森呼吸 · ${props.dateStr} 🍀`, 300, 95)

      // 5. 中间清新的木盘白餐桌贴纸区
      ctx.setFillStyle('#ffffff')
      ctx.shadowColor = 'rgba(62, 92, 80, 0.05)'
      ctx.shadowBlur = 30
      ctx.shadowOffsetY = 10
      drawRoundRect(ctx, 60, 150, 480, 310, 40)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // 5.1 菜名
      ctx.setFontSize(50)
      ctx.setFillStyle('#283E34')
      ctx.setTextAlign('center')
      ctx.fillText(props.result, 300, 255)

      // 5.2 拼音点缀和叶片细线
      ctx.setFontSize(13)
      ctx.setFillStyle('#88A89A')
      ctx.fillText('N A T U R A L   L I F E', 300, 290)

      ctx.setStrokeStyle('#E2ECE9')
      ctx.setLineWidth(2)
      ctx.beginPath()
      ctx.moveTo(180, 315)
      ctx.lineTo(420, 315)
      ctx.stroke()

      // 5.3 治愈推荐语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#587569')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 360)
        ctx.fillText(line2, 300, 395)
      } else {
        ctx.fillText(phrase, 300, 375)
      }

      // 6. 木质小餐具手绘 (叉子和勺子)
      ctx.setFontSize(28)
      ctx.fillText('🍴  🥄', 300, 520)

      // 7. 底部森林二维码
      ctx.setFillStyle('#ffffff')
      ctx.setStrokeStyle('#88A89A')
      ctx.setLineWidth(1)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#283E34')
      ctx.fillText('“风里有花香，饭里有暖光 🌼”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#88A89A')
      ctx.fillText('✨ 扫码关注 · 在草地野餐上偶遇美味', 70, 705)

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 420, 615, 120, 120)
    } else if (posterStyle === 8) {
      // 样式九：国潮京剧朱砂风
      // 1. 朱砂红背景
      ctx.setFillStyle('#B83227')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 双重金色祥云边框
      ctx.setStrokeStyle('#F1C40F')
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 24, 24, 552, 752, 28)
      ctx.stroke()
      
      ctx.setLineWidth(1)
      drawRoundRect(ctx, 32, 32, 536, 736, 20)
      ctx.stroke()

      // 3. 顶部国风标签
      ctx.setFontSize(14)
      ctx.setFillStyle('#F1C40F')
      ctx.setTextAlign('center')
      ctx.fillText(`✦ 东方食礼 · ${props.dateStr} ✦`, 300, 90)

      // 3.1 祥云对称简笔画
      ctx.setFontSize(26)
      ctx.fillText('☁️', 120, 90)
      ctx.fillText('☁️', 480, 90)

      // 4. 居中朱红玉盘背景框
      ctx.setFillStyle('#ffffff')
      ctx.setStrokeStyle('#F1C40F')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 60, 150, 480, 310, 32)
      ctx.fill()
      ctx.stroke()

      // 4.1 菜名 (朱红大字，霸气书法风排版)
      ctx.setFontSize(54)
      ctx.setFillStyle('#B83227')
      ctx.setTextAlign('center')
      ctx.fillText(props.result, 300, 255)

      // 4.2 红色朱砂大方印章
      ctx.setFillStyle('rgba(184, 50, 39, 0.85)')
      drawRoundRect(ctx, 420, 175, 55, 55, 6)
      ctx.fill()
      ctx.setFontSize(14)
      ctx.setFillStyle('#ffffff')
      ctx.fillText('食', 448, 200)
      ctx.fillText('吉', 448, 220)

      // 4.3 中国风分割线
      ctx.setStrokeStyle('#F1C40F')
      ctx.setLineWidth(1.5)
      ctx.beginPath()
      ctx.moveTo(160, 310)
      ctx.lineTo(440, 310)
      ctx.stroke()

      // 4.4 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#581814')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 355)
        ctx.fillText(line2, 300, 390)
      } else {
        ctx.fillText(phrase, 300, 370)
      }

      // 5. 挂坠灯笼/折扇手绘
      ctx.setFontSize(28)
      ctx.fillText('🧧  🏮', 300, 520)

      // 6. 底部朱砂国风太阳码框架
      ctx.setFillStyle('rgba(0, 0, 0, 0.25)')
      ctx.setStrokeStyle('#F1C40F')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#F1C40F')
      ctx.fillText('“人间烟火气，最抚凡人心 🎋”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.65)')
      ctx.fillText('✨ 扫码赴宴 · 开启每日东方舌尖风味', 70, 705)

      // 二维码盒子
      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 12)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 9) {
      // 样式十：落日橘海风
      // 1. 绘制落日余晖金橘渐变背景
      const orangeGrad = ctx.createLinearGradient(0, 0, 0, 800)
      orangeGrad.addColorStop(0, '#FF5F6D')
      orangeGrad.addColorStop(1, '#FFC371')
      ctx.setFillStyle(orangeGrad)
      ctx.fillRect(0, 0, 600, 800)

      // 2. 细金框
      ctx.setStrokeStyle('rgba(255, 255, 255, 0.4)')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 24, 24, 552, 752, 28)
      ctx.stroke()

      // 3. 绘制半圆形落阳剪影
      ctx.setFillStyle('rgba(255, 255, 255, 0.15)')
      ctx.beginPath()
      ctx.arc(300, 480, 160, Math.PI, 2 * Math.PI)
      ctx.fill()
      
      // 飞鸟
      ctx.setStrokeStyle('rgba(255, 255, 255, 0.6)')
      ctx.setLineWidth(2)
      ctx.beginPath()
      ctx.moveTo(180, 360)
      ctx.quadraticCurveTo(195, 350, 210, 360)
      ctx.quadraticCurveTo(225, 350, 240, 360)
      ctx.stroke()

      // 4. 场景和日期
      ctx.setFontSize(15)
      ctx.setFillStyle('#ffffff')
      ctx.setTextAlign('center')
      ctx.fillText(`🌅 夕阳余晖 · ${props.dateStr}`, 300, 100)

      // 5. 菜名大字 (配暖白发光感)
      ctx.setFontSize(58)
      ctx.setFillStyle('#ffffff')
      ctx.shadowColor = 'rgba(255, 81, 47, 0.3)'
      ctx.shadowBlur = 15
      ctx.fillText(props.result, 300, 260)
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      // 6. 分割线与装饰
      ctx.setStrokeStyle('rgba(255, 255, 255, 0.6)')
      ctx.setLineWidth(1.5)
      ctx.beginPath()
      ctx.moveTo(220, 315)
      ctx.lineTo(380, 315)
      ctx.stroke()

      // 6.1 推荐语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#ffffff')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 365)
        ctx.fillText(line2, 300, 400)
      } else {
        ctx.fillText(phrase, 300, 380)
      }

      // 7. 太阳落山小文字
      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.8)')
      ctx.fillText('—  S U N S E T   M E M O R Y  —', 300, 470)

      // 8. 底部白色高阶太阳码框
      ctx.setFillStyle('#ffffff')
      ctx.shadowColor = 'rgba(221, 36, 118, 0.1)'
      ctx.shadowBlur = 20
      drawRoundRect(ctx, 40, 595, 520, 160, 28)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      ctx.setTextAlign('left')
      ctx.setFontSize(18)
      ctx.setFillStyle('#FF5F6D')
      ctx.fillText('“在落日余晖里，吃一顿浪漫晚餐”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#A89B8E')
      ctx.fillText('✨ 扫码记录今日美食，发现夕阳下的美味', 70, 705)

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 420, 615, 120, 120)
    } else if (posterStyle === 10) {
      // 样式十一：盐系极简风
      // 1. 燕麦灰底色
      ctx.setFillStyle('#EAE8E4')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 细长深灰色矩形框 (显示设计师排版感)
      ctx.setStrokeStyle('#7F8C8D')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 36, 36, 528, 728, 0)
      ctx.stroke()

      // 3. 顶部微小英文
      ctx.setFontSize(12)
      ctx.setFillStyle('#7F8C8D')
      ctx.setTextAlign('center')
      ctx.fillText('—  S A L T   S T Y L E   M I N I M A L I S T  —', 300, 85)

      ctx.setFontSize(14)
      ctx.fillText(props.dateStr, 300, 115)

      // 4. 中部画一个简单的细圆圈包裹菜品
      ctx.setStrokeStyle('#7F8C8D')
      ctx.setLineWidth(1)
      ctx.beginPath()
      ctx.arc(300, 260, 110, 0, 2 * Math.PI)
      ctx.stroke()

      // 4.1 菜名 (冷淡深灰字)
      ctx.setFontSize(44)
      ctx.setFillStyle('#2C3E50')
      ctx.fillText(props.result, 300, 275)

      // 5. 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#7F8C8D')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 410)
        ctx.fillText(line2, 300, 440)
      } else {
        ctx.fillText(phrase, 300, 425)
      }

      // 6. 侧边垂直排列配字
      ctx.setTextAlign('left')
      ctx.setFontSize(12)
      ctx.fillText('S I M P L E', 60, 520)

      // 7. 底部极简太阳码区块 (不带阴影)
      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 40, 595, 520, 160, 0)
      ctx.fill()
      
      ctx.setStrokeStyle('#EAE8E4')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 40, 595, 520, 160, 0)
      ctx.stroke()

      ctx.setFontSize(16)
      ctx.setFillStyle('#2C3E50')
      ctx.fillText('“繁华落尽，食物最是真切”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#7F8C8D')
      ctx.fillText('✨ 扫码一起探索纯粹的食物风味 · EatEat', 70, 705)

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 420, 615, 120, 120)
    } else if (posterStyle === 11) {
      // 样式十二：蒸汽波电子风
      // 1. 迷幻蓝紫红线性渐变背景
      const vaporGrad = ctx.createLinearGradient(0, 0, 600, 800)
      vaporGrad.addColorStop(0, '#FF00CC')
      vaporGrad.addColorStop(1, '#333399')
      ctx.setFillStyle(vaporGrad)
      ctx.fillRect(0, 0, 600, 800)

      // 2. 荧光粉和荧光青双重网格线
      ctx.setStrokeStyle('rgba(0, 242, 254, 0.15)')
      ctx.setLineWidth(1)
      for (let x = 0; x <= 600; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + 50, 800)
        ctx.stroke()
      }

      // 3. 复古粉色太阳圆圈
      ctx.setFillStyle('rgba(255, 0, 127, 0.3)')
      ctx.beginPath()
      ctx.arc(300, 220, 140, 0, 2 * Math.PI)
      ctx.fill()

      // 4. 顶部荧光绿英文
      ctx.setFontSize(13)
      ctx.setFillStyle('#00FFCC')
      ctx.setTextAlign('center')
      ctx.fillText('—  V A P O R W A V E   E L E C T R O N I C  —', 300, 80)
      ctx.fillText(`SYSTEM RUNNING // ${props.dateStr}`, 300, 110)

      // 5. 菜名 (荧光青绿色大字，霓虹描线感)
      ctx.setFontSize(58)
      ctx.setFillStyle('#00FFCC')
      ctx.shadowColor = 'rgba(0, 255, 204, 0.6)'
      ctx.shadowBlur = 20
      ctx.fillText(props.result, 300, 260)
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      // 6. 蒸汽波斜体标签和分割线
      ctx.setStrokeStyle('#FF00CC')
      ctx.setLineWidth(2)
      ctx.beginPath()
      ctx.moveTo(150, 315)
      ctx.lineTo(450, 315)
      ctx.stroke()

      // 6.1 语录 (荧光黄色文字)
      ctx.setFontSize(18)
      ctx.setFillStyle('#FFFF00')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 370)
        ctx.fillText(line2, 300, 405)
      } else {
        ctx.fillText(phrase, 300, 385)
      }

      // 7. 电子椰子树点缀
      ctx.setFontSize(28)
      ctx.fillText('🌴  🌴  🌴', 300, 490)

      // 8. 底部蒸汽波黑白半透明太阳码区块
      ctx.setFillStyle('rgba(0, 0, 0, 0.45)')
      ctx.setStrokeStyle('#00FFCC')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 16)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#FFFF00')
      ctx.fillText('“电子大脑说：今晚吃这个就对了 ⚡”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#00FFCC')
      ctx.fillText('✨ 扫码连入赛博空间 · 解锁今日霓虹风味', 70, 705)

      // 右侧太阳码盒
      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 12)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 12) {
      // 样式十三：和风浮世绘
      // 1. 苍青色背景
      ctx.setFillStyle('#1B263B')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 浅樱粉色细边框
      ctx.setStrokeStyle('#E8A7A1')
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 24, 24, 552, 752, 28)
      ctx.stroke()

      // 3. 绘制日式巨浪波纹简笔与樱花瓣
      ctx.setFillStyle('rgba(232, 167, 161, 0.15)')
      ctx.beginPath()
      ctx.arc(100, 750, 150, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(500, 750, 120, 0, 2 * Math.PI)
      ctx.fill()

      // 樱花瓣
      ctx.setFontSize(22)
      ctx.fillText('🌸', 80, 80)
      ctx.fillText('🌸', 510, 120)

      // 4. 顶部红日
      ctx.setFillStyle('#E74C3C')
      ctx.beginPath()
      ctx.arc(300, 95, 24, 0, 2 * Math.PI)
      ctx.fill()

      // 4.1 场景与日期 (淡粉色)
      ctx.setFontSize(14)
      ctx.setFillStyle('#E8A7A1')
      ctx.setTextAlign('center')
      ctx.fillText(`— 一期一会 · ${props.dateStr} —`, 300, 145)

      // 5. 中间日式木签背景框
      ctx.setFillStyle('#FCFAF2')
      ctx.setStrokeStyle('#E8A7A1')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 60, 175, 480, 285, 12)
      ctx.fill()
      ctx.stroke()

      // 5.1 菜名
      ctx.setFontSize(54)
      ctx.setFillStyle('#1B263B')
      ctx.fillText(props.result, 300, 275)

      // 5.2 日式朱红“御食”大印章
      ctx.setFillStyle('#E74C3C')
      ctx.beginPath()
      ctx.arc(420, 205, 20, 0, 2 * Math.PI)
      ctx.fill()
      ctx.setFontSize(12)
      ctx.setFillStyle('#ffffff')
      ctx.fillText('食', 420, 209)

      // 5.3 分割细线
      ctx.setStrokeStyle('#E8A7A1')
      ctx.setLineWidth(1.5)
      ctx.beginPath()
      ctx.moveTo(180, 325)
      ctx.lineTo(420, 325)
      ctx.stroke()

      // 5.4 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#5C3D2E')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 370)
        ctx.fillText(line2, 300, 405)
      } else {
        ctx.fillText(phrase, 300, 385)
      }

      // 6. 日式垂帘/小挂坠
      ctx.setFontSize(26)
      ctx.fillText('🎏  🏮', 300, 515)

      // 7. 底部和风太阳码区域
      ctx.setFillStyle('rgba(255, 255, 255, 0.05)')
      ctx.setStrokeStyle('#E8A7A1')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#E8A7A1')
      ctx.fillText('“一期一会，每一餐都值得珍惜 🌸”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(232, 167, 161, 0.7)')
      ctx.fillText('✨ 扫码记录今日美食 · 遇见和风好味', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 16)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 13) {
      // 样式十四：美式波普涂鸦
      // 1. 高饱和黄色背景
      ctx.setFillStyle('#FFD200')
      ctx.fillRect(0, 0, 600, 800)

      // 绘制网点背景 (密集的黑点)
      ctx.setFillStyle('rgba(0, 0, 0, 0.04)')
      for (let x = 10; x <= 600; x += 30) {
        for (let y = 10; y <= 800; y += 30) {
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, 2 * Math.PI)
          ctx.fill()
        }
      }

      // 2. 粗黑直边框
      ctx.setStrokeStyle('#000000')
      ctx.setLineWidth(5)
      drawRoundRect(ctx, 24, 24, 552, 752, 0)
      ctx.stroke()

      // 3. 顶部波普英文标语与日期
      ctx.setFontSize(16)
      ctx.setFillStyle('#000000')
      ctx.setTextAlign('center')
      ctx.fillText(`⚡ POP ART DELICIOUS // ${props.dateStr} ⚡`, 300, 95)

      // 3.1 涂鸦小表情
      ctx.setFontSize(32)
      ctx.fillText('💥', 100, 120)
      ctx.fillText('🍟', 500, 120)

      // 4. 中间漫画爆炸气泡菜名区域
      // 绘制爆炸多边形 (粗黑线包裹)
      ctx.setFillStyle('#ffffff')
      ctx.setStrokeStyle('#000000')
      ctx.setLineWidth(4)
      ctx.beginPath()
      ctx.moveTo(80, 260)
      ctx.lineTo(150, 190)
      ctx.lineTo(300, 160)
      ctx.lineTo(450, 190)
      ctx.lineTo(520, 260)
      ctx.lineTo(460, 330)
      ctx.lineTo(300, 360)
      ctx.lineTo(140, 330)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // 4.1 菜名 (巨大黑色斜体大字)
      ctx.setFontSize(54)
      ctx.setFillStyle('#000000')
      ctx.fillText(props.result, 300, 275)

      // 5. 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#000000')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 420)
        ctx.fillText(line2, 300, 455)
      } else {
        ctx.fillText(phrase, 300, 435)
      }

      // 6. 快餐小手绘
      ctx.setFontSize(28)
      ctx.fillText('💋  🍔  🥤', 300, 520)

      // 7. 底部粗黑太阳码框
      ctx.setFillStyle('#ffffff')
      ctx.setStrokeStyle('#000000')
      ctx.setLineWidth(4)
      drawRoundRect(ctx, 40, 595, 520, 160, 0)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(18)
      ctx.setFillStyle('#E74C3C')
      ctx.fillText('“OH MY GOD! THIS IS SO GOOD! 💥”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#000000')
      ctx.fillText('✨ 扫码加入波普派对 · 抽选今日趣怪美食', 70, 705)

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 420, 615, 120, 120)
    } else if (posterStyle === 14) {
      // 样式十五：魔法占卜塔罗风
      // 1. 深海星空蓝背景
      ctx.setFillStyle('#0B0C10')
      ctx.fillRect(0, 0, 600, 800)

      // 绘制金色小星星点缀
      ctx.setFillStyle('#F1C40F')
      ctx.setFontSize(14)
      for (let i = 0; i < 15; i++) {
        const sx = Math.random() * 500 + 50
        const sy = Math.random() * 500 + 50
        ctx.fillText('★', sx, sy)
      }

      // 2. 双重金色精致法阵框
      ctx.setStrokeStyle('#F1C40F')
      ctx.setLineWidth(2.5)
      drawRoundRect(ctx, 24, 24, 552, 752, 24)
      ctx.stroke()
      ctx.setLineWidth(1)
      drawRoundRect(ctx, 30, 30, 540, 740, 20)
      ctx.stroke()

      // 3. 顶部弯月
      ctx.setFontSize(30)
      ctx.fillText('🌙', 300, 90)

      // 3.1 场景与日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#F1C40F')
      ctx.setTextAlign('center')
      ctx.fillText(`— 占卜宿命之味 · ${props.dateStr} —`, 300, 135)

      // 4. 中部塔罗牌形状的金色双线竖直卡片框
      ctx.setFillStyle('rgba(255, 255, 255, 0.04)')
      ctx.setStrokeStyle('#F1C40F')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 80, 160, 440, 310, 16)
      ctx.fill()
      ctx.stroke()
      
      ctx.setLineWidth(0.5)
      drawRoundRect(ctx, 86, 166, 428, 298, 12)
      ctx.stroke()

      // 4.1 菜品大字 (金黄色宿命感大字)
      ctx.setFontSize(54)
      ctx.setFillStyle('#F1C40F')
      ctx.fillText(props.result, 300, 280)

      // 4.2 星位标志
      ctx.setFontSize(12)
      ctx.fillText('✦ THE FOOD OF DESTINY ✦', 300, 335)

      // 4.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#ffffff')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 385)
        ctx.fillText(line2, 300, 420)
      } else {
        ctx.fillText(phrase, 300, 400)
      }

      // 5. 神秘法阵饰品
      ctx.setFontSize(26)
      ctx.fillText('🔮  ✨  ⏳', 300, 520)

      // 6. 底部金色二维码框
      ctx.setFillStyle('rgba(0, 0, 0, 0.5)')
      ctx.setStrokeStyle('#F1C40F')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#F1C40F')
      ctx.fillText('“星空会指引你，在碗里找到快乐 ✨”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.55)')
      ctx.fillText('✨ 扫码逆天改命 · 获取今日专属美食星运', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 16)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 15) {
      // 样式十六：太空探险宇航风
      // 1. 深太空蓝色背景
      ctx.setFillStyle('#0D1B2A')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 冰蓝色细线及小圆点铆钉
      ctx.setStrokeStyle('#E0E1DD')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 24, 24, 552, 752, 32)
      ctx.stroke()

      // 四角画铆钉圈
      ctx.setFillStyle('#E0E1DD')
      ctx.beginPath(); ctx.arc(40, 40, 5, 0, 2*Math.PI); ctx.fill()
      ctx.beginPath(); ctx.arc(560, 40, 5, 0, 2*Math.PI); ctx.fill()
      ctx.beginPath(); ctx.arc(40, 760, 5, 0, 2*Math.PI); ctx.fill()
      ctx.beginPath(); ctx.arc(560, 760, 5, 0, 2*Math.PI); ctx.fill()

      // 3. 土星与火箭手绘
      ctx.setFontSize(30)
      ctx.fillText('🪐', 100, 90)
      ctx.fillText('🚀', 500, 110)

      // 3.1 任务标签与日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#FC8D62')
      ctx.setTextAlign('center')
      ctx.fillText(`🛸 MISSION STATUS: HUNGRY // ${props.dateStr}`, 300, 95)

      // 4. 金属观测窗菜名区域
      ctx.setFillStyle('#1B263B')
      ctx.setStrokeStyle('#FC8D62')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 60, 150, 480, 310, 32)
      ctx.fill()
      ctx.stroke()

      // 4.1 菜名 (炫酷冰蓝发光字)
      ctx.setFontSize(54)
      ctx.setFillStyle('#E0E1DD')
      ctx.shadowColor = 'rgba(224, 225, 221, 0.4)'
      ctx.shadowBlur = 15
      ctx.fillText(props.result, 300, 255)
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      // 4.2 科幻分割线
      ctx.setStrokeStyle('rgba(252, 141, 98, 0.4)')
      ctx.setLineWidth(1.5)
      ctx.beginPath()
      ctx.moveTo(180, 310)
      ctx.lineTo(420, 310)
      ctx.stroke()

      // 4.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#E0E1DD')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 355)
        ctx.fillText(line2, 300, 390)
      } else {
        ctx.fillText(phrase, 300, 370)
      }

      // 5. 探索挂件
      ctx.setFontSize(26)
      ctx.fillText('📡  🛰️  🛸', 300, 520)

      // 6. 底部宇航局框架
      ctx.setFillStyle('rgba(27, 38, 59, 0.8)')
      ctx.setStrokeStyle('#E0E1DD')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#FC8D62')
      ctx.fillText('“飞跃星河，只为与这碗烟火相遇 🚀”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(224, 225, 221, 0.7)')
      ctx.fillText('✨ 扫码探测黑洞风物 · 同步宇宙三餐频段', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 12)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 16) {
      // 样式十七：复古霓虹迪斯科风
      // 1. 深靛蓝色背景
      ctx.setFillStyle('#050515')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 双重粉蓝霓虹细框
      ctx.setStrokeStyle('#00F2FE')
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 24, 24, 552, 752, 28)
      ctx.stroke()
      ctx.setStrokeStyle('#FF007F')
      ctx.setLineWidth(1)
      drawRoundRect(ctx, 30, 30, 540, 740, 22)
      ctx.stroke()

      // 3. 霓虹音符与 Disco 闪光球
      ctx.setFontSize(28)
      ctx.fillText('🎵', 80, 95)
      ctx.fillText('🪩', 300, 85)
      ctx.fillText('🎶', 500, 95)

      // 3.1 顶部小英文
      ctx.setFontSize(13)
      ctx.setFillStyle('#FF007F')
      ctx.setTextAlign('center')
      ctx.fillText(`— RETRO DISCO NIGHT // ${props.dateStr} —`, 300, 135)

      // 4. 绘制超大圆形黑胶唱片
      // 4.1 唱片外圈 (深灰色大圆圈)
      ctx.setFillStyle('#111111')
      ctx.setStrokeStyle('rgba(0, 242, 254, 0.4)')
      ctx.setLineWidth(4)
      ctx.beginPath()
      ctx.arc(300, 315, 150, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // 唱片内音轨细圈
      ctx.setStrokeStyle('#222222')
      ctx.setLineWidth(1.5)
      ctx.beginPath(); ctx.arc(300, 315, 120, 0, 2 * Math.PI); ctx.stroke()
      ctx.beginPath(); ctx.arc(300, 315, 90, 0, 2 * Math.PI); ctx.stroke()

      // 4.2 唱片圆心标签 (霓虹粉大圆圈)
      ctx.setFillStyle('#FF007F')
      ctx.beginPath()
      ctx.arc(300, 315, 65, 0, 2 * Math.PI)
      ctx.fill()

      // 4.3 菜名 (唱片圆心白色大字)
      ctx.setFontSize(32)
      ctx.setFillStyle('#ffffff')
      ctx.fillText(props.result.slice(0, 4), 300, 325) // 最多取 4 个字居中显示在唱片芯

      // 5. 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#00F2FE')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 500)
        ctx.fillText(line2, 300, 535)
      } else {
        ctx.fillText(phrase, 300, 515)
      }

      // 6. 底部霓虹太阳码框架
      ctx.setFillStyle('rgba(17, 17, 30, 0.95)')
      ctx.setStrokeStyle('#FF007F')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#00F2FE')
      ctx.fillText('“让美食在舌尖上跳一首迪斯科 💃”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.65)')
      ctx.fillText('✨ 扫码播放美味金曲 · 摇摆获取今日灵感', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 12)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 17) {
      // 样式十八：中世纪羊皮纸手稿风
      // 1. 旧羊皮纸黄底色
      ctx.setFillStyle('#F1E4C3')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 绘制中世纪藤蔓双框 (深棕色)
      ctx.setStrokeStyle('#5C3D2E')
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 24, 24, 552, 752, 12)
      ctx.stroke()
      ctx.setLineWidth(1)
      drawRoundRect(ctx, 32, 32, 536, 736, 8)
      ctx.stroke()

      // 四角画复古花边
      ctx.setFontSize(24)
      ctx.fillText('⚜', 48, 70)
      ctx.fillText('⚜', 525, 70)
      ctx.fillText('⚜', 48, 745)
      ctx.fillText('⚜', 525, 745)

      // 3. 顶部古典首字与日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#5C3D2E')
      ctx.setTextAlign('center')
      ctx.fillText(`—  IN CIBIS SALUS · ${props.dateStr}  —`, 300, 100)

      // 4. 中间手稿框
      ctx.setStrokeStyle('#5C3D2E')
      ctx.setLineWidth(1.5)
      ctx.beginPath()
      ctx.moveTo(80, 150)
      ctx.lineTo(520, 150)
      ctx.stroke()

      // 4.1 菜品名称：哥特式/首字大写描画
      ctx.setFontSize(54)
      ctx.setFillStyle('#5C3D2E')
      ctx.fillText(props.result, 300, 250)

      // 绘制玫瑰插图
      ctx.setFontSize(26)
      ctx.fillText('🌹', 300, 315)

      // 4.2 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#5C3D2E')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 380)
        ctx.fillText(line2, 300, 415)
      } else {
        ctx.fillText(phrase, 300, 395)
      }

      // 5. 羊皮纸分割花纹
      ctx.setFontSize(20)
      ctx.fillText('一一一  ❦  一一一', 300, 510)

      // 6. 底部复古蜡封/家徽太阳码区域
      ctx.setFillStyle('rgba(92, 61, 46, 0.05)')
      ctx.setStrokeStyle('#5C3D2E')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 16)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#5C3D2E')
      ctx.fillText('“愿这餐天赐的恩惠，抚平你所有的疲惫”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(92, 61, 46, 0.7)')
      ctx.fillText('✨ 扫码翻开羊皮纸手稿 · 寻觅中世纪的美味', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 8)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 18) {
      // 样式十九：夏日多普勒果冻风
      // 1. 青绿到冰蓝多普勒线性渐变背景
      const jellyGrad = ctx.createLinearGradient(0, 0, 600, 800)
      jellyGrad.addColorStop(0, '#00FF87')
      jellyGrad.addColorStop(1, '#60EFFF')
      ctx.setFillStyle(jellyGrad)
      ctx.fillRect(0, 0, 600, 800)

      // 2. 绘制散落的半透明冰块与水果切片
      ctx.setFillStyle('rgba(255, 255, 255, 0.25)')
      // 左上柠檬
      ctx.beginPath(); ctx.arc(80, 120, 45, 0, 2*Math.PI); ctx.fill()
      // 右下冰块
      drawRoundRect(ctx, 460, 460, 70, 70, 12); ctx.fill()
      // 左下西瓜
      ctx.beginPath(); ctx.arc(90, 520, 35, 0, 2*Math.PI); ctx.fill()

      // 绘制透明磨砂双框
      ctx.setStrokeStyle('rgba(255, 255, 255, 0.6)')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 24, 24, 552, 752, 32)
      ctx.stroke()

      // 3. 顶部清凉英文
      ctx.setFontSize(13)
      ctx.setFillStyle('#008080')
      ctx.setTextAlign('center')
      ctx.fillText('—  S U M M E R   D O P P L E R   J E L L Y  —', 300, 80)
      ctx.fillText(`COLD WAVE // ${props.dateStr}`, 300, 105)

      // 4. 中间磨砂白色卡片底
      ctx.setFillStyle('rgba(255, 255, 255, 0.75)')
      drawRoundRect(ctx, 60, 150, 480, 310, 28)
      ctx.fill()

      // 4.1 菜名 (果绿渐变字)
      ctx.setFontSize(54)
      ctx.setFillStyle('#008080')
      ctx.fillText(props.result, 300, 260)

      // 4.2 清爽分割点
      ctx.setFontSize(22)
      ctx.fillText('🧊  🍋  🍉', 300, 325)

      // 4.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#006666')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 385)
        ctx.fillText(line2, 300, 418)
      } else {
        ctx.fillText(phrase, 300, 400)
      }

      // 5. 挂件
      ctx.setFontSize(26)
      ctx.fillText('⛱️  🍦  🫧', 300, 520)

      // 6. 底部半透明果冻太阳码框
      ctx.setFillStyle('rgba(255, 255, 255, 0.45)')
      ctx.setStrokeStyle('rgba(255, 255, 255, 0.8)')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#008080')
      ctx.fillText('“夏天的风，吹过西瓜和这盘美味 🍉”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#008080')
      ctx.fillText('✨ 扫码注入清凉能量 · 同步冰淇淋频段', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 16)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 19) {
      // 样式二十：中式水墨江山风
      // 1. 宣纸微黄底色
      ctx.setFillStyle('#F7F6F2')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 底部渲染水墨晕染山峦与竹影 (黑白灰色)
      ctx.setFillStyle('rgba(0, 0, 0, 0.05)')
      ctx.beginPath()
      ctx.moveTo(0, 800)
      ctx.bezierCurveTo(150, 700, 350, 780, 600, 720)
      ctx.lineTo(600, 800)
      ctx.closePath()
      ctx.fill()
      
      ctx.setFillStyle('rgba(0, 0, 0, 0.03)')
      ctx.beginPath()
      ctx.moveTo(0, 800)
      ctx.bezierCurveTo(200, 750, 450, 690, 600, 750)
      ctx.lineTo(600, 800)
      ctx.closePath()
      ctx.fill()

      // 绘制几笔竹叶/红梅
      ctx.setFontSize(28)
      ctx.fillText('🎋', 80, 520)
      ctx.fillText('🌸', 500, 110)

      // 3. 细黑中式双内框
      ctx.setStrokeStyle('#2C3E50')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 24, 24, 552, 752, 0)
      ctx.stroke()

      // 4. 顶部场景与日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#1C1C1C')
      ctx.setTextAlign('center')
      ctx.fillText(`— 岁时之味 · ${props.dateStr} —`, 300, 95)

      // 5. 中间水墨书法字
      ctx.setFontSize(56)
      ctx.setFillStyle('#1C1C1C')
      ctx.fillText(props.result, 300, 250)

      // 5.1 右上角长方形朱红“岁时记”大章
      ctx.setFillStyle('#E74C3C')
      drawRoundRect(ctx, 420, 170, 32, 70, 4)
      ctx.fill()
      ctx.setFontSize(13)
      ctx.setFillStyle('#ffffff')
      ctx.fillText('岁', 436, 192)
      ctx.fillText('时', 436, 212)
      ctx.fillText('记', 436, 232)

      // 5.2 诗意标语
      ctx.setFontSize(18)
      ctx.setFillStyle('#4A4A4A')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 350)
        ctx.fillText(line2, 300, 385)
      } else {
        ctx.fillText(phrase, 300, 365)
      }

      // 6. 经典垂坠
      ctx.setFontSize(26)
      ctx.fillText('🍵  🥢', 300, 510)

      // 7. 底部水墨太阳码大框 (红色双框包裹)
      ctx.setFillStyle('#ffffff')
      ctx.setStrokeStyle('#E74C3C')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 40, 595, 520, 160, 4)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#1C1C1C')
      ctx.fillText('“一瓢一箸，尽是人间好时节 🥢”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#7F8C8D')
      ctx.fillText('✨ 扫码染墨江山 · 拾取岁时节序下的美味', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 0)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 20) {
      // 样式二十一：怪诞拼贴剪报风
      // 1. 漆黑底色
      ctx.setFillStyle('#121212')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 绘制散落的报纸碎片贴纸底 (浅牛皮黄、灰白底)
      ctx.setFillStyle('#E5D3B3')
      ctx.fillRect(40, 150, 520, 340)

      ctx.setFillStyle('#ffffff')
      ctx.fillRect(60, 180, 480, 280)

      // 3. 边框 (波浪撕纸线感)
      ctx.setStrokeStyle('#ffffff')
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 24, 24, 552, 752, 0)
      ctx.stroke()

      // 4. 顶部剪报英文字
      ctx.setFontSize(14)
      ctx.setFillStyle('#ffffff')
      ctx.setTextAlign('center')
      ctx.fillText(`⚡ WARNING: EAT DELICIOUS // ${props.dateStr} ⚡`, 300, 90)

      // 5. 菜名：拼贴字母 (每一个字用不同颜色色块包裹)
      const letters = props.result.split('')
      const totalLen = letters.length
      const startX = 300 - (totalLen * 55) / 2
      ctx.setFontSize(36)
      letters.forEach((char, i) => {
        const blockX = startX + i * 55
        const blockY = 220
        // 交替色块：黑、红、黄
        const colors = ['#E74C3C', '#2C3E50', '#F1C40F', '#27AE60']
        ctx.setFillStyle(colors[i % colors.length])
        ctx.fillRect(blockX, blockY, 50, 60)
        
        ctx.setFillStyle('#ffffff')
        ctx.setTextAlign('center')
        ctx.fillText(char, blockX + 25, blockY + 43)
      })

      // 5.1 饰品 (怪诞眼睛)
      ctx.setFontSize(32)
      ctx.fillText('👀', 300, 335)

      // 5.2 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#121212')
      ctx.setTextAlign('center')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 395)
        ctx.fillText(line2, 300, 430)
      } else {
        ctx.fillText(phrase, 300, 410)
      }

      // 6. 拼贴徽章
      ctx.setFontSize(28)
      ctx.fillText('🕶️  💥  📎', 300, 520)

      // 7. 底部撕纸太阳码区域
      ctx.setFillStyle('#ffffff')
      ctx.setStrokeStyle('#E74C3C')
      ctx.setLineWidth(4)
      drawRoundRect(ctx, 40, 595, 520, 160, 0)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#121212')
      ctx.fillText('“警告：吃完这一盘，你会开心到飞起！💥”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#7F8C8D')
      ctx.fillText('✨ 扫码拆开秘密剪报 · 解锁今日怪诞美食线索', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 0)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 21) {
      // 样式二十二：低保真Lofi复古插画
      // 1. 温柔香草奶黄色底
      ctx.setFillStyle('#FAEDCD')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 嫩绿与暖咖啡色双框
      ctx.setStrokeStyle('#CCD5AE')
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 24, 24, 552, 752, 28)
      ctx.stroke()

      // 3. 顶部温馨小字符
      ctx.setFontSize(14)
      ctx.setFillStyle('#D4A373')
      ctx.setTextAlign('center')
      ctx.fillText(`— Lofi Time · ${props.dateStr} —`, 300, 95)

      // 4. 中间Lofi插画背景板
      ctx.setFillStyle('#FEFAE0')
      drawRoundRect(ctx, 60, 140, 480, 310, 24)
      ctx.fill()

      // 4.1 菜名 (温柔咖啡色大字)
      ctx.setFontSize(54)
      ctx.setFillStyle('#D4A373')
      ctx.fillText(props.result, 300, 240)

      // 4.2 热咖啡图标
      ctx.setFontSize(26)
      ctx.fillText('☕', 300, 305)

      // 4.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#D4A373')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 365)
        ctx.fillText(line2, 300, 400)
      } else {
        ctx.fillText(phrase, 300, 380)
      }

      // 5. 趴在窗台熟睡的猫咪
      ctx.setFontSize(26)
      ctx.fillText('🐱  💤  📻', 300, 515)

      // 6. 底部奶油色太阳码区域
      ctx.setFillStyle('#FEFAE0')
      ctx.setStrokeStyle('#CCD5AE')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#D4A373')
      ctx.fillText('“世界很吵，但今天的晚饭很香 🐱”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#E6B89C')
      ctx.fillText('✨ 扫码倾听 Lofi 慢歌 · 感受柴米油盐里的宁静', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 16)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 22) {
      // 样式二十三：未来赛博解构工业风
      // 1. 哑光碳黑底色
      ctx.setFillStyle('#121212')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 绘制边缘黑黄相间危险斜警示条纹 (只在顶部和底部边角)
      ctx.setFillStyle('#FFCC00')
      ctx.fillRect(24, 24, 552, 12)
      ctx.fillRect(24, 764, 552, 12)
      
      ctx.setFillStyle('#000000')
      for (let x = 30; x < 570; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 24)
        ctx.lineTo(x + 15, 24)
        ctx.lineTo(x - 5, 36)
        ctx.lineTo(x - 20, 36)
        ctx.closePath()
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(x, 764)
        ctx.lineTo(x + 15, 764)
        ctx.lineTo(x - 5, 776)
        ctx.lineTo(x - 20, 776)
        ctx.closePath()
        ctx.fill()
      }

      // 工业细框线
      ctx.setStrokeStyle('#FFCC00')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 24, 24, 552, 752, 0)
      ctx.stroke()

      // 3. 顶部十字准心与参数字
      ctx.setFontSize(14)
      ctx.setFillStyle('#FFCC00')
      ctx.setTextAlign('center')
      ctx.fillText(`[ EAT-EAT CORE SYSTEM v2.0 // ${props.dateStr} ]`, 300, 80)
      ctx.fillText('🎯 [ LOCK ON TARGET ]', 300, 110)

      // 4. 金属仓解构菜名盒
      ctx.setFillStyle('#1C1C1C')
      ctx.setStrokeStyle('#FFCC00')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 60, 150, 480, 310, 4)
      ctx.fill()
      ctx.stroke()

      // 4.1 菜名 (亮黄色警告大字)
      ctx.setFontSize(54)
      ctx.setFillStyle('#FFCC00')
      ctx.fillText(props.result, 300, 255)

      // 4.2 科幻参数线
      ctx.setStrokeStyle('rgba(255, 204, 0, 0.3)')
      ctx.setLineWidth(1.5)
      ctx.beginPath()
      ctx.moveTo(100, 320)
      ctx.lineTo(500, 320)
      ctx.stroke()

      // 4.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#ffffff')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 370)
        ctx.fillText(line2, 300, 405)
      } else {
        ctx.fillText(phrase, 300, 385)
      }

      // 5. 机械结构件
      ctx.setFontSize(26)
      ctx.fillText('⚙️  🔩  🛠️', 300, 520)

      // 6. 底部警示框
      ctx.setFillStyle('rgba(28, 28, 28, 0.95)')
      ctx.setStrokeStyle('#FFCC00')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 0)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#FFCC00')
      ctx.fillText('“警告：美味指数已超越系统监视临界值！⚠️”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.6)')
      ctx.fillText('✨ 扫码接入雷达扫描 · 对准获取今日工业级美味配给', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 0)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 23) {
      // 样式二十四：童话魔法森林手绘
      // 1. 松石绿奶油底
      ctx.setFillStyle('#FEFBF3')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 四周边框用树藤藤蔓和松果构成
      ctx.setStrokeStyle('#79A37D')
      ctx.setLineWidth(4)
      drawRoundRect(ctx, 24, 24, 552, 752, 36)
      ctx.stroke()

      // 四周边角画树藤小花
      ctx.setFontSize(26)
      ctx.fillText('🌿', 40, 70)
      ctx.fillText('🌿', 520, 70)
      ctx.fillText('🍃', 40, 745)
      ctx.fillText('🍃', 520, 745)

      // 3. 顶部童话英文与日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#79A37D')
      ctx.setTextAlign('center')
      ctx.fillText(`—  FOREST FAIRY TALE · ${props.dateStr}  —`, 300, 95)

      // 4. 中间绘森林插图卡片
      ctx.setFillStyle('#F4EEA9')
      drawRoundRect(ctx, 60, 140, 480, 310, 28)
      ctx.fill()

      // 4.1 菜名 (手绘棕木质色)
      ctx.setFontSize(54)
      ctx.setFillStyle('#795548')
      ctx.fillText(props.result, 300, 240)

      // 4.2 蘑菇
      ctx.setFontSize(26)
      ctx.fillText('🍄', 300, 305)

      // 4.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#5D4037')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 365)
        ctx.fillText(line2, 300, 400)
      } else {
        ctx.fillText(phrase, 300, 380)
      }

      // 5. 森林深处的小刺猬与小松树
      ctx.setFontSize(26)
      ctx.fillText('🦔  🌲  🐿️', 300, 515)

      // 6. 底部森林太阳码盒
      ctx.setFillStyle('#FEFBF3')
      ctx.setStrokeStyle('#79A37D')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#795548')
      ctx.fillText('“在森林深处的树洞里，藏着今天的美味 🌲”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#79A37D')
      ctx.fillText('✨ 扫码呼唤林间仙子 · 抽选橡果林里的专属下午茶', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 20)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 24) {
      // 样式二十五：埃及法老神秘图腾
      // 1. 皇家深蓝与埃及金配色背景
      ctx.setFillStyle('#2C3E50')
      ctx.fillRect(0, 0, 600, 800)

      // 金色内框
      ctx.setStrokeStyle('#F1C40F')
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 24, 24, 552, 752, 16)
      ctx.stroke()

      // 四角装饰神圣荷鲁斯之眼或太阳
      ctx.setFontSize(26)
      ctx.fillText('☀️', 48, 72)
      ctx.fillText('☀️', 525, 72)
      ctx.fillText('☀️', 48, 742)
      ctx.fillText('☀️', 525, 742)

      // 2. 顶部法老小顶标与日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#F1C40F')
      ctx.setTextAlign('center')
      ctx.fillText(`— MYSTERIOUS EGYPT PHARAOH · ${props.dateStr} —`, 300, 95)
      ctx.fillText('𓁺  SACRED REVELATION  𓁺', 300, 120)

      // 3. 中间古埃及壁画神圣盘
      ctx.setFillStyle('rgba(241, 196, 15, 0.12)')
      ctx.setStrokeStyle('#F1C40F')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 60, 150, 480, 310, 24)
      ctx.fill()
      ctx.stroke()

      // 3.1 菜名 (闪耀金色文字)
      ctx.setFontSize(54)
      ctx.setFillStyle('#F1C40F')
      ctx.fillText(props.result, 300, 255)

      // 3.2 圣甲虫印记
      ctx.setFontSize(26)
      ctx.fillText('𓆣', 300, 318)

      // 3.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#ffffff')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 375)
        ctx.fillText(line2, 300, 410)
      } else {
        ctx.fillText(phrase, 300, 390)
      }

      // 4. 太阳船与金字塔
      ctx.setFontSize(28)
      ctx.fillText('⛵  𓃠  🕌', 300, 520)

      // 5. 底部金色神圣二维码盒
      ctx.setFillStyle('rgba(241, 196, 15, 0.15)')
      ctx.setStrokeStyle('#F1C40F')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 16)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#F1C40F')
      ctx.fillText('“在三千年的时光里，这顿饭依然闪闪发光 👁️”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.7)')
      ctx.fillText('✨ 扫码破解金字塔秘录 · 汲取来自法老的神秘恩赐', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 8)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 25) {
      // 样式二十六：粉彩浪漫独角兽
      // 1. 梦幻粉紫马卡龙渐变背景
      const unicornGrad = ctx.createLinearGradient(0, 0, 600, 800)
      unicornGrad.addColorStop(0, '#EE9CA7')
      unicornGrad.addColorStop(1, '#FFDDE1')
      ctx.setFillStyle(unicornGrad)
      ctx.fillRect(0, 0, 600, 800)

      // 2. 绘制散落的粉色爱心、黄色闪烁星星
      ctx.setFillStyle('rgba(255, 255, 255, 0.4)')
      // 爱心与星星
      ctx.setFontSize(22)
      ctx.fillText('✨', 90, 150)
      ctx.fillText('💖', 480, 130)
      ctx.fillText('✨', 100, 510)
      ctx.fillText('🌙', 490, 500)

      // 3. 梦幻白色双圆角边框
      ctx.setStrokeStyle('#ffffff')
      ctx.setLineWidth(3)
      drawRoundRect(ctx, 24, 24, 552, 752, 36)
      ctx.stroke()

      // 4. 顶部温馨小标语与日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#ffffff')
      ctx.setTextAlign('center')
      ctx.fillText(`🌈 — ROMANTIC UNICORN DREAM · ${props.dateStr} — 🌈`, 300, 95)

      // 5. 中间独角兽软萌云朵卡片
      ctx.setFillStyle('rgba(255, 255, 255, 0.85)')
      drawRoundRect(ctx, 60, 140, 480, 310, 30)
      ctx.fill()

      // 5.1 菜名 (软糯深粉色)
      ctx.setFontSize(54)
      ctx.setFillStyle('#D15B7C')
      ctx.fillText(props.result, 300, 240)

      // 5.2 彩虹糖
      ctx.setFontSize(26)
      ctx.fillText('🦄', 300, 305)

      // 5.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#D15B7C')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 365)
        ctx.fillText(line2, 300, 400)
      } else {
        ctx.fillText(phrase, 300, 380)
      }

      // 6. 白云、彩虹与独角兽
      ctx.setFontSize(26)
      ctx.fillText('🌈  ☁️  🎈', 300, 515)

      // 7. 底部甜美云朵太阳码盒
      ctx.setFillStyle('rgba(255, 255, 255, 0.65)')
      ctx.setStrokeStyle('#ffffff')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#D15B7C')
      ctx.fillText('“吃饱了饭，今晚会做一个粉色的梦哦 🌙”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#D15B7C')
      ctx.fillText('✨ 扫码搭乘独角兽专列 · 漫游棉花糖般甜滋滋的宇宙', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 20)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 26) {
      // 样式二十七：复古报纸广告风
      // 1. 泛黄牛皮纸背景底色
      ctx.setFillStyle('#EADBC8')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 报纸分割粗细黑条双边框
      ctx.setStrokeStyle('#1A1A1A')
      ctx.setLineWidth(4)
      drawRoundRect(ctx, 24, 24, 552, 752, 0)
      ctx.stroke()
      ctx.setLineWidth(1)
      drawRoundRect(ctx, 32, 32, 536, 736, 0)
      ctx.stroke()

      // 3. 顶部大版头 "DAILY EAT-EAT NEWS" 
      ctx.setFontSize(30)
      ctx.setFillStyle('#1A1A1A')
      ctx.setTextAlign('center')
      ctx.fillText('★ THE EAT-EAT DAILY NEWS ★', 300, 82)
      
      // 版面分隔细实线与日期
      ctx.setLineWidth(2)
      ctx.beginPath(); ctx.moveTo(32, 100); ctx.lineTo(568, 100); ctx.stroke()
      ctx.setFontSize(13)
      ctx.fillText(`VOL. 9982443 // EDITION NO. 1  //  ${props.dateStr}`, 300, 122)
      ctx.beginPath(); ctx.moveTo(32, 134); ctx.lineTo(568, 134); ctx.stroke()

      // 4. 中间版头大新闻插图框 (黑色波点网点或做旧报纸感觉)
      ctx.setStrokeStyle('#1A1A1A')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 60, 160, 480, 280, 0)
      ctx.stroke()

      // 4.1 菜品名称 (复古黑体大标)
      ctx.setFontSize(54)
      ctx.fillText(props.result, 300, 245)

      // 4.2 分割线
      ctx.setLineWidth(1)
      ctx.beginPath(); ctx.moveTo(200, 285); ctx.lineTo(400, 285); ctx.stroke()

      // 4.3 新闻内容 (治愈语录)
      ctx.setFontSize(18)
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 335)
        ctx.fillText(line2, 300, 370)
      } else {
        ctx.fillText(phrase, 300, 350)
      }

      // 5. 经典复古装饰标志
      ctx.setFontSize(26)
      ctx.fillText('🗞️  ☕  📰', 300, 490)

      // 6. 底部“剪切折价券”样式的太阳码区域
      // 绘制带剪切虚线 ✂️ 的二维码大边框
      ctx.setStrokeStyle('#1A1A1A')
      ctx.setLineWidth(2)
      ctx.setLineDash([6, 6]) // 虚线
      drawRoundRect(ctx, 40, 595, 520, 160, 0)
      ctx.stroke()
      ctx.setLineDash([]) // 重置为实线

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.fillText('“今日特大喜讯：这道菜被评为本周最具治愈力奖”', 65, 655)

      ctx.setFontSize(13)
      ctx.setFillStyle('#555555')
      ctx.fillText('✂️ 扫码凭此券兑换今日头条美味 · EAT-EAT PRESS', 65, 700)

      ctx.setFillStyle('#ffffff')
      ctx.setStrokeStyle('#1A1A1A')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 420, 615, 120, 120, 0)
      ctx.fill()
      ctx.stroke()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 27) {
      // 样式二十八：万盛惊魂怪兽趴
      // 1. 幽灵深紫与南瓜橘渐变背景
      const ghostGrad = ctx.createLinearGradient(0, 0, 0, 800)
      ghostGrad.addColorStop(0, '#1E0B36')
      ghostGrad.addColorStop(0.7, '#3A125E')
      ghostGrad.addColorStop(1, '#1A0630')
      ctx.setFillStyle(ghostGrad)
      ctx.fillRect(0, 0, 600, 800)

      // 2. 绘制散落的黄色小南瓜、黑蝙蝠与发光小幽灵
      ctx.setFontSize(24)
      ctx.fillText('🦇', 90, 130)
      ctx.fillText('👻', 490, 120)
      ctx.fillText('🦇', 500, 500)
      ctx.fillText('👻', 80, 490)

      // 橘色惊悚细边框
      ctx.setStrokeStyle('#E67E22')
      ctx.setLineWidth(2.5)
      drawRoundRect(ctx, 24, 24, 552, 752, 28)
      ctx.stroke()

      // 3. 顶部万圣鬼火文字与日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#E67E22')
      ctx.setTextAlign('center')
      ctx.fillText(`🎃 — SPOOKY MONSTER PARTY // ${props.dateStr} — 🎃`, 300, 95)

      // 4. 中间鬼怪怪兽大嘴卡片
      ctx.setFillStyle('rgba(230, 126, 34, 0.15)')
      ctx.setStrokeStyle('#E67E22')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 60, 150, 480, 310, 24)
      ctx.fill()
      ctx.stroke()

      // 4.1 菜名 (惊艳亮黄色)
      ctx.setFontSize(54)
      ctx.setFillStyle('#F1C40F')
      ctx.fillText(props.result, 300, 255)

      // 4.2 万圣小蝙蝠
      ctx.setFontSize(26)
      ctx.fillText('😈', 300, 315)

      // 4.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#ffffff')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 375)
        ctx.fillText(line2, 300, 410)
      } else {
        ctx.fillText(phrase, 300, 390)
      }

      // 5. 南瓜与巫师帽
      ctx.setFontSize(26)
      ctx.fillText('🎃  🧙‍♀️  🍭', 300, 520)

      // 6. 底部怪兽大嘴太阳码盒
      ctx.setFillStyle('rgba(26, 6, 48, 0.8)')
      ctx.setStrokeStyle('#E67E22')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#F1C40F')
      ctx.fillText('“生活有时候古古怪怪，但美食永远奇奇妙妙 👻”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.6)')
      ctx.fillText('✨ 扫码搭乘南瓜马车 · 一起加入深夜小恶魔的美食趴', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 16)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 28) {
      // 样式二十九：梦幻星云迷幻极光
      // 1. 深邃藏蓝到极光绿的三色复杂渐变背景
      const auroraGrad = ctx.createLinearGradient(0, 0, 600, 800)
      auroraGrad.addColorStop(0, '#0F2027')
      auroraGrad.addColorStop(0.5, '#203A43')
      auroraGrad.addColorStop(1, '#2C5364')
      ctx.setFillStyle(auroraGrad)
      ctx.fillRect(0, 0, 600, 800)

      // 2. 极光亮带与流星
      ctx.setFillStyle('rgba(0, 255, 196, 0.08)')
      ctx.beginPath()
      ctx.moveTo(0, 300)
      ctx.bezierCurveTo(200, 150, 400, 450, 600, 250)
      ctx.lineTo(600, 450)
      ctx.bezierCurveTo(400, 550, 200, 350, 0, 500)
      ctx.closePath()
      ctx.fill()

      // 星点
      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(14)
      ctx.fillText('✦', 120, 160)
      ctx.fillText('✦', 450, 140)
      ctx.fillText('✦', 510, 510)
      ctx.fillText('✦', 100, 480)

      // 极光青色细内框
      ctx.setStrokeStyle('#00FFC4')
      ctx.setLineWidth(2.5)
      drawRoundRect(ctx, 24, 24, 552, 752, 32)
      ctx.stroke()

      // 3. 顶部航天星轨标题与日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#00FFC4')
      ctx.setTextAlign('center')
      ctx.fillText(`✦ — NEBULA AURORA TRAVELER · ${props.dateStr} — ✦`, 300, 95)
      ctx.fillText('🌌 [ ORBIT DECODE DEEP SPACE ] 🌌', 300, 120)

      // 4. 中间发光星云解构盒
      ctx.setFillStyle('rgba(255, 255, 255, 0.12)')
      ctx.setStrokeStyle('#00FFC4')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 60, 150, 480, 310, 24)
      ctx.fill()
      ctx.stroke()

      // 4.1 菜名 (荧光青大字)
      ctx.setFontSize(54)
      ctx.setFillStyle('#00FFC4')
      ctx.fillText(props.result, 300, 255)

      // 4.2 恒星符号
      ctx.setFontSize(26)
      ctx.fillText('🌌', 300, 315)

      // 4.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#ffffff')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 375)
        ctx.fillText(line2, 300, 410)
      } else {
        ctx.fillText(phrase, 300, 390)
      }

      // 5. 极光星盘
      ctx.setFontSize(26)
      ctx.fillText('🛸  🔭  ☄️', 300, 520)

      // 6. 底部极光太阳码大盒
      ctx.setFillStyle('rgba(15, 32, 39, 0.9)')
      ctx.setStrokeStyle('#00FFC4')
      ctx.setLineWidth(1.5)
      drawRoundRect(ctx, 40, 595, 520, 160, 24)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#00FFC4')
      ctx.fillText('“跨越亿万光年的星河，只为与这道美味相遇 🌌”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('rgba(255, 255, 255, 0.65)')
      ctx.fillText('✨ 扫码接入引力波信号 · 测定这顿饭的宇宙常数', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 16)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else if (posterStyle === 29) {
      // 样式三十：浪漫巴黎街头午后
      // 1. 优雅法式米白底色
      ctx.setFillStyle('#F9F7F1')
      ctx.fillRect(0, 0, 600, 800)

      // 2. 底部极简的埃菲尔铁塔和路灯水彩线描
      ctx.setStrokeStyle('#E0D6C8')
      ctx.setLineWidth(1.5)
      ctx.beginPath()
      // 极简路灯和铁塔
      ctx.moveTo(80, 560); ctx.lineTo(80, 480) // 简易街灯杆
      ctx.moveTo(70, 480); ctx.lineTo(90, 480)
      ctx.moveTo(480, 560); ctx.lineTo(510, 450); ctx.lineTo(540, 560) // 极简铁塔塔尖
      ctx.stroke()

      // 绘制几瓣玫瑰花瓣
      ctx.setFontSize(24)
      ctx.fillText('🌸', 150, 520)
      ctx.fillText('🥖', 450, 510)

      // 3. 复古墨绿色优雅细内框
      ctx.setStrokeStyle('#2C5E43')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 24, 24, 552, 752, 16)
      ctx.stroke()

      // 4. 顶部法式手写英文字标与日期
      ctx.setFontSize(14)
      ctx.setFillStyle('#2C5E43')
      ctx.setTextAlign('center')
      ctx.fillText(`—  BON APPÉTIT  ·  PARIS AFTERNOON  —`, 300, 95)
      ctx.fillText(`SÉLECTION SPÉCIALE // ${props.dateStr}`, 300, 120)

      // 5. 中间法式下午茶墨绿底板
      ctx.setFillStyle('rgba(44, 94, 67, 0.06)')
      ctx.setStrokeStyle('#2C5E43')
      ctx.setLineWidth(1)
      drawRoundRect(ctx, 60, 150, 480, 310, 16)
      ctx.fill()
      ctx.stroke()

      // 5.1 菜名 (优雅墨绿字)
      ctx.setFontSize(54)
      ctx.setFillStyle('#2C5E43')
      ctx.fillText(props.result, 300, 255)

      // 5.2 咖啡店小圆棚
      ctx.setFontSize(26)
      ctx.fillText('☕', 300, 315)

      // 5.3 语录
      ctx.setFontSize(18)
      ctx.setFillStyle('#4A6B53')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 375)
        ctx.fillText(line2, 300, 410)
      } else {
        ctx.fillText(phrase, 300, 390)
      }

      // 6. 巴黎午后挂饰
      ctx.setFontSize(26)
      ctx.fillText('🗼  🚲  🎻', 300, 520)

      // 7. 底部墨绿色雕花框太阳码大盒
      ctx.setFillStyle('#ffffff')
      ctx.setStrokeStyle('#2C5E43')
      ctx.setLineWidth(2)
      drawRoundRect(ctx, 40, 595, 520, 160, 16)
      ctx.fill()
      ctx.stroke()

      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.setFillStyle('#2C5E43')
      ctx.fillText('“愿你的生活，如塞纳河畔的微风般从容惬意 🍃”', 70, 660)

      ctx.setFontSize(13)
      ctx.setFillStyle('#7D9B84')
      ctx.fillText('✨ 扫码落座巴黎街角 · 寻觅独属法式优雅的黄昏美味', 70, 705)

      ctx.setFillStyle('#ffffff')
      drawRoundRect(ctx, 420, 615, 120, 120, 12)
      ctx.fill()

      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 425, 620, 110, 110)
    } else {
      // 样式一：经典渐变
      // 1. 绘制渐变背景
      const grad = ctx.createLinearGradient(0, 0, 0, 800)
      grad.addColorStop(0, color || '#FF6B8B')
      grad.addColorStop(0.7, color ? color + 'ee' : '#FF5A79')
      grad.addColorStop(1, '#ffffff')
      ctx.setFillStyle(grad)
      ctx.fillRect(0, 0, 600, 800)
      
      // 2. 绘制半透明圆圈背景呼吸感点缀
      ctx.setFillStyle('rgba(255, 255, 255, 0.12)')
      ctx.beginPath()
      ctx.arc(500, 100, 180, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(80, 480, 120, 0, 2 * Math.PI)
      ctx.fill()
      
      // 3. 绘制场景标签
      const tagText = `${props.sceneIcon} ${props.sceneLabel}`
      ctx.setFillStyle('rgba(255, 255, 255, 0.25)')
      drawRoundRect(ctx, 40, 50, 130, 38, 19)
      ctx.fill()
      
      ctx.setFontSize(16)
      ctx.setFillStyle('#ffffff')
      ctx.setTextAlign('center')
      ctx.fillText(tagText, 105, 75)
      
      // 4. 绘制日期
      ctx.setFontSize(14)
      ctx.setFillStyle('rgba(255, 255, 255, 0.85)')
      ctx.setTextAlign('right')
      ctx.fillText(props.dateStr, 560, 75)
      
      // 5. 绘制选中的菜品大字 (带微弱发光阴影效果)
      ctx.setFontSize(56)
      ctx.setFillStyle('#ffffff')
      ctx.setTextAlign('center')
      ctx.shadowColor = 'rgba(0,0,0,0.1)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      ctx.fillText(props.result, 300, 260)
      ctx.shadowColor = 'transparent' // 重置阴影
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      
      // 6. 绘制白色分割线
      ctx.setStrokeStyle('rgba(255, 255, 255, 0.4)')
      ctx.setLineWidth(2)
      ctx.beginPath()
      ctx.moveTo(250, 310)
      ctx.lineTo(350, 310)
      ctx.stroke()
      
      // 7. 绘制治愈系推荐语录
      ctx.setFontSize(22)
      ctx.setFillStyle('rgba(255, 255, 255, 0.95)')
      ctx.setTextAlign('center')
      const phrase = props.phrase
      if (phrase.length > 14) {
        const line1 = phrase.slice(0, 13)
        const line2 = phrase.slice(13)
        ctx.fillText(line1, 300, 360)
        ctx.fillText(line2, 300, 400)
      } else {
        ctx.fillText(phrase, 300, 370)
      }
      
      // 8. 绘制底部白色高阶卡片块 (二维码区域)
      ctx.setFillStyle('#ffffff')
      ctx.shadowColor = 'rgba(0, 0, 0, 0.06)'
      ctx.shadowBlur = 24
      ctx.shadowOffsetY = 8
      drawRoundRect(ctx, 40, 600, 520, 160, 32)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      
      // 8.1 绘制底部卡片文字
      ctx.setTextAlign('left')
      ctx.setFontSize(18)
      ctx.setFillStyle('#2C3E50')
      ctx.fillText('“好好吃饭，是对生活最温柔的致敬”', 72, 672)
      
      ctx.setFontSize(13)
      ctx.setFillStyle('#95A5A6')
      ctx.fillText('✨ 扫码一起记录今日三餐 · EatEat', 72, 715)
      
      // 8.2 绘制右下角小程序二维码太阳码
      const qrCodePath = '/static/tabbar/stock2-active.png'
      ctx.drawImage(qrCodePath, 420, 620, 120, 120)
    }
    
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          destWidth: 1200,
          destHeight: 1600,
          success: (res) => {
            resolve(res.tempFilePath)
          },
          fail: (err) => {
            console.error('canvas 导出失败:', err)
            resolve('')
          }
        }, instance)
      }, 250)
    })
  })
}

defineExpose({
  draw
})
</script>

import { ref, computed } from 'vue'

export const themes = [
  { name: '温柔粉', color: '#FF8DA1', grad: 'linear-gradient(135deg, #FF9BB1 0%, #FF7DA8 100%)', light: '#FFF5F7', shadow: 'rgba(255,141,161,0.25)', borderLight: '#FF93B6' },
  { name: '清新绿', color: '#65D6AD', grad: 'linear-gradient(135deg, #81E4C1 0%, #65D6AD 100%)', light: '#F2FBF7', shadow: 'rgba(101,214,173,0.25)', borderLight: '#81E4C1' },
  { name: '雾霾蓝', color: '#83AFEF', grad: 'linear-gradient(135deg, #A4C6FB 0%, #83AFEF 100%)', light: '#F4F8FF', shadow: 'rgba(131,175,239,0.25)', borderLight: '#A4C6FB' },
  { name: '暖黄色', color: '#F9B976', grad: 'linear-gradient(135deg, #FDD096 0%, #F9B976 100%)', light: '#FFF6EE', shadow: 'rgba(249,185,118,0.25)', borderLight: '#FDD096' }
]

// 全局唯一的响应式 state，这样只要修改它其他引入此 hook 的页面都会刷新
const savedThemeName = uni.getStorageSync('activeThemeName') || '温柔粉'
const globalActiveTheme = ref(themes.find(t => t.name === savedThemeName) || themes[0])

export function useTheme() {
  const changeTheme = (themeName) => {
    const target = themes.find(t => t.name === themeName)
    if (target) {
      globalActiveTheme.value = target
      uni.setStorageSync('activeThemeName', themeName)
      
      // 更新底部 TabBar 选择状态颜色
      uni.setTabBarStyle({
        selectedColor: target.color
      })
      
      // 更新导航栏背景色（适配当前主题顶部渐变辅助色）
      // 注意：这只对当前或后续被展现的页面有效
      uni.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: target.light,
        animation: {
            duration: 300,
            timingFunc: 'easeIn'
        }
      })
    }
  }

  // 计算返回具体的 CSS Variables 对象供页面挂载
  const themeStyle = computed(() => {
    const t = globalActiveTheme.value
    return {
      '--theme-color': t.color,
      '--theme-grad': t.grad,
      '--theme-light': t.light,
      '--theme-shadow': t.shadow,
      '--theme-border-light': t.borderLight
    }
  })

  return {
    themes,
    currentTheme: globalActiveTheme,
    changeTheme,
    themeStyle
  }
}

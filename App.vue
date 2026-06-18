<script>
import familyApi from '@/common/api/family.js'

export default {
	onLaunch() {
		console.log("家庭小厨房启动啦")
		this.setTabTheme()

		// 1. 设备注册逻辑
		const deviceId = uni.getStorageSync('device_id') || ''
		const deviceSecret = uni.getStorageSync('device_secret') || ''

		console.log('设备ID:', deviceId)
		console.log('设备密钥:', deviceSecret)
		if (uni.getStorageSync('device_id') && uni.getStorageSync('')) return
		else if (!deviceId) {
			familyApi.registerDevice().then(res => {
				console.log('设备注册响应:', res)
				const data = res?.data || res
				if (data && data.device.deviceId && data.deviceSecret) {
					uni.setStorageSync('device_id', data.device.deviceId)
					uni.setStorageSync('device_secret', data.deviceSecret)
					console.log('设备注册成功，已缓存标识')
				}
			}).catch(err => {
				console.error('设备注册失败:', err)
			})
		}
	},
	onShow() {
		this.setTabTheme()
	},
	methods: {
		setTabTheme() {
			const themes = [
				{ name: '温柔粉', color: '#FF6B8B' },
				{ name: '清新绿', color: '#4DB88F' },
				{ name: '雾霾蓝', color: '#5B89E5' },
				{ name: '暖杏黄', color: '#F2A13B' }
			]
			const currentTheme = uni.getStorageSync('current_theme') || 0
			try {
				uni.setTabBarStyle({
					selectedColor: themes[currentTheme].color,
					fail: (err) => {
						// 优雅忽略在非TabBar页面（如独立欢迎首页welcome.vue）调用时的正常错误反馈
						console.log('非TabBar页面，自动跳过设置TabBar样式')
					}
				})
			} catch (e) {
				console.warn('非TabBar页面，跳过设置TabBar样式:', e)
			}
		}
	}
}
</script>

<style>
@import "@/static/icon_base64.css";
page {
	/* background-color: #FFE6E6; */
	background-color: #FFFFFF;
	font-family: PingFang SC, Helvetica Neue;
}
.card-cute {
	background: #fff;
	border-radius: 24rpx;
	box-shadow: 0 6rpx 18rpx rgba(255,192,192,0.2);
}
.btn-cute {
	background: #FFC0C0 !important;
	border-radius: 100rpx !important;
	color: #fff !important;
	border: none !important;
}
/* 全局隐藏所有滚动条，包括普通的 overflow 滚动条和 scroll-view 滚动条 */
::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
  color: transparent;
}
scroll-view ::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
  color: transparent;
}
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar { display: none !important; }
</style>
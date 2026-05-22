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
					// 2. 自动创建家庭
					this.createFamily()
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
			uni.setTabBarStyle({
				selectedColor: themes[currentTheme].color
			})
		},
		async createFamily() {
			const res = await familyApi.createFamily('快乐干饭小家~')
			console.log(res)
			if (res && res.data) {
				uni.setStorageSync('family_code', res.data.family.familyCode || 'default_family')
				uni.setStorageSync('family_role', res.data.member.role || 'owner')
				return true
			} else {
				// 隔一段时间在请求一次，直到成功为止
				setTimeout(() => {
					this.createFamily()
				}, 1000 * 5)
			}
		}, 
	}
}
</script>

<style>
page {
	background-color: #FFE6E6;
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
/* 全局样式文件 */
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
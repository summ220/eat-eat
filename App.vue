<script>
export default {
	onLaunch() {
		console.log("家庭小厨房启动啦")
		// 初始化分类配置
		const cats = uni.getStorageSync('ingredient_categories')
		if (!cats || cats.length === 0) {
			uni.setStorageSync('ingredient_categories', ['蔬菜', '水果', '肉蛋', '水产', '调料', '其他'])
		}
		this.setTabTheme()
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
		}
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
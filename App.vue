<script>
export default {
	onLaunch() {
		console.log("家庭小厨房启动啦")
		// 初始化分类配置
		const cats = uni.getStorageSync('ingredient_categories')
		if (!cats || cats.length === 0) {
			uni.setStorageSync('ingredient_categories', ['蔬菜', '水果', '肉蛋', '水产', '调料', '其他'])
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
</style>
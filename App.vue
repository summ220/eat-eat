<script>
import { useTheme } from './utils/theme.js'

export default {
	onLaunch() {
		console.log("家庭小厨房启动啦")
		// 初次加载时，应用对应的主题 tabBar 和 navBar 颜色
		const savedTheme = uni.getStorageSync('activeThemeName') || '温柔粉'
		const { changeTheme } = useTheme()
		changeTheme(savedTheme)
	}
}
</script>

<style>
page {
	background-color: #FAFAFA;
	font-family: "Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif;
}
</style>
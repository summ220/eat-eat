import { createSSRApp } from 'vue'
export function createApp() {
	const app = createSSRApp({
		onLaunch: function () {},
		onShow: function () {},
		onHide: function () {}
	})
	return { app }
}
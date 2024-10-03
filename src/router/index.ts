import {createRouter,createWebHistory} from 'vue-router'
import Home from '@/views/Home.vue';
import Calculator from '@/views/Calculator.vue';
import Manual from '@/views/Manual.vue';

const router = createRouter({
	history:createWebHistory(),
	routes:[
		{
			path: '/',
			redirect: '/home'
		},
		{
			path:'/home',
			component: Home
		},
		{
			path:'/calc',
			component: Calculator
		},
		{
			path: '/manual',
			component: Manual
		}
	]
})
export default router
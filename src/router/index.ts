import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
	history:createWebHistory(),
	routes:[
		{
			path: '/',
			redirect: '/home'
		},
		{
			name: 'home',
			path:'/home',
			component: () => import('@/views/Home.vue')
		},
		{
			name: 'calc',
			path:'/calc',
			redirect: '/calc/base',
			component: () => import('@/views/Calculator.vue'),
			children: [
				{
					name: 'base',
					path: 'base',
					component: () => import('@/views/calcs/BaseCalc.vue')
				},
				{
					name: 'invest',
					path: 'invest',
					component: () => import('@/views/calcs/InvestCalc.vue')
				},
				{
					name: 'circled-cashflow',
					path: 'circled-cashflow',
					component: () => import('@/views/calcs/CircledCashFlowCalc.vue')
				},
				{
					name: 'customed-cashflow',
					path: 'customed-cashflow',
					component: () => import('@/views/calcs/CustomedCashFlowCalc.vue')
				},
				{
					name: 'deposit',
					path: 'deposit',
					component: () => import('@/views/calcs/DepositCalc.vue')
				},
				{
					name: 'currency',
					path: 'currency',
					component: () => import('@/views/calcs/CurrencyCalc.vue')
				},
				{
					name: 'personal-tax',
					path: 'personal-tax',
					component: () => import('@/views/calcs/PersonalTaxCalc.vue')
				},
				{
					name: 'fiveone-tax',
					path: 'fiveone-tax',
					component: () => import('@/views/calcs/FiveOneTaxCalc.vue')
				},
			]
		},
		{
			name: 'manual',
			path: '/manual',
			redirect: '/manual/BaseCalc',
			component: () => import('@/views/Manual.vue'),
			children: [
				{
					name: 'BaseCalcManual',
					path: 'BaseCalc',
					component: () => import('@/views/manuals/BaseCalcManual.vue')
				},
				{
					name: 'cashFlowDoc',
					path: 'cashflow',
					component: () => import('@/views/manuals/cashFlowDoc.vue')
				},
				{
					name: 'TVMDoc',
					path: 'TVM',
					component: () => import('@/views/manuals/TVMDoc.vue')
				}
			]
		}
	]
})

export default router
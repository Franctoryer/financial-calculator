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
					component: () => import('@/views/calcs/BaseCalc.vue'),
					meta: {
						activeMenu: 'base'
					}
				},
				{
					name: 'invest',
					path: 'invest',
					component: () => import('@/views/calcs/InvestCalc.vue'),
					meta: {
						activeMenu: 'invest'
					}
				},
				{
					name: 'circled-cashflow',
					path: 'circled-cashflow',
					component: () => import('@/views/calcs/CircledCashFlowCalc.vue'),
					meta: {
						activeMenu: 'circled-cashFlow'
					}
				},
				{
					name: 'customed-cashflow',
					path: 'customed-cashflow',
					component: () => import('@/views/calcs/CustomedCashFlowCalc.vue'),
					meta: {
						activeMenu: 'customed-cashflow'
					}
				},
				{
					name: 'deposit',
					path: 'deposit',
					component: () => import('@/views/calcs/DepositCalc.vue'),
					meta: {
						activeMenu: 'deposit'
					}
				},
				{
					name: 'currency',
					path: 'currency',
					component: () => import('@/views/calcs/CurrencyCalc.vue'),
					meta: {
						activeMenu: 'currency'
					}
				},
				{
					name: 'personal-tax',
					path: 'personal-tax',
					component: () => import('@/views/calcs/PersonalTaxCalc.vue'),
					meta: {
						activeMenu: 'personal-tax'
					}
				},
				{
					name: 'fiveone-tax',
					path: 'fiveone-tax',
					component: () => import('@/views/calcs/FiveOneTaxCalc.vue'),
					meta: {
						activeMenu: 'fiveone-tax'
					}
				},
			]
		},
		{
			name: 'manual',
			path: '/manual',
			redirect: '/manual/base-calc',
			component: () => import('@/views/Manual.vue'),
			children: [
				{
					name: 'BaseCalcManual',
					path: 'base-calc',
					component: () => import('@/views/manuals/BaseCalcManual.vue'),
					meta: {
						activeMenu: 'BaseCalcManual'
					}
				},
				{
					name: 'cashFlowManual',
					path: 'cashflow-calc',
					component: () => import('@/views/manuals/CashFlowCalcManual.vue'),
					meta: {
						activeMenu: 'cashFlowManual'
					}
				},
				{
					name: 'investCalcManual',
					path: 'invest-calc',
					component: () => import('@/views/manuals/InvestCalcManual.vue'),
					meta: {
						activeMenu: 'investCalcManual'
					}
				},
				{
					name: 'setting-manual',
					path: 'setting-manual',
					component: () => import('@/views/manuals/SettingManual.vue'),
					meta: {
						activeMenu: 'setting-manual'
					}
				},
				{
					name: 'interest-method',
					path: 'interest-method',
					component: () => import('@/views/manuals/InterestMethodManual.vue'),
					meta: {
						activeMenu: 'interest-method'
					}
				},
				{
          name: 'personalTaxCalcManual',
					path: 'personalTaxCalcManual' ,
					component: () => import('@/views/manuals/PersonalTaxCalcManual.vue'),
					meta: {
						activeMenu: 'personalTaxCalcManual'
					}
				},
				{
          name: 'depositCalcManual',
					path: 'depositCalcManual' ,
					component: () => import('@/views/manuals/DepositCalcManual.vue'),
					meta: {
						activeMenu: 'depositCalcManual'
					}
				},
				{
          name: 'four-to-one',
					path: 'four-to-one' ,
					component: () => import('@/views/manuals/FourToOneManual.vue'),
					meta: {
						activeMenu: 'four-to-one'
					}
				},
			]
		}
	]
})

export default router
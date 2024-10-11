<template>
  <div class="slide-com">
      <n-menu
        v-model:value="activeMenu"
        :options="menuOptions"
        :indent="15"
        :collapsed-width="64"
        :collapsed-icon-size="30"
      />
  </div>
</template>

<script setup lang="ts">
  import type { MenuOption } from 'naive-ui';
  import { NMenu, NIcon } from 'naive-ui';
  import { h, ref, watch } from 'vue';
  import { RouterLink } from 'vue-router';
  import type { Component } from 'vue';
  // 一些图标
  import CashFlowIcon from '@/assets/icons/side-menu-icons/CashFlowIcon.vue';
  import BaseCalculator from '@/assets/icons/side-menu-icons/BaseCalculator.vue';
  import LoadAndInvestIcon from '@/assets/icons/side-menu-icons/LoadAndInvestIcon.vue';
  import DepositIcon from "@/assets/icons/side-menu-icons/DepositIcon.vue";
  import CurrencyIcon from "@/assets/icons/side-menu-icons/CurrencyIcon.vue"
  import TaxIcon from "@/assets/icons/side-menu-icons/TaxIcon.vue"
  import { useRoute } from "vue-router";
  import { getActiveMenu } from "@/utils/getActiveMenu";


  /**
   * 将SVG图标组件转化为VNode对象
   * @param icon SVG图标组件
   */
  function renderIcon(icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
  }

  const menuOptions: MenuOption[] = [
    {
      label: () => h(RouterLink, { to: { name: 'base'}}, { default: () => '科学计算器'}),
      key: 'base',
      icon: renderIcon(BaseCalculator)
    },
    {
      label: () => h(RouterLink, { to: { name: 'invest'}}, { default: () => '投资/贷款计算器'}),
      key: 'invest',
      icon: renderIcon(LoadAndInvestIcon)
    },
    {
      label: '现金流计算器',
      key: 'CashFlow',
      children: [
        {
          label: () => h(RouterLink, { to: { name: 'circled-cashflow'}}, { default: () => '周期性现金流'}),
          key: 'circled-cashFlow'
        },
        {
          label: () => h(RouterLink, { to: { name: 'customed-cashflow'}}, { default: () => '不规则现金流'}),
          key: 'customed-cashflow'
        }
      ],
      icon: renderIcon(CashFlowIcon)
    },
    {
      label: () => h(RouterLink, { to: { name: 'deposit'}}, { default: () => '储蓄计算器'}),
      key: 'deposit',
      icon: renderIcon(DepositIcon)
    },
    {
      label: () => h(RouterLink, { to: { name: 'currency'}}, { default: () => '货币汇率转化计算器'}),
      key: 'currency',
      icon: renderIcon(CurrencyIcon)
    },
    {
      label: '税务计算器',
      key: 'Tax',
      children: [
        {
          label: () => h(RouterLink, { to: { name: 'personal-tax'}}, { default: () => '个人所得税'}),
          key: 'personal-tax'
        },
        {
          label: () => h(RouterLink, { to: { name: 'fiveone-tax'}}, { default: () => '五险一金'}),
          key: 'fiveone-tax'
        }
      ],
      icon: renderIcon(TaxIcon)
    }
  ];
  const route = useRoute();
  
  // 使用 route.meta.activeMenu 作为默认值
  const activeMenu = ref(getActiveMenu(route.meta.activeMenu || null));

  // 监听路由变化，动态设置 activeMenu
  watch(
    () => route.meta.activeMenu,
    (newActiveMenu) => {
      activeMenu.value = getActiveMenu(newActiveMenu);
    }
  );
</script>

<style>
  .btn {
    margin-left: 8px;
  }
</style>

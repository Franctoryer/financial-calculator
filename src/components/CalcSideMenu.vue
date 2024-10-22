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
  import { NMenu, NIcon, useLoadingBar } from 'naive-ui';
  import { h, ref, watch } from 'vue';
  import { RouterLink } from 'vue-router';
  import type { Component } from 'vue';
  // 一些图标
  import { useRoute, useRouter } from "vue-router";
  import { getActiveMenu } from "@/utils/getActiveMenu";
  // @ts-ignore
  import { Calculator24Filled, ChartMultiple24Filled, BuildingGovernment24Filled } from "@vicons/fluent"
  import { Coins, Bitcoin, HandHoldingUsd } from "@vicons/fa"

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
      icon: renderIcon(Calculator24Filled)
    },
    {
      label: () => h(RouterLink, { to: { name: 'invest'}}, { default: () => '投资/贷款计算器'}),
      key: 'invest',
      icon: renderIcon(HandHoldingUsd)
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
      icon: renderIcon(ChartMultiple24Filled)
    },
    {
      label: () => h(RouterLink, { to: { name: 'deposit'}}, { default: () => '储蓄计算器'}),
      key: 'deposit',
      icon: renderIcon(Coins)
    },
    {
      label: () => h(RouterLink, { to: { name: 'currency'}}, { default: () => '货币汇率转化计算器'}),
      key: 'currency',
      icon: renderIcon(Bitcoin)
    },
    {
      label: '税务计算器',
      key: 'Tax',
      children: [
        {
          label: () => h(RouterLink, { to: { name: 'fiveone-tax'}}, { default: () => '五险一金'}),
          key: 'fiveone-tax'
        },
        {
          label: () => h(RouterLink, { to: { name: 'personal-tax'}}, { default: () => '个人所得税'}),
          key: 'personal-tax'
        },
      ],
      icon: renderIcon(BuildingGovernment24Filled)
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
  // 加载条
  const router = useRouter();
  const loadingBar = useLoadingBar();
  router.beforeEach(() => {
    loadingBar.start();
  })
  router.afterEach(() => {
    loadingBar.finish();
  })
</script>

<style>
  .btn {
    margin-left: 8px;
  }
</style>

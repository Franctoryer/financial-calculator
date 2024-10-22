
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
  import { NMenu } from 'naive-ui';
  import { h, ref, watch } from 'vue';
  import { RouterLink } from 'vue-router';
  import { useRoute } from "vue-router";
  import { getActiveMenu } from "@/utils/getActiveMenu";
  

  const menuOptions: MenuOption[] = [
    {
      label: () => h(RouterLink, { to: { name: 'BaseCalcManual'}}, { default: () => '科学计算器'}),
      key: 'BaseCalcManual',
    },
    {
      label: () => h(RouterLink, { to: { name: 'cashFlowManual'}}, { default: () => '现金流计算器'}),
      key: 'cashFlowManual',
    },
    {
      label: () => h(RouterLink, { to: { name: 'investCalcManual'}}, { default: () => '投资/贷款计算器'}),
      key: 'investCalcManual',
    },
    {
      label: () => h(RouterLink, { to: { name: 'personalTaxCalcManual'}}, { default: () => '个税计算器'}),
      key: 'personalTaxCalcManual',
    },
    {
      label: () => h(RouterLink, { to: { name: 'depositCalcManual'}}, { default: () => '储蓄计算器'}),
      key: 'depositCalcManual',
    },
    {
      label: () => h(RouterLink, { to: { name: 'interest-method'}}, { default: () => '计息方式介绍'}),
      key: 'interest-method',
    },
    {
      label: () => h(RouterLink, { to: { name: 'four-to-one'}}, { default: () => '知四求一介绍'}),
      key: 'four-to-one',
    },
    {
      label: () => h(RouterLink, { to: { name: 'setting-manual'}}, { default: () => '全局设置'}),
      key: 'setting-manual',
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

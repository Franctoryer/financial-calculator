
<template>
  <div class="slide-com">
      <n-menu
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
  import { h } from 'vue';
  import { RouterLink } from 'vue-router';
  

  const menuOptions: MenuOption[] = [
    {
      label: () => h(RouterLink, { to: { name: 'BaseCalcManual'}}, { default: () => '科学计算器'}),
      key: 'BaseCalc',
    },
    {
      label: () => h(RouterLink, { to: { name: 'cashFlowManual'}}, { default: () => '现金流计算器'}),
      key: 'CashFlow',
    },
    {
      label: () => h(RouterLink, { to: { name: 'investCalcManual'}}, { default: () => '投资/贷款计算器'}),
      key: 'TVM',
    },
    {
      label: () => h(RouterLink, { to: { name: 'setting-manual'}}, { default: () => '全局设置'}),
      key: 'Setting',
    },
    {
      label: () => h(RouterLink, { to: { name: 'interest-method'}}, { default: () => '计息方式介绍'}),
      key: 'interest-method',
    },
    {
      label: () => h(RouterLink, { to: { name: 'personalTaxCalcManual'}}, { default: () => '个税计算器'}),
      key: 'PersonalTax',
    },
    {
      label: () => h(RouterLink, { to: { name: 'depositCalcManual'}}, { default: () => '储蓄计算器'}),
      key: 'Deposit',
    }
  ];
</script>

<style>
  .btn {
    margin-left: 8px;
  }
</style>

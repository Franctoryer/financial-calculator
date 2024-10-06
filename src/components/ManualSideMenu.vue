
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
      label: () => h(RouterLink, { to: { name: 'base'}}, { default: () => '现金流计算器'}),
      key: 'CashFlow',
    },
    {
      label: () => h(RouterLink, { to: { name: 'invest'}}, { default: () => '投资/贷款计算器'}),
      key: 'LoadAndInvest',
    }
  ];
</script>

<style>
  .btn {
    margin-left: 8px;
  }
</style>

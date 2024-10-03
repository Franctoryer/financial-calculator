<template>
  <div class="slide-com">
    <n-button 
      @click="collapsed = !collapsed" 
      strong 
      ghost 
      type="tertiary" 
      class="btn"> {{ buttonText }}
    </n-button>
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <n-menu
        :options="menuOptions"
        :indent="12"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="30"
      />
    </n-layout-sider>
  </div>
</template>

<script setup lang="ts">
  import type { MenuOption } from 'naive-ui';
  import { NMenu, NIcon, NLayoutSider, NButton } from 'naive-ui';
  import { h, ref, computed } from 'vue';
  import type { Component } from 'vue';
  // 一些图标
  import CashFlowIcon from '../assets/icons/side-menu/CashFlowIcon.vue';
  import BaseCalculator from '../assets/icons/side-menu/BaseCalculator.vue';
  import LoadAndInvestIcon from '../assets/icons/side-menu/LoadAndInvestIcon.vue';

  /**
   * 将SVG图标组件转化为VNode对象
   * @param icon SVG图标组件
   */
  function renderIcon(icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
  }

  const collapsed = ref(true);
  const buttonText = computed(() => {
    return collapsed.value ? '展开' : '折叠';
  })
  const menuOptions: MenuOption[] = [
    {
      label: '基础',
      icon: renderIcon(BaseCalculator)
    },
    {
      label: '贷款/投资',
      children: [
        {
          label: '贷款'
        },
        {
          label: '投资'
        }
      ],
      icon: renderIcon(LoadAndInvestIcon)
    },
    {
      label: '现金流',
      children: [
        {
          label: '净现值'
        },
        {
          label: '内部收益率'
        }
      ],
      icon: renderIcon(CashFlowIcon)
    }
  ];
</script>

<style>
  .btn {
    margin-left: 8px;
  }
</style>

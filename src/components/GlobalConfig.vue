<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <MessageApi/>
      <slot></slot>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
  import { zhCN, dateZhCN, NConfigProvider } from 'naive-ui';
  import { NMessageProvider} from "naive-ui";
  import MessageApi from '@/components/MessageApi.vue';
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="theme">
    <n-message-provider>
      <MessageApi class="message"/>
      <slot></slot>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
  import { zhCN, dateZhCN, NConfigProvider } from 'naive-ui';
  import { NMessageProvider} from "naive-ui";
  import MessageApi from '@/components/MessageApi.vue';
  import { storeToRefs } from "pinia"
  import { useThemeStore } from "@/stores/themeStore";
  import { computed } from "vue";
  import { lightTheme, darkTheme } from "naive-ui";

  const { themeClass } = storeToRefs(useThemeStore());
  const theme = computed(() => themeClass.value === 'light-theme' ? lightTheme : darkTheme)
</script>

<style>
  .message {
    z-index: 9999;
    position: fixed;
  }
</style>
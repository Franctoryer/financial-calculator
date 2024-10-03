<template>
  <n-config-provider :theme="currentTheme">
    <n-card>
      <n-space>
        <n-button @click="currentTheme = darkTheme">深色</n-button>
        <n-button @click="currentTheme = null">浅色</n-button>
      </n-space>
    </n-card>
  </n-config-provider>
</template>

<script setup lang="ts">
  import { NConfigProvider, NCard, NSpace, NButton, darkTheme } from 'naive-ui';
  import { ref } from 'vue';
  import type { Ref } from "vue";
  import type { GlobalTheme } from "naive-ui";

  const currentTheme: Ref<GlobalTheme | null> = ref(null);
</script>
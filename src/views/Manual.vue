<template>
  <n-space vertical>
  <n-layout has-sider>
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
    >
      <ManualSideMenu/>
    </n-layout-sider>
    <n-layout>
     <RouterView></RouterView>
    </n-layout>
  </n-layout>
  </n-space>
</template>

<script setup lang="ts">
  import ManualSideMenu from "@/components/ManualSideMenu.vue";
  import { NSpace, NLayout, NLayoutSider, } from "naive-ui"
  import { RouterView } from "vue-router";

</script>

<style scoped>
  .main {
    margin-top: 30px;
  }

</style>

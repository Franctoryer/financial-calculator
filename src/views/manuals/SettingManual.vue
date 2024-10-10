<template>
  <div>
    <Doc :markdown-content="content"/>
  </div>
</template>

<script setup lang="ts">
  import Doc from "@/components/Doc.vue";

  const content = 
  `
  # 全局设置
  [[TOC]]
  
  `
</script>

<style>

</style>

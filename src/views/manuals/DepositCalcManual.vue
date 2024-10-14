<template>
    <div>
      <Doc :markdownContent="content"/>
    </div>
  </template>
  
  <script setup lang="ts">
    import Doc from "@/components/Doc.vue";
  
    const content = `
# 储蓄计算器
[[TOC]]
欢迎使用储蓄计算器！
本储蓄计算器


 `;

  
</script>

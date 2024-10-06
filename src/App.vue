<template>
  <div class="app">
    <GlobalConfig>
      <n-scrollbar style="max-height: 100vh;" content-style="overflow: hidden;">
        <Header/>
        <RouterView class="views"/>
      </n-scrollbar>
    </GlobalConfig>
  </div>
</template>

<script setup lang="ts">
  import GlobalConfig from '@/components/GlobalConfig.vue';
  import Header from '@/components/Header.vue';
  import { RouterView } from 'vue-router';
  import { NScrollbar } from "naive-ui";
</script>

<style>
  @import '../public/main.css';
  .views {
    margin-top: 80px;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  
</style>

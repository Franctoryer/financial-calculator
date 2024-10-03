<template>
  <div class="app">
    <GlobalConfig>
      <Header/>
      <RouterView class="view"/>
    </GlobalConfig>
  </div>
</template>

<script setup lang="ts">
  import GlobalConfig from './components/GlobalConfig.vue';
  import Header from '@/components/Header.vue';
  import { RouterView } from 'vue-router';
</script>

<style scoped>
  .side-menu {
    margin-top: 70px;
  }
  .view {
    margin-top: 100px;
  }
</style>

<template>
  <div class="app">
    <GlobalConfig>
      <Header/>
      <RouterView class="views"/>
    </GlobalConfig>
  </div>
</template>

<script setup lang="ts">
  import GlobalConfig from '@/components/GlobalConfig.vue';
  import Header from '@/components/Header.vue';
  import { RouterView } from 'vue-router';
  import { NBackTop } from "naive-ui";
</script>

<style>
  @import '../public/main.css';
  .views {
    margin-top: 80px;
  }

</style>

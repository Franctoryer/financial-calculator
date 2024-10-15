<template>
  <div :class="`app ${themeClass}`">
    <GlobalConfig>
      <!-- 滚轮 -->
      <n-scrollbar style="max-height: 100vh;" content-style="overflow: hidden;">
        <!-- 跳转到顶部 -->
        <n-back-top :bottom="100" :visibility-height="300">
         <n-icon size="25">
            <ArrowExportUp24Regular/>
          </n-icon>
        </n-back-top>
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
  import { NScrollbar, NBackTop, NIcon } from "naive-ui";
  // @ts-ignore
  import { ArrowExportUp24Regular } from "@vicons/fluent";
  import { storeToRefs } from "pinia"
  import { useThemeStore } from "@/stores/themeStore";

  const { themeClass } = storeToRefs(useThemeStore());

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

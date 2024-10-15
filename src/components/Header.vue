<template>
  <header :class="`header ${themeClass}`">
    <router-link to="/home" class="header-title" @click="handleRedirect1">
      <TitleIcon class="title-icon"/> 金融计算器
    </router-link>
    <div class="tabs">
      <router-link to="/home" class="tab" @click="handleRedirect1">
        <n-icon :component="Home12Filled" :size="20" class="tab-icon"/> 首页
      </router-link>
      <router-link to="/calc" class="tab" @click="handleRedirect2">
        <n-icon :component="Calculator24Filled" :size="20" class="tab-icon"/> 计算器
      </router-link>
      <router-link to="/manual" class="tab" @click="handleRedirect3">
        <n-icon :component="BookCompass24Filled" :size="20" class="tab-icon"/> 使用手册
      </router-link>
    </div>
    <div class="tabs others">
      <n-switch v-model:value="isDark" :round="false" class="theme-btn">
        <template #checked-icon>
          <n-icon :component="WeatherSunny24Regular" />
        </template>
        <template #unchecked-icon>
          <n-icon :component="WeatherSunnyLow24Filled" />
        </template>
      </n-switch>
      <a :href="PROJ_URL" class="tab" target="_blank">
        <n-icon :component="Github" :size="20" class="tab-icon"/> Github
      </a>
      <div class="tab" @click="active = !active">
        <n-icon :component="LauncherSettings24Filled" :size="20" class="tab-icon"/> 设置
      </div>
    </div>
    <n-drawer v-model:show="active" :width="350" placement="right">
      <n-drawer-content title="全局设置">
        <Setting/>
      </n-drawer-content>
    </n-drawer>
  </header>
</template>

<script setup lang="ts">
  import TitleIcon from "@/assets/icons/head-tabs-icons/TitleIcon.vue";
  import { PROJ_URL } from '@/constants/globalConfig';
  import { MESSAGE_CONFIG } from '@/constants/messageConfig';
  import { ALREADY_AT_HOME } from "@/constants/message";
  import { ALREADY_AT_CALCULATOR } from "@/constants/message";
  import { ALREADY_AT_MANUAL } from "@/constants/message";
  import { ref, watchEffect } from "vue";
  import Setting from "@/components/Setting.vue";
  import { NDrawer, NDrawerContent, NSwitch, NIcon } from "naive-ui";
  import { storeToRefs } from "pinia"
  import { useThemeStore } from "@/stores/themeStore";
  // @ts-ignore
  import { WeatherSunnyLow24Filled, WeatherSunny24Regular, Home12Filled, Calculator24Filled, BookCompass24Filled, LauncherSettings24Filled } from "@vicons/fluent";
  import { Github } from "@vicons/fa";
  
  const active = ref(false);
  const { themeClass, isDark } = storeToRefs(useThemeStore());

  const handleRedirect1 = (event: MouseEvent): void => {
    if (window.location.pathname === '/home') {
      window.$message.info(ALREADY_AT_HOME, MESSAGE_CONFIG)
    }
  }
  const handleRedirect2 = (event: MouseEvent): void => {
    if (window.location.pathname === '/calc') {
      window.$message.info(ALREADY_AT_CALCULATOR, MESSAGE_CONFIG)
    }
  }
  const handleRedirect3 = (event: MouseEvent): void => {
    if (window.location.pathname === '/manual') {
      window.$message.info(ALREADY_AT_MANUAL, MESSAGE_CONFIG)
    }
  }
</script>

<style scoped>
.dark-theme {
  --header-background-color: rgb(25, 25, 25);
  --header-title-color: white;
  --tab-color: white;
  --tab-hover-background-color: #242424;
  --tab-highlight-border-bottom: 2px solid #2a947d;
  --header-box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
}

.light-theme {
  --header-background-color: white;
  --header-title-color: #333;
  --tab-color: black;
  --tab-hover-background-color: #f0f0f0;
  --tab-highlight-border-bottom: 2px solid #007bff;
  --header-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header {
  background-color: var(--header-background-color);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  box-shadow: var(--header-box-shadow);
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  white-space: nowrap;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--header-title-color);
  display: flex;
  justify-content: center;
  text-decoration: none;
}

.tabs {
  display: flex;
  justify-content: center; /* Center tabs */
  align-items: center;
  height: 60px; /* Adjust the height as needed */
}

.tab {
  color: var(--tab-color);
  text-decoration: none;
  padding: 0 15px;
  display: flex;
  height: 100%;
  display: flex;
  font-size: medium;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.tab:hover {
  background-color: var(--tab-hover-background-color);
}

/* Add active tab styling if you have a way to track active tab */
.tab.router-link-active {
  border-bottom: var(--tab-highlight-border-bottom);
}
.tab-icon {
  margin-right: 5px;
}
.title-icon {
  margin-right: 5px;
}
.others {
  margin-right: 5%;
}

.theme-btn {
  margin-right: 10px;
}
</style>
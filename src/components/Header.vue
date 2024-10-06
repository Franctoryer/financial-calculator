<template>
  <header class="header">
    <router-link to="/home" class="header-title" @click="handleRedirect1">
      <TitleIcon class="title-icon"/> 金融计算器
    </router-link>
    <div class="tabs">
      <router-link to="/home" class="tab" @click="handleRedirect1">
        <HomeIcon class="tab-icon"/> 首页
      </router-link>
      <router-link to="/calc" class="tab" @click="handleRedirect2">
        <CalcIcon class="tab-icon"/> 计算器
      </router-link>
      <router-link to="/manual" class="tab" @click="handleRedirect3">
        <ManualIcon class="tab-icon"/> 使用手册
      </router-link>
    </div>
    <div class="tabs others">
      <a :href="PROJ_URL" class="tab" target="_blank">
        <GithubIcon class="tab-icon"/> Github
      </a>
      <div class="tab" @click="active = !active">
        <SettingIcon class="tab-icon"/> 设置
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
  import HomeIcon from '@/assets/icons/head-tabs-icons/HomeIcon.vue';
  import CalcIcon from '@/assets/icons/head-tabs-icons/CalcIcon.vue';
  import ManualIcon from '@/assets/icons/head-tabs-icons/ManualIcon.vue';
  import GithubIcon from '@/assets/icons/head-tabs-icons/GithubIcon.vue';
  import SettingIcon from '@/assets/icons/head-tabs-icons/SettingIcon.vue';
  import { PROJ_URL } from '@/constants/globalConfig';
  import { MESSAGE_CONFIG } from '@/constants/messageConfig';
  import { ALREADY_AT_HOME } from "@/constants/message";
  import { ALREADY_AT_CALCULATOR } from "@/constants/message";
  import { ALREADY_AT_MANUAL } from "@/constants/message";
  import { ref } from "vue";
  import Setting from "@/components/Setting.vue";
  import { NDrawer, NDrawerContent } from "naive-ui";

  const active = ref(false);
  /**
   * 若重复点击首页各链接，显示提示
   * @param event 点击事件
   */

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
.header {
  background-color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  color: #333;
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
  color: black;
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
  background-color: #f0f0f0;
}

/* Add active tab styling if you have a way to track active tab */
.tab.router-link-active {
  border-bottom: 2px solid #007bff;
}
.tab-icon {
  margin-right: 5px;
}
.title-icon {
  margin-right: 5px;
}
.others {
  margin-right: 0;
}
</style>
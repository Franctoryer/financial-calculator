<template>
  <header class="header">
    <div class="header-title">
      <TitleIcon class="title-icon"/> 金融计算器
    </div>
    <div class="tabs">
      <router-link to="/home" class="tab">
        <HomeIcon class="tab-icon"/> 首页
      </router-link>
      <router-link to="/calc" class="tab">
        <CalcIcon class="tab-icon"/> 计算器
      </router-link>
      <router-link to="/manual" class="tab">
        <ManualIcon class="tab-icon"/> 使用手册
      </router-link>
      <a href="https://github.com" class="tab" target="_blank">
        <GithubIcon class="tab-icon"/> Star
      </a>
    </div>
  </header>
</template>

<script setup lang="ts">
  import TitleIcon from "@/assets/icons/head-tabs-icons/TitleIcon.vue";
  import HomeIcon from '@/assets/icons/head-tabs-icons/HomeIcon.vue';
  import CalcIcon from '@/assets/icons/head-tabs-icons/CalcIcon.vue';
  import ManualIcon from '@/assets/icons/head-tabs-icons/ManualIcon.vue';
  import GithubIcon from '@/assets/icons/head-tabs-icons/GithubIcon.vue';
</script>

<style scoped>
.header {
  background-color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: flex;
  justify-content: center;
}

.tabs {
  display: flex;
  justify-content: center; /* Center tabs */
  margin-left: auto;
  margin-right: auto; /* Push tabs to the right */
  align-items: center;
  height: 60px; /* Adjust the height as needed */
}

.tab {
  color: black;
  text-decoration: none;
  padding: 0 15px;
  display: block;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>
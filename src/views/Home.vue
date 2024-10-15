<template>
  <div class="main">
    <div :class="isDark ? 'slogan-dark-theme' : 'slogan-light-theme'">
      一键计算，财富增长
    </div>
  </div>
</template>

<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import { useThemeStore } from "@/stores/themeStore";

  const { themeClass, isDark } = storeToRefs(useThemeStore());
</script>

<style scoped>
.slogan-light-theme {
  width: 100%;
  font-size: 30px;
  text-align: center;
  font-weight: bold;
  margin-top: 30vh;
}
.slogan-dark-theme {
  color:aliceblue;
  width: 100%;
  font-size: 30px;
  text-align: center;
  font-weight: bold;
  margin-top: 30vh;
}
</style>

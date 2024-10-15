<template>
  <div :class="`main ${themeClass}`">
    <div class="save-time"><b>{{ saveTime }}</b></div>
    <n-tag :bordered="false" type="info" size="small" class="calc-name"> {{ calcName }} </n-tag>
    <div class="input-data">{{ inputData }}</div>
    <div class="result-data">{{ resultData }}</div>
  </div>
</template>

<script setup lang="ts">
  import { NTag } from "naive-ui";
  import { storeToRefs } from "pinia"
  import { useThemeStore } from "@/stores/themeStore";

  defineProps(['saveTime', 'calcName', 'inputData', 'resultData'])
  const { themeClass } = storeToRefs(useThemeStore());
</script>

<style scoped>
.light-theme {
  --main-background-color: rgb(250, 250, 250);
  --main-hover-background-color: rgb(231, 231, 231);
}

.dark-theme {
  --main-background-color: #1f1f1f;
  --main-hover-background-color: #3f3f3f;
}
.main {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: 20px 30px;
  border-radius: 1cap;
  margin-left: 10px;
  margin-right: 10px;
  margin: 5px 10px 5px 10px;
  justify-items: center;
  align-items: center;
  padding: 5px;
  background-color: var(--main-background-color);
  cursor: pointer;
  width: 100%;
}

.main:hover {
  background-color: var(--main-hover-background-color);
}

.save-time {
  font-size: medium;
}

.input-data {
  font-size: smaller;
  color: #858688;
  white-space: nowrap; /* 保持文本在一行内 */
  overflow: hidden; /* 隐藏溢出的内容 */
  text-overflow: ellipsis; /* 用省略号表示溢出的内容 */
  width: 90%;
  text-align: center;
}

.result-data {
  font-size: smaller;
  color: #858688;
  white-space: nowrap; /* 保持文本在一行内 */
  overflow: hidden; /* 隐藏溢出的内容 */
  text-overflow: ellipsis; /* 用省略号表示溢出的内容 */
  width: 90%;
  text-align: center;
}
</style>

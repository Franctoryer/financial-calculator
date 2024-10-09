<template>
  <div class="main">
    <div class="save-time"><b>{{ saveTime }}</b></div>
    <n-tag :bordered="false" type="info" size="small" class="calc-name"> {{ calcName }} </n-tag>
    <div class="input-data">{{ inputData }}</div>
    <div class="result-data">{{ resultData }}</div>
  </div>
</template>

<script setup lang="ts">
  import { NTag } from "naive-ui";
  defineProps(['saveTime', 'calcName', 'inputData', 'resultData'])
</script>

<style scoped>
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
  background-color: rgb(250, 250, 250);
  cursor: pointer;
}

.save-time {
  font-size: medium;
}

.input-data {
  font-size: smaller;
  color: #858688
}

.result-data {
  font-size: smaller;
  color: #858688
}
</style>

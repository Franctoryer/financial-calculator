<template>
  <div class="main">
    <div class="save-time"><b>{{ saveTime }}</b></div>
    <div class="calc-name"><b>{{ calcName }}</b></div>
    <div class="input-data">{{ inputData }}</div>
    <div class="output-data">{{ outputData }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps(['saveTime', 'calcName', 'inputData', 'outputData'])
</script>

<style scoped>
.main {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: 20px 30px;
  border-radius: 1cap;
  margin-left: 10px;
  margin-right: 10px;
  justify-items: center;
  align-items: center;
  padding: 5px;
  background-color: rgb(250, 250, 250);
  cursor: pointer;
}

.save-time {
  font-size: medium;
}
.calc-name {
  color: #ba5140;
}

.input-data {
  font-size: smaller;
}

.output-data {
  font-size: smaller;
}
</style>

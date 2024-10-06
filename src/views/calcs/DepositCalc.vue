<template>
  <div class="temp">
    <n-space :size="50">
      <!-- 计算目标 -->
      <n-space align="left" vertical :size="0">
        <div class="option-title"> 计算目标：</div>
        <n-radio-group v-model:value="objective">
          <n-radio-button value="all"> 本金 </n-radio-button>
          <n-radio-button value="parent"> 本利和 </n-radio-button>
          <n-radio-button value="child"> 利率 </n-radio-button>
        </n-radio-group>
      </n-space>
    </n-space>
  </div>
</template>

<script setup>
  import { NRadioGroup, NRadioButton, NSpace } from 'naive-ui';
  import { ref } from "vue";

  const precison = ref(5);
</script>

<style scoped>
  .temp {
    border: 2px solid black;
    border-radius: 1cap;
    width: 80%;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 800;
    margin: auto;
  }
  .option-title {
    font-size: small;
    color: rgb(138, 137, 137);
    font-weight: 400;
  }
</style>

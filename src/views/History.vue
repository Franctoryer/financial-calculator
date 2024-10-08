<template>
  <div class="main">
    <div class="title-container">
      <n-icon :size="25">
        <History16Regular/>
      </n-icon>
      <div class="title">历史记录</div>
    </div> 
      <HistoryElement 
      :saveTime="saveTime"
      :calcName="calcName"
      :inputData="inputData"
      :outputData="outputData"
      @click="restoreCalculation"
    />
  </div>
</template>

<script setup lang="ts">
  import HistoryElement from "@/components/HistoryElement.vue";
  import History16Regular from "@vicons/fluent/History16Regular";
  import { NIcon } from "naive-ui";
  import { useRouter } from "vue-router";

  let saveTime = '1分钟前';
  let calcName = '周期性现金流';
  let inputData = '贴现率:12%; 分期复利';
  let outputData = 'NPV:321; IRR:32%';
  let input = {
    interest: 0.12,
    isContinueCompound: true,
    rawData: [
      {
        order: 1,
        cash: 1213,
        freq: 2
      }
    ]
  }
  const router = useRouter();
  const restoreCalculation = () => {
    router.push({
      name: 'circled-cashflow',
      query: {
        inputData: JSON.stringify(input)
      }
    });
  }
</script>

<style>
.title-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 10px;
  font-size: large;
  font-weight: 800;
  margin-bottom: 10px;
}

.title {
  margin-left: 3px;
}
</style>

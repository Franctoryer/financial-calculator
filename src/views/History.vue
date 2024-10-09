<template>
  <div class="main">
    <div class="title-container">
      <n-icon :size="25">
        <History16Regular/>
      </n-icon>
      <div class="title">历史记录</div>
    </div> 
    <n-button @click="historyStore.deleteAllHistory" class="delete-all-btn" type="error" secondary>删除所有记录</n-button>
    <div class="history-container">
      <n-divider dashed/>
      <n-scrollbar style="max-height: 100vh">
        <n-empty description="没有任何记录" v-if="historyData.length === 0" class="nothing"></n-empty>
        <HistoryElement 
          v-for="data in historyData"
          :key="data.key"
          :saveTime="formatTimestamp(data.saveTime)"
          :calcName="getCalcByPathName(data.name)"
          :inputData="objectToString(data.inputData)"
          :resultData="objectToString(data.resultData)"
          @click="restoreCalculation(data)"
        />
      </n-scrollbar>
      <n-divider dashed/>
    </div>
  </div>
</template>

<script setup lang="ts">
  import HistoryElement from "@/components/HistoryElement.vue";
  import History16Regular from "@vicons/fluent/History16Regular";
  import { NIcon, NButton, NScrollbar, NEmpty, NDivider } from "naive-ui";
  import { useRouter } from "vue-router";
  import { useHistoryStore } from "@/stores/historyStore";
  import { storeToRefs } from "pinia";
  import type { HistoryData } from "@/types/HistoryData";
  import { getCalcByPathName } from "@/utils/getCalcByPathName";
  import { objectToString } from "@/utils/objectToString";
  import { formatTimestamp } from "@/utils/formatTimeStamp"

  const historyStore = useHistoryStore();
  const { historyData } = storeToRefs(historyStore);

  const router = useRouter();
  const restoreCalculation = (item: HistoryData) => {
    router.push({
      name: item.name,
      query: {
        inputData: JSON.stringify(item.inputData),
        resultData: JSON.stringify(item.resultData)
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

.history-container {
  display: flex;
  flex-direction: column;
}

.delete-all-btn {
  margin-left: 10px;
}

</style>

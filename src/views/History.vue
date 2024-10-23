<template>
  <div class="main">
    <div class="title-container">
      <n-icon :size="25" @click="refreshPage" style="cursor: pointer;">
        <History16Regular/>
      </n-icon>
      <div class="title">历史记录</div>
    </div>
    <div class="delete-container">
      <n-icon @click="isDeleting = !isDeleting" :size="25" class="delete-icon">
        <Delete20Filled/>
      </n-icon>
      <transition name="fade">
        <n-button 
          v-if="isDeleting"
          @click="historyStore.deleteAllHistory" 
          class="delete-all-btn" 
          type="error" 
          secondary>
          删除所有记录
        </n-button>
      </transition>
    </div>
    <div class="history-container">
      <div class="total-num">
        <span class="sum">{{ historyDataView.length }} 条记录：</span>
        <n-select size="small" 
          :options="tagOptions" 
          v-model:value="tagFilter"
          class="filter"
        />
      </div>
      <n-scrollbar style="max-height: 100vh" y-placement="left">
        <n-empty description="没有任何记录" v-if="historyDataView.length === 0" class="nothing"></n-empty>
        <div v-for="(data, index) in historyDataView" class="history-element">
          <n-icon v-if="isDeleting" :size="20" @click="historyStore.deleteOneHistory(data.index)" class="delete-one">
            <DismissCircle28Regular/>
          </n-icon>
          <n-popover 
            trigger="hover" 
            placement="left-start" 
            style="max-width: 500px; min-width: 300px;"
          >
            <template #trigger>
              <HistoryElement 
                :key="data.saveTime"
                :saveTime="formatTimestamp(data.saveTime)"
                :calcName="getCalcByPathName(data.name)"
                :inputData="translateToChinese(data.inputData)"
                :resultData="translateToChinese(data.resultData)"
                @click="restoreCalculation(data)"
              />
            </template>
            <template #header>
              <div class="history-header">
                <b class="history-time">{{ standardTimeStamp(data.saveTime) }}</b>
                <n-tag type="info" size="small"> {{ getCalcByPathName(data.name) }}</n-tag>
              </div>
            </template>
            <div class="pop-content">
              <div class="pop-content-element"><b>输入：</b>{{ translateToChinese(data.inputData) }}</div>
              <div class="pop-content-element"><b>输出：</b>{{ translateToChinese(data.resultData) }}</div>
            </div>
            <div class="pop-footer">{{ index + 1 }}/{{ historyData.length }}</div>
          </n-popover>
        </div>
      </n-scrollbar>
      <n-divider dashed/>
    </div>
  </div>
</template>

<script setup lang="ts">
  import HistoryElement from "@/components/HistoryElement.vue";
  import History16Regular from "@vicons/fluent/History16Regular";
  import DismissCircle28Regular from "@vicons/fluent/DismissCircle28Regular";
  import Delete20Filled from "@vicons/fluent/Delete20Filled";
  import { NIcon, NButton, NScrollbar, NEmpty, NDivider, NSelect, NPopover, NTag } from "naive-ui";
  import { useRouter } from "vue-router";
  import { useHistoryStore } from "@/stores/historyStore";
  import { storeToRefs } from "pinia";
  import type { HistoryData } from "@/types/HistoryData";
  import { getCalcByPathName } from "@/utils/getCalcByPathName";
  import { standardTimeStamp } from "@/utils/standardTimeStamp";
  import { translateToChinese } from "@/utils/translateToChinese";
  import { formatTimestamp } from "@/utils/formatTimeStamp"
  import { ref, computed } from "vue";
  import { getHistoryByTag } from '@/utils/historyDataFilter';

  const historyStore = useHistoryStore();
  const { historyData } = storeToRefs(historyStore);
  const isDeleting = ref(false);
  const tagFilter = ref("all");

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

  const refreshPage = () => {
    const currentUrl = window.location.href;
    // 获取当前URL的路径部分
    const baseUrl = currentUrl.split('?')[0];
    // 刷新页面，使用路径部分作为新的URL
    window.location.href = baseUrl;
  }
  // 选择标签菜单
  const tagOptions = [
    {
      label: '全部',
      value: 'all'
    },
    {
      label: '科学计算器',
      value: 'base'
    },
    {
      label: '投资/贷款计算器',
      value: 'invest'
    },
    {
      label: '周期性现金流',
      value: 'circled-cashflow'
    },
    {
      label: '不规则现金流',
      value: 'customed-cashflow'
    },
    {
      label: '储蓄计算器',
      value: 'deposit'
    },
    {
      label: '货币汇率转化',
      value: 'currency'
    },
    {
      label: '个人所得税',
      value: 'personal-tax'
    },
    {
      label: '五险一金',
      value: 'fiveone-tax'
    }
  ]
  //@ts-ignore
  const historyDataView = computed(() => getHistoryByTag(historyData.value, tagFilter.value))
</script>

<style scoped>
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
 /*设置动画*/
 .fade-enter {
  transform: translateX(-60%);
  opacity: 0;
}

.fade-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.fade-enter-active {
  transition: all 0.3s ease;
}

.fade-leave {
  transform: translateX(0);
  opacity: 1;
}

.fade-leave-to {
  transform: translateX(-60%);
  opacity: 0;
}

.fade-leave-active {
  transition: all 0.3s ease;
}

.total-num {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  white-space: nowrap; /* 保持文本在一行内 */
}

.sum {
  font-size: medium;
  font-weight: bold;
}
.history-element {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
}

.delete-icon {
  cursor: pointer;
}
.delete-icon:hover {
  color: #c12c1f;
}

.delete-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 10px;
  height: 30px;
}

.delete-one {
  color: rgb(159, 159, 159);
  margin-left: 10px;
  cursor: pointer;
  position: absolute;
  right: 5%;
  top: 15%;
}
.delete-one:hover {
  color: #c35c5d;
}

.history-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 95%;
}

.pop-content-element {
  margin-bottom: 3px;
}

.pop-footer {
  font-size: smaller;
  margin-left: auto;
  margin-right: auto;
  color: grey;
  text-align: center;
}

.filter {
  width: 150px;
}
</style>

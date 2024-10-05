<template>
  <div class="main">
    <n-space vertical class="interest">
      贴现率：
      <n-slider v-model:value="interest" :step="0.05" :max="1" :min="0"/>
      <n-input-number v-model:value="interest" size="small" :step="0.05" :max="1" :min="0"/>
    </n-space>
    <n-button @click="addRow" color="#6e9bc5"> 增加行 </n-button>
    <n-button @click="deleteRow" color="#ba5b49">删除行</n-button>
    <n-data-table :columns="columns" :data="displayData" striped :pagination="{ pageSize: 5 }"/>
    <!-- <pre>{{ JSON.stringify(cashFlowData, null, 2) }}</pre> -->
    <div class="result">
    净现值：{{ npv }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { NDataTable, NInputNumber, NButton, NSpace, NSlider} from 'naive-ui';
  import { ref, h, computed } from 'vue';
  import { parseCurrency, formatCurrency } from "@/constants/InputNumber";
  import type { DataTableColumns } from 'naive-ui'
  import type { Ref, ComputedRef } from 'vue';
  import type { CCFRowDataRaw, CCFRowData } from '@/types/CCFData';
  import { useSettingStore } from "@/stores/settingStore";
  import { storeToRefs } from "pinia";
  import { Finance } from 'financejs';
  const { timeUnitText } = storeToRefs(useSettingStore());

  const interest = ref(0.1);
  // 原始数据，和表格输入绑定的数据
  const rawData: Ref<CCFRowDataRaw[]> = ref([
    {
      order: 1,
      cash: 1000,
      freq: 1
    }
  ])
  // 表格上展示的数据
  const displayData = computed(() => {
    let sumTime = 0;
    let result = [];
    for (let item of rawData.value) {
      if (item.freq <= 1) {
        result.push({order: `第${sumTime}${timeUnitText.value}`, cash: item.cash, freq: item.freq})
        sumTime += item.freq;
      } else {
        let oldSumTime = sumTime;
        sumTime += item.freq;
        result.push({order: `第${oldSumTime} ~ ${sumTime}${timeUnitText.value}`, cash: item.cash, freq: item.freq})
      }
    }
    return result;
  })
  // 现金流数据，计算需要的数据
  const cashFlowData: ComputedRef<number[]> = computed(() => rawData.value.flatMap(item => Array(item.freq).fill(item.cash)))
  const createColumns = (): DataTableColumns<CCFRowData> => [
      {
        title: '时间',
        key: 'order'
      },
      {
        title: '现金流入/支出',
        key: 'cash',
        render(row, index) {
          return h(NInputNumber, {
            value: row.cash,
      //     format: formatCurrency,
      //      parse: parseCurrency,
            step: 1000,
            min: -Infinity,
            onUpdateValue(v) {
              rawData.value[index].cash = v !== null && v !== undefined ? v : 0;
            }
          })
        }
      },
      {
        title: '频数',
        key: 'freq',
        render(row, index) {
          return h(NInputNumber, {
            value: row.freq,
            validator: (x: number) => x >= 1 && x <= 200,
            onUpdateValue(v) {
              rawData.value[index].freq = v || 0
            }
          })
        }
      }
  ]
  const columns = createColumns();
  // 增加表格行数
  const addRow = () => {
    let len = rawData.value.length;
    rawData.value.push({
      order: len,
      cash: 1000,
      freq: 1
    })
  }
  const deleteRow = () => {
    rawData.value.pop();
  }

  // 计算净现值
  const finance = new Finance();
  const npv = computed(() => {
    if (cashFlowData.value.length === 0) {
      return 0;
    } else if (cashFlowData.value.length === 1) {
      return cashFlowData.value[0];
    } else {
      return finance.NPV(interest.value*100, cashFlowData.value[0], ...cashFlowData.value.slice(1))
    }
  });
</script>

<style scoped>
  .main {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
  }
  .interest {
    margin-bottom: 20px;
    width: 50%;
  }

  .result {
    margin: 10px;
    font-size: medium;
    font-weight: 700;
  }
</style>
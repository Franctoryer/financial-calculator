<template>
  <div class="main">
    <div class="options">
      <div class="option">
        金额数：
        <n-input-number v-model:value="money">
          <template #suffix>
            {{ getCurrencySymbol(fromCurrency) }}
          </template>
        </n-input-number>
      </div>
      <div class="option">
        从：
        <n-select :options="currencyOptions" v-model:value="fromCurrency"/>
      </div>
      <div class="option">
        到：
        <n-select :options="currencyOptions" v-model:value="toCurrency"/>
      </div>
      <n-button color="#3271ae" @click="calculateResult">转化</n-button>
    </div>
    <n-divider/>
    <n-table>
      <thead>
        <tr>
          <th>转换金额数</th>
          <th>汇率</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ Number(resultMoney).toFixed(precision) }} {{ getCurrencySymbol(toCurrency) }}</td>
          <td>{{ exchangeRate }}</td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>

<script setup lang="ts">
  import { NInputNumber, NSelect, NTable, NDivider, NButton } from "naive-ui";
  import { getCurrencySymbol } from "@/utils/getCurrencyFlag";
  import { storeToRefs } from "pinia"
  import { onMounted, watch} from "vue"
  import { useCurrencyInputStore } from "@/stores/input/CurrencyInputStore"
  import { useCurrencyResultStore } from "@/stores/result/CurrencyResultStore"
  import { useSettingStore } from "@/stores/settingStore";
  import { BAD_REQUEST } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import type { HistoryData } from "@/types/HistoryData";
  import { useHistoryStore } from "@/stores/historyStore";
  import { useRoute } from "vue-router";

  const currencyOptions = [
    {
      label: '美元',
      value: 'USD'
    },
    {
      label: '欧元',
      value: 'EUR'
    },
    {
      label: '英镑',
      value: 'GBP'
    },
    {
      label: '日元',
      value: 'JPY'
    },
    {
      label: '瑞士法郎',
      value: 'CHF'
    },
    {
      label: '加元',
      value: 'CAD'
    },
    {
      label: '澳元',
      value: 'AUD'
    },
    {
      label: '人民币',
      value: 'CNY'
    },
    {
      label: '印度卢比',
      value: 'INR'
    },
    {
      label: '俄罗斯卢布',
      value: 'RUB'
    },
    {
      label: '巴西雷亚尔',
      value: 'BRL'
    },
    {
      label: '南非兰特',
      value: 'ZAR'
    },
    {
      label: '墨西哥比索',
      value: 'MXN'
    },
    {
      label: '新加坡元',
      value: 'SGD'
    },
    {
      label: '港元',
      value: 'HKD'
    },
    {
      label: '新西兰元',
      value: 'NZD'
    },
    {
      label: '韩元',
      value: 'KRW'
    }
  ];
  const { money, fromCurrency, toCurrency } = storeToRefs(useCurrencyInputStore());
  const { resultMoney, exchangeRate } = storeToRefs(useCurrencyResultStore())
  const { precision } = storeToRefs(useSettingStore());

  // 计算结果
  const calculateResult = async () => {
    try {
      const url = `https://api.frankfurter.app/latest?from=${fromCurrency.value}&to=${toCurrency.value}`;url
      const res = await fetch(url, { method: 'GET' });
      const jsonData = await res.json();
      exchangeRate.value = jsonData["rates"][`${toCurrency.value}`]
      resultMoney.value = exchangeRate.value * money.value;
      addHistory();
    } catch {
      window.$message.error(BAD_REQUEST, MESSAGE_CONFIG);
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@
  // 添加历史记录
  // @@@@@@@@@@@@@@@@@@@@@@@@
  const historyStore = useHistoryStore();
  const addHistory = () => {
    let history: HistoryData = {
      saveTime: Date.now(),
      name: 'currency',
      inputData: {
        money: money.value,
        fromCurrency: fromCurrency.value,
        toCurrency: toCurrency.value
      },
      resultData: {
        resultMoney: resultMoney.value,
        exchangeRate: exchangeRate.value
      }
    } 
    historyStore.addHistory(history);
  }
  const route = useRoute();
  onMounted(() => {
    handleHistoryRoute();
  });
  // 在当前页面回滚历史数据
  watch(route, () => {
    handleHistoryRoute();
  })
  // 回滚历史数据
  const handleHistoryRoute = () => {
    if (route.query.inputData && route.query.resultData) {
      let inputData = JSON.parse(route.query.inputData as string)
      let resultData = JSON.parse(route.query.resultData as string)
      money.value = inputData.money;
      fromCurrency.value = inputData.fromCurrency;
      toCurrency.value = inputData.toCurrency;
      resultMoney.value = inputData.resultMoney;
      exchangeRate.value = inputData.exchangeRate;
    }
  }
</script>

<style scoped>
  .main {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
  }

  .options {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: end;
  }
  .option {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
  }

  th {
    text-align: center;
    font-weight: bold;
  }
  td {
    text-align: center;
    width: 50%;
  }
</style>

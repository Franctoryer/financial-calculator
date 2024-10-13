<template>
  <div class="main">
      <div class="head">
        <div class="head-option">
          计算目标：
          <n-radio-group v-model:value="objective">
            <n-radio-button value="PV">
              PV
            </n-radio-button>
            <n-radio-button value="FV">
              FV
            </n-radio-button>
            <n-radio-button value="PMT">
              PMT
            </n-radio-button>
            <n-radio-button value="I/Y">
              I/Y
            </n-radio-button>
            <n-radio-button value="N">
              N
            </n-radio-button>
          </n-radio-group>
        </div>
        <n-button color="#3271ae" @click="calculate">计算</n-button>
      </div>
    <div class="options">
      <div class="row">
        <div class="option">
          现值（PV）：
          <n-input-number 
            :disabled="objective == 'PV'" 
            :placeholder="objective == 'PV' ? '计算目标' : '请输入'"
            v-model:value="PV"
          >
          <template #suffix>
            {{ currencySymbol }}
          </template>
        </n-input-number>
        </div>
        <div class="option">
          终值（FV）：
          <n-input-number 
            :disabled="objective == 'FV'" 
            :placeholder="objective == 'FV' ? '计算目标' : '请输入'"
            v-model:value="FV"
          >
          <template #suffix>
            {{ currencySymbol }}
          </template>
        </n-input-number>
        </div>
        <div class="option">
          每期付款/收益（PMT）：
          <n-input-number 
            :disabled="objective == 'PMT'" 
            :placeholder="objective == 'PMT' ? '计算目标' : '请输入'"
            v-model:value="PMT"
          >
          <template #suffix>
            {{ currencySymbol }}
          </template>
        </n-input-number>
        </div>
      </div>
      <div class="row">
        <div class="option">
          贴现率（I/Y）：
          <n-input-number 
            :disabled="objective == 'I/Y'" 
            :placeholder="objective == 'I/Y' ? '计算目标' : '请输入'"
            v-model:value="I_Y"
          >
          <template #suffix>
            %
          </template>
        </n-input-number>
        </div>
        <div class="option">
          期数（N）：
          <n-input-number 
            :disabled="objective == 'N'" 
            :placeholder="objective == 'N' ? '计算目标' : '请输入'"
            v-model:value="N"
          >
          <template #suffix>
            {{ timeUnitText }}
          </template>
        </n-input-number>
        </div>
      </div> 
    </div>
    <n-table class="result-table">
      <thead>
        <tr>
          <th class="result-column">{{ objectiveText }}</th>
          <th>总利息</th>
          <th>所有定期支付的总和</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="result-column">{{ objectiveResult.toFixed(precision) }} {{ resultSymbol }}</td>
          <td> {{ allInterest.toFixed(precision) }} {{ currencySymbol }} </td>
          <td> {{ allPmt.toFixed(precision) }} {{ currencySymbol }} </td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>

<script setup lang="ts">
  import { NRadioGroup, NRadioButton, NInputNumber, NButton, NTable } from "naive-ui";
  import { onMounted, watch, computed } from "vue";
  import { storeToRefs } from "pinia";
  import { useSettingStore } from "@/stores/settingStore";
  import { useInvestInputStore } from "@/stores/input/InvestInputStore"
  import { useInvestResultStore } from "@/stores/result/InvestResultStore"
  import { calculatePV, calculateFV, calculatePMT, calculateN, calculateIY } from "@/utils/TVM";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import type { HistoryData } from "@/types/HistoryData";
  import { useHistoryStore } from "@/stores/historyStore";
  import { useRoute } from "vue-router";
  // 获取全局设置信息
  const { timeUnitText, precision, currencySymbol, timeMode } = storeToRefs(useSettingStore());
  // 输入数据
  const { objective, PV, FV, PMT, I_Y, N, objectiveText } = storeToRefs(useInvestInputStore());
  // 结果数据
  const { objectiveResult, allInterest, allPmt } = storeToRefs(useInvestResultStore());
  const resultSymbol = computed(() => {
    switch (objective.value) {
      case 'PV':
        return currencySymbol.value;
      case 'FV':
        return currencySymbol.value;
      case 'PMT':
        return currencySymbol.value;
      case 'I/Y':
        return "%";
      case 'N':
        return timeUnitText.value;
      default:
        return "";
    }
  });
  const isDue = computed(() => timeMode.value === 'BGN')
  // 计算方法
  const calculate = () => {
    calculateResult();
    calculateAllPmt();
    calculateAllInterest();
    addHistory();
  }
  // 计算结果
  const calculateResult = () => {
    if (FV.value === null && objective.value !== "FV") {
      window.$message.error("请输入终值（FV）", MESSAGE_CONFIG)
      return;
    }
    if (PV.value === null && objective.value !== "PV") {
      window.$message.error("请输入现值（PV）", MESSAGE_CONFIG)
      return;
    }
    if (N.value === null && objective.value !== "N") {
      window.$message.error("请输入期数（N）", MESSAGE_CONFIG)
      return;
    }
    if (PMT.value === null && objective.value !== "PMT") {
      window.$message.error("请输入每期付款/投资（PMT）", MESSAGE_CONFIG)
      return;
    }
    if (I_Y.value === null && objective.value !== "I/Y") {
      window.$message.error("请输入贴现率（I/Y）", MESSAGE_CONFIG)
      return;
    }
    switch (objective.value) {
      case 'PV':
        // @ts-ignore
        objectiveResult.value = calculatePV(FV.value, PMT.value, I_Y.value, N.value, isDue.value);
        break;
      case 'FV':
        // @ts-ignore
        objectiveResult.value = calculateFV(PV.value, PMT.value, I_Y.value, N.value, isDue.value);
        break;
      case 'PMT':
        // @ts-ignore
        objectiveResult.value = calculatePMT(PV.value, FV.value, I_Y.value, N.value, isDue.value);
        break;
      case 'I/Y':
        // @ts-ignore
        objectiveResult.value = calculateIY(PV.value, FV.value, PMT.value, N.value, isDue.value);
        break;
      case 'N':
        // @ts-ignore
        objectiveResult.value = calculateN(PV.value, FV.value, PMT.value, I_Y.value, isDue.value);
        break;
    }
  };
  // 计算所有定期支付总和
  const calculateAllPmt = () => {
    if (objective.value === "PMT") {
      // @ts-ignore
      allPmt.value = N.value * objectiveResult.value;
    } else {
      // @ts-ignore
      allPmt.value = PMT.value * N.value;
    }
  }
  // 计算所有利息
  const calculateAllInterest = () => {
    let pv: any = PV.value;
    let fv: any = FV.value;
    let pmt: any = PMT.value;
    let n: any = N.value;
    switch (objective.value) {
      case "PV":
        pv = objectiveResult.value;
        break;
      case "FV":
        fv = objectiveResult.value;
        break;
      case "PMT":
        pmt = objectiveResult.value;
        break;
      case "N":
        n = objectiveResult.value;
        break;
    }

    allInterest.value = -(pv + fv + pmt * n);
  }
  // 每次更改计算目标，结果归零
  watch(objective, (newVal) => {
    objectiveResult.value = 0;
    allInterest.value = 0;
    allPmt.value = 0;
    switch (newVal) { 
      case "PV":
        PV.value = null;
        break;
      case "FV":
        FV.value = null;
        break;
      case "PMT":
        PMT.value = null;
        break;
      case "I/Y":
        I_Y.value = null;
        break;
      case "N":
        N.value = null;
        break;
    }
  })

  // 添加历史记录
  const historyStore = useHistoryStore();
  const addHistory = () => {
    let history: HistoryData = {
      saveTime: Date.now(),
      name: 'invest',
      inputData: {
        objective: objective.value,
        FV: FV.value,
        PV: PV.value,
        PMT: PMT.value,
        I_Y: I_Y.value,
        N: N.value,
      },
      resultData: {
        objectiveResult: objectiveResult.value.toFixed(precision.value),
        allInterest: allInterest.value.toFixed(precision.value),
        allPmt: allPmt.value.toFixed(precision.value),
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
      objective.value = inputData.objective;
      PV.value = inputData.PV;
      FV.value = inputData.FV;
      PMT.value = inputData.PMT;
      I_Y.value = inputData.I_Y;
      N.value = inputData.N;
      objectiveResult.value = resultData.objectiveResult;
      allInterest.value = resultData.allInterest;
      allPmt.value = resultData.allPmt;
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
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  border: 2px solid rgb(225, 225, 225);
  padding: 15px;
  border-radius: 1cap;
}
.option {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 5px;
  width: 100%;
}

.head-option {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 5px;
  font-weight: bold;
}
.row {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.head {
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  align-items: flex-end;
}

.result-table {
  width: 100%;
  margin-top: 30px;
}

td {
  text-align: center;
  width: 33.33%;
}

th {
  text-align: center;
}

.result-column {
  font-weight: bold;
}
</style>

<template>
  <n-space vertical class="deposit-calc-container">

    <!-- 存款种类 -->
    <n-space vertical>
      <div class="label-and-icon">
        <label>存款种类：</label>
        <n-icon 
          :component="BookSearch24Regular" 
          :size="20" @click="isDeposit = true" 
          :depth="3"
          v-if="isQkDocLkup"
          class="doc-icon"
        >
        </n-icon>
      </div>
      <n-modal 
        :show="isDeposit"
        size="huge"
        style="width: 80%;"
        preset="card"
        @update:show="handleModalShowChange"
      >
        <n-scrollbar style="max-height: 60vh" trigger="none">
          <DepositCalcManual class="modal-content"/>
        </n-scrollbar>
      </n-modal>
      <n-select v-model:value="depositCategory" size="medium" :options="depositOptions" placeholder="选择存款种类"
        class="select" />
    </n-space>
    <!-- 期限种类 -->
    <n-space vertical v-if="showTermType1">
      <label>存款期限：</label>
      <n-select v-model:value="termType" :options="termOptions1" size="medium" />
    </n-space>

    <n-space vertical v-if="showTermType2">
      <label>存款期限：</label>
      <n-select v-model:value="termType" :options="termOptions2" size="medium" />
    </n-space>

    <n-space vertical v-if="showTermType3">
      <label>存款期限：</label>
      <n-space :wrap="false">
        <div>
          <n-space align="center" :wrap="false"><n-input-number v-model:value="year" :show-button="false" />年</n-space>
        </div>
        <div>
          <n-space align="center" :wrap="false"><n-input-number v-model:value="month" :show-button="false" />月</n-space>
        </div>
        <div>
          <n-space align="center" :wrap="false"><n-input-number v-model:value="day" :show-button="false" />日</n-space>
        </div>
      </n-space>
    </n-space>
    <div class="options">
      <!-- 初始储蓄金额输入框 -->
      <div class="option">
        <div v-if="isDividedDeposit">
          每月存入金额：
        </div>
        <div v-if="!isDividedDeposit">
          初始储蓄金额：
        </div>
          <n-input-number v-model:value="initialDeposit" :min="0" :step="100" size="medium" placeholder="请输入金额"
            :show-button="false">
            <template #suffix>
              {{ currencySymbol }}
            </template>
          </n-input-number>
        </div>

      <!-- 计算按钮 -->
      <div class="btns">
        <n-button @click="deleteAll" type="error" strong secondary>全部清除</n-button>
        <n-button @click="onClickCalculate" type="info" strong secondary>计算</n-button>
      </div>

    </div>
    
    <n-divider/>
    <n-table>
      <thead>
        <tr>
          <th>年利率</th>
          <th v-if="isFetchInterest">每月利息</th>
          <th>总利息</th>
          <th>最终储蓄金额</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td :class="tableClass">{{ interestRateView.number }} %  </td>
          <td v-if="isFetchInterest" :class="tableClass">{{ monthlyInterestView.number }} {{ currencySymbol }}</td>
          <td :class="tableClass">{{ interestView.number }} {{ currencySymbol }}</td>
          <td :class="tableClass">{{ finalDepositView.number }} {{ currencySymbol }}</td>
        </tr>
      </tbody>
    </n-table>
  </n-space>
</template>

<script setup lang="ts">
import { NSelect, NInputNumber, NSpace, NButton, NDivider, NTable, NIcon, NModal, NScrollbar } from 'naive-ui';
import { ref, watch, computed, onMounted, reactive } from "vue";
import { NO_MORE_CLICK } from "@/constants/message";
import { MESSAGE_CONFIG } from "@/constants/messageConfig";
import { storeToRefs } from 'pinia';
import { useDepositInputStore } from "@/stores/input/DepositInputStore"
import { useDepositResultStore } from "@/stores/result/DepositResultStore"
import { calculateInterestRate } from '@/utils/depositUtils';
import { useSettingStore } from '@/stores/settingStore';
import type { HistoryData } from "@/types/HistoryData";
import { useHistoryStore } from "@/stores/historyStore";
import { useRoute } from "vue-router"
import gsap from "gsap";
// @ts-ignore
import {  BookSearch24Regular } from '@vicons/fluent';
import DepositCalcManual from '../manuals/DepositCalcManual.vue';
import { debounce, throttle } from 'lodash';

//节流状态变量
let isThrottling = false;
const { precision, currencySymbol, isQkDocLkup } = storeToRefs(useSettingStore());
const { initialDeposit, depositCategory, termType, year, month, day, } = storeToRefs(useDepositInputStore());
const { interestRate, interest, termMonths, finalDeposit, } = storeToRefs(useDepositResultStore());
const monthlyInterest = ref(0);
const depositOptions = [
  { label: '选择存款方式', value: '选择存款方式' },
  { label: '活期', value: '活期' },
  { label: '定活两便', value: '定活两便' },
  { label: '存本取息', value: '存本取息' },
  { label: '整存整取', value: '整存整取' },
  { label: '零存整取', value: '零存整取' }
];

const termOptions1 = ref([
  { label: '选择存款期限', value: '选择存款期限' },
  { label: '三个月', value: '三个月' },
  { label: '半年', value: '半年' },
  { label: '一年', value: '一年' },
  { label: '二年', value: '二年' },
  { label: '三年', value: '三年' },
  { label: '五年', value: '五年' }
]);

const termOptions2 = ref([
  { label: '选择存款期限', value: '选择存款期限' },
  { label: '一年', value: '一年' },
  { label: '三年', value: '三年' },
  { label: '五年', value: '五年' }
]);

const showTermType1 = computed(() => depositCategory.value === '整存整取')
const showTermType2 = computed(() => depositCategory.value === '存本取息' || depositCategory.value === '零存整取')
const showTermType3 = computed(() => depositCategory.value === '活期' || depositCategory.value === '定活两便')
const isDividedDeposit = computed(() => depositCategory.value === '零存整取')
const isFetchInterest = computed(() => depositCategory.value === '存本取息')

// 计算利息和最终存款金额的函数
const calculateSavings = () => {
  calculateInterestRate();

  // 计算总利息和最终存款金额
  if (['零存整取'].includes(depositCategory.value)) {
    interest.value = initialDeposit.value * interestRate.value / 100 * termMonths.value / 12 * (0.5 + 6 * termMonths.value / 12)
    finalDeposit.value = initialDeposit.value * termMonths.value + interest.value;
  } else {
    interest.value = (initialDeposit.value * interestRate.value / 100 * termMonths.value) / 12;
    finalDeposit.value = initialDeposit.value + interest.value;
    if (['存本取息'].includes(depositCategory.value)) {
      monthlyInterest.value = interest.value / termMonths.value;
    }
  }
  //精确输出
  interest.value = Number(interest.value.toFixed(precision.value));
  monthlyInterest.value = Number(monthlyInterest.value.toFixed(precision.value));
  finalDeposit.value = Number(finalDeposit.value.toFixed(precision.value));
  addHistory()
};

      //节流处理 
const throttledCalculate = throttle(() => {
calculateSavings();
 resetThrottlingState();
},
1000,{trailing: false});

const resetThrottlingState = () => {
    setTimeout(() => {
        isThrottling = false;
    }, 1000);
};

const onClickCalculate = () => {
  if(isThrottling){
    window.$message.error(NO_MORE_CLICK,MESSAGE_CONFIG);
  }else{
    isThrottling = true;
    throttledCalculate();
  }
}

const deleteAll = () => {
  depositCategory.value = '选择存款方式'; initialDeposit.value = 0; termType.value = '选择存款期限',
    interestRate.value = 0, interest.value = 0, finalDeposit.value = 0, year.value = 0,
    month.value = 0, day.value = 0, termMonths.value = 0, monthlyInterest.value = 0
}

const historyStore = useHistoryStore();
  // @@@@@@@@@@@@@@@@@@@@@@@@
  // 添加历史记录
  // @@@@@@@@@@@@@@@@@@@@@@@@
  const addHistory = () => {
    let history: HistoryData = {
      saveTime: Date.now(),
      name: 'deposit',
      inputData: {
        initialDeposit: initialDeposit.value,
        depositCategory: depositCategory.value,
        termType: termType.value,
        year: year.value,
        month: month.value,
        day: day.value
      },
      resultData: { 
        interestRate: interestRate.value,
        interest: interest.value,
        monthlyInterest: monthlyInterest.value,
        finalDeposit: finalDeposit.value
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
      initialDeposit.value = inputData.initialDeposit;
      depositCategory.value = inputData.depositCategory;
      termType.value = inputData.termType;
      year.value = inputData.year;
      month.value = inputData.month;
      day.value = inputData.day;
      interestRate.value = resultData.interestRate;
      interest.value = resultData.interest;
      monthlyInterest.value = resultData.monthlyInterest;
      finalDeposit.value = resultData.finalDeposit;
    }
  }

  // 添加数字变化特效
  const interestRateView = reactive({
    number: interestRate.value
  })
  const interestView = reactive({
    number: interest.value
  })
  const monthlyInterestView = reactive({
    number: monthlyInterest.value
  })
  const finalDepositView = reactive({
    number: finalDeposit.value
  })

  watch(interest, (newVal, oldVal) => {
    // 如果旧值或者新值是NAN，没有动画
    if (Number.isNaN(newVal) || Number.isNaN(oldVal)) {
      interestView.number = newVal;
      return;
    }
    gsap.to(interestView, { 
      duration: 0.5, 
      number: newVal,
      onUpdate: () => {
        // 在动画过程中格式化数字
        interestView.number = Number(interestView.number.toFixed(precision.value));
      }
    });
  })
  watch(interestRate, (newVal, oldVal) => {
    // 如果旧值或者新值是NAN，没有动画
    if (Number.isNaN(newVal) || Number.isNaN(oldVal)) {
      interestRateView.number = newVal;
      return;
    }
    gsap.to(interestRateView, { 
      duration: 0.5, 
      number: newVal,
      onUpdate: () => {
        // 在动画过程中格式化数字
        interestRateView.number = Number(interestRateView.number.toFixed(precision.value));
      }
    });
  })
  watch(monthlyInterest, (newVal, oldVal) => {
     // 如果旧值或者新值是NAN，没有动画
    if (Number.isNaN(newVal) || Number.isNaN(oldVal)) {
      monthlyInterestView.number = newVal;
      return;
    }
    gsap.to(monthlyInterestView, { 
      duration: 0.5, 
      number: newVal,
      onUpdate: () => {
        // 在动画过程中格式化数字
        monthlyInterestView.number = Number(monthlyInterestView.number.toFixed(precision.value));
      }
    });
  })
  watch(finalDeposit, (newVal, oldVal) => {
     // 如果旧值或者新值是NAN，没有动画
    if (Number.isNaN(newVal) || Number.isNaN(oldVal)) {
      finalDepositView.number = newVal;
      return;
    }
    gsap.to(finalDepositView, { 
      duration: 0.5, 
      number: newVal,
      onUpdate: () => {
        // 在动画过程中格式化数字
        finalDepositView.number = Number(finalDepositView.number.toFixed(precision.value));
      }
    });
  })

  // 调节表格间距
  const tableClass = computed(() => isFetchInterest.value ? 'four-col' : 'three-col');

  // 添加文档速查
  const isDeposit = ref(false);
  const handleModalShowChange = (value: any) => {
    isDeposit.value = value;
  };
</script>

<style scoped>
.deposit-calc-container {
  width: 70%;
  margin: 0 auto;
  padding: 20px;
  border-width: 20px;
  /* border-color: black;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); */
}


.btns {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;  
}
.option {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
}


.three-col {
  --width: 33.33%;
}
.four-col {
  --width: 25%;
}
td {
  text-align: center;
  width: var(--width);
}
th {
  text-align: center;
  font-weight: bold;
}

.doc-icon {
  cursor: pointer;
}

.label-and-icon {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}
</style>

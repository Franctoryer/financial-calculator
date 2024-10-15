<template>
  <n-space vertical class="deposit-calc-container">

    <!-- 存款种类 -->
    <n-space vertical>
      <label>存款种类：</label>
      <n-select v-model:value="depositCategory" size="medium" :options="depositOptions" placeholder="选择存款种类"
        class="select" />
    </n-space>
    <!-- 期限种类 -->
    <n-space vertical v-if="showTermType1">
      <label>存款期限：</label>
      <n-select v-model:value="termType" :options="termOptions1" size="large" />
    </n-space>

    <n-space vertical v-if="showTermType2">
      <label>存款期限：</label>
      <n-select v-model:value="termType" :options="termOptions2" size="large" />
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
        <n-button @click="calculateSavings" type="info" strong secondary>计算</n-button>
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
          <td>{{ interestRate }} %  </td>
          <td v-if="isFetchInterest">{{ monthlyInterest }} {{ currencySymbol }}</td>
          <td>{{ interest }} {{ currencySymbol }}</td>
          <td>{{ finalDeposit }} {{ currencySymbol }}</td>
        </tr>
      </tbody>
    </n-table>
  </n-space>
</template>

<script setup lang="ts">
import { NSelect, NInputNumber, NSpace, NButton, NDivider, NTable } from 'naive-ui';
import { ref, watch } from "vue";
import { storeToRefs } from 'pinia';
import { useDepositInputStore } from "@/stores/input/DepositInputStore"
import { useDepositResultStore } from "@/stores/result/DepositResultStore"
import { calculateInterestRate } from '@/utils/depositUtils';
import { useSettingStore } from '@/stores/settingStore';

const { timeUnitText, precision, isCompound, isDisplayInfo, currencySymbol } = storeToRefs(useSettingStore());
const { initialDeposit, depositCategory, termType, finalDeposit, year, month, day, } = storeToRefs(useDepositInputStore());
const { interestRate, interest, termMonths } = storeToRefs(useDepositResultStore());
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

const showTermType1 = ref(false);
const showTermType2 = ref(false);
const showTermType3 = ref(false);
const isDividedDeposit = ref(false);
const isFetchInterest = ref(false);

// 监听存款种类的变化，显示不同的期限选择框
watch(depositCategory, (newVal) => {
  if (['整存整取'].includes(newVal)) {
    showTermType1.value = true;
    showTermType2.value = false;
    showTermType3.value = false;
  } else if (['存本取息', '零存整取'].includes(newVal)) {
    showTermType2.value = true;
    showTermType1.value = false;
    showTermType3.value = false;
  } else if (['活期', '定活两便'].includes(newVal)) {
    showTermType3.value = true;
    showTermType1.value = false;
    showTermType2.value = false;
  } else {
    showTermType1.value = false;
    showTermType2.value = false;
    showTermType3.value = false;
  }
});

watch(depositCategory, (newVal) => {
  if (['零存整取'].includes(newVal)) {
    isDividedDeposit.value = true;
  } else {
    isDividedDeposit.value = false;
  }
});

watch(depositCategory, (newVal) => {
  if (['存本取息'].includes(newVal)) {
    isFetchInterest.value = true;
  } else {
    isFetchInterest.value = false;
  }
});


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
};

const deleteAll = () => {
  depositCategory.value = '选择存款方式'; initialDeposit.value = 0; termType.value = '选择存款期限',
    interestRate.value = 0, interest.value = 0, finalDeposit.value = 0, year.value = 0,
    month.value = 0, day.value = 0, termMonths.value = 0, monthlyInterest.value = 0
}
</script>

<style scoped>
.deposit-calc-container {
  width: 70%;
  margin: 0 auto;
  padding: 20px;
  border-width: 20px;
  border-color: black;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

td {
  text-align: center;
}
th {
  text-align: center;
  font-weight: bold;
}
</style>

<template>
  <n-space vertical class="DepositCalc-container">

    <!-- 初始储蓄金额输入框 -->
    <n-space vertical>
      <label>初始储蓄金额：</label>
      <n-input-number v-model:value="initialDeposit" :min="0" :step="100" size="large" placeholder="请输入金额"/>
    </n-space>

    <!-- 存款种类 -->
    <n-space vertical>
      <label>存款种类：</label>
     <n-select v-model:value="depositCategory" size="large" :options="depositOptions"/>
    </n-space>
 
    <!-- 期限种类 -->
    <label>存款期限：</label>
    <n-space vertical v-if="showTermType">
      <n-select v-model:value="termType" :options="termOptions" size="large"/>
    </n-space>

    <n-space :wrap="false" v-if="!showTermType">
      <div>
        <n-space :wrap="false"><n-input-number v-model:value="year" :show-button="false"/>年</n-space>
      </div>
      <div>
        <n-space :wrap="false"><n-input-number v-model:value="month" :show-button="false"/>月</n-space>
      </div>
      <div>
        <n-space :wrap="false"><n-input-number v-model:value="day" :show-button="false"/>日</n-space>
      </div>
    </n-space>
    <!-- 利率 -->
    <n-space vertical>
      <label>利率：</label>
      <n-input-number v-model:value="interestRate"size="large" placeholder="请输入储蓄期限"/>
    </n-space>

    <!-- 计算按钮 -->
    <n-space justify="center">
      <n-button  type="primary" size="large">计算</n-button>
    </n-space>

    <!-- 结果显示 -->
    <n-space >
      <label>总利息：</label>
      <n-input-number :value="interest" size="large" :show-button="false" readonly />
    </n-space>
    <n-space >
      <label>最终储蓄金额：</label>
      <n-input-number :value="finalDeposit" size="large" :show-button="false" readonly />
    </n-space>
  </n-space>
</template>

<script setup lang="ts">
  import { NSelect, NInputNumber,NRadioGroup, NRadioButton, NSpace } from 'naive-ui';
  import { ref } from "vue";
  import { useDepositInputStore } from "@/stores/input/DepositInputStore";
  import { storeToRefs } from 'pinia';
  import { watchEffect, watch } from 'vue';

  const { initialDeposit,depositCategory,termType,interestRate,interest,finalDeposit,year,month,day } =storeToRefs(useDepositInputStore());
  const depositOptions = [
  { label: '活期', value: '活期'},
  { label: '定活两便', value: '定活两便'},
  { label: '存本取息', value: '存本取息'},
  { label: '整存整取', value: '整存整取'},
  { label: '零存整取', value: '零存整取'},
];

const termOptions = ref([
  { label: '三个月', value: '三个月' },
  { label: '半年', value: '半年' },
  { label: '一年', value: '一年' },
  { label: '二年', value: '二年' },
  { label: '三年', value: '三年' },
  { label: '五年', value: '五年' },
]);

const showTermType = ref(false);

// 监听存款种类的变化，当选择 "存本取息"、"整存整取" 或 "零存整取" 时显示期限种类选择框
watch(depositCategory, (newVal) => {
  if (['存本取息', '整存整取', '零存整取'].includes(newVal)) {
    showTermType.value = true;
  } else {
    showTermType.value = false;
  }
});
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

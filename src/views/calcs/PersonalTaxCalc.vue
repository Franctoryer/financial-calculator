<template>
  <div>
    <n-space :size="5" vertical class="PersonalTaxCalc-container">
      <!-- 月份 -->
      <n-space vertical :size="5">
        <div>月份：</div>
        <n-slider v-model:value="months" :step="1" :min="1" :max="12">
          <template #thumb v-if="months < 5">
            <n-icon-wrapper :size="15" :border-radius="10">
              <n-icon :size="15" :component="AnimalTurtle24Regular"/>
            </n-icon-wrapper>
          </template>
          <template #thumb v-else-if="months >= 5 && months <= 8">
            <n-icon-wrapper :size="20" :border-radius="10">
              <n-icon :size="20" :component="AnimalCat24Regular"/>
            </n-icon-wrapper>
          </template>
          <template #thumb v-else>
            <n-icon-wrapper :size="25" :border-radius="10">
              <n-icon :size="25" :component="AnimalRabbit24Regular"/>
            </n-icon-wrapper>
          </template>
        </n-slider>
        <n-input-number v-model:value="months" size="small" :validator="monthsValidator"/>
      </n-space>

      <!-- 单月税前工资 -->
      <div class="input-container">
        <n-space :wrap="false">
        <div>单月税前工资：
          <n-input-number v-model:value="income"  size="small" :step="1000" :validator="incomeValidator"/>
        </div>
        <div>累计税前工资：
          <n-input-number v-model:value="all_income"  size="small" :step="1000" :show-button="false" :validator="incomeValidator"/>
        </div>
        </n-space>
    </div>

        <!-- 五险一金 -->
        <div>
        <n-space :wrap="false">
        <div>五险一金：
          <n-input-number v-model:value="fiveonetax" size="small" :step="1000" :validator="fiveonetaxValidator"/>
        </div>
        <div>累计五险一金：
          <n-input-number v-model:value="all_fiveonetax"  size="small" :step="1000" :show-button="false" :validator="fiveonetaxValidator"/>
        </div>
        </n-space>
        </div>

        <!-- 专项附加扣除 -->
        <div>
        <n-space :wrap="false">
        <div>专项附加扣除：
          <n-input-number v-model:value="sidecosts"  size="small" :step="1000" :validator="sidecostsValidator"/>
        </div>
        <div>累计专项附加扣除：
          <n-input-number v-model:value="all_sidecosts"  size="small" :step="1000" :show-button="false" :validator="sidecostsValidator"/>
        </div>
      </n-space>
      </div>

        <!-- 其他扣除 -->
        <div>
        <n-space :wrap="false">
        <div>其他扣除：
          <n-input-number v-model:value="othercosts"  size="small" :step="1000" :validator="othercostsValidator"/>
        </div>
        <div>累计其他扣除：
          <n-input-number v-model:value="all_othercosts"  size="small" :step="1000" :show-button="false" :validator="othercostsValidator"/>
        </div>
      </n-space>

      <!-- 固定扣除 -->
      <n-space :wrap="false">
        <div>固定减除（个税起征点）:
          <n-input-number v-model:value="tax_threshold"  size="small" readonly/>
        </div>
        <div>累计减除:
          <n-input-number v-model:value="all_tax_threshold"  size="small" :show-button="false" readonly/>
        </div>
      </n-space>

    </div>
    <div class="button-group">
      <n-button @click="deleteAll" color="#ba5b49">全部清除</n-button>
      <n-button color="#3271ae" @click="computeResult">计算</n-button>
    </div>
    </n-space>
  </div>
  
</template>

<script setup lang="ts">
  import { NRadioGroup, NRadioButton, NSwitch, NSpace, NSlider, NInputNumber, NIcon, NIconWrapper, NSelect, NButton } from 'naive-ui';
  import AnimalCat24Regular from '@vicons/fluent/AnimalCat24Regular'
  import AnimalTurtle24Regular from '@vicons/fluent/AnimalTurtle24Regular';
  import AnimalRabbit24Regular from '@vicons/fluent/AnimalRabbit24Regular';
  import { useSettingStore } from '@/stores/settingStore';
  import { storeToRefs } from 'pinia';
  import { ref } from 'vue';
  import { watchEffect, watch } from 'vue';
  import { UNKNOWN_OPTION, NO_DELETING, IRR_REQUIREMENT_ERROR } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import { usePersonalTaxInputStore } from "@/stores/input/PersonalTaxInputStore";
  import { usePersonalTaxResultStore } from "@/stores/result/PersonalTaxResultStore";

  const settingStore = useSettingStore();
  const { interestMethod, precision, currencyType, timeUnit, isDisplayInfo, timeMode } = storeToRefs(settingStore);
  const { PTInputData, months, income, fiveonetax, sidecosts, othercosts, tax_threshold } = storeToRefs(usePersonalTaxInputStore());
  const { all_income, all_fiveonetax, all_sidecosts, all_othercosts, all_tax_threshold, 
          taxable_income, taxRate, quickDeduction, lastweek_taxable_income,
        lastweek_taxRate, lastweek_quickDeduction, tax, lastweek_tax,
        current_tax, taxed_income} = storeToRefs(usePersonalTaxResultStore());
  const monthsValidator = (x: number) => x >= 0 && x <= 12; 
  const incomeValidator = (x: number) => x >= 0; 
  const fiveonetaxValidator = (x:number) => x >=0;
  const sidecostsValidator = (x:number) => x >=0;
  const othercostsValidator = (x:number) => x >=0;

  const deleteAll = () => {
    months.value = 1;
    fiveonetax.value,sidecosts.value,othercosts.value = 0;
    income.value = 3000;tax_threshold.value =5000;
    computeAllInput();
  }
  const computeResult = () => {
      computeTax();
      computeLastWeekTax();
      computeTaxedIncome();
  }

  const computeAllInput = () => {
   all_income.value = months.value*income.value;
   all_fiveonetax.value = months.value*fiveonetax.value;
   all_sidecosts.value = months.value*sidecosts.value;
   all_othercosts.value = months.value*othercosts.value;
   all_tax_threshold.value = months.value*tax_threshold.value;
  }

  const computeTax = () => {
    if(taxable_income.value <= 36000){
      taxRate.value = 0.03,quickDeduction.value = 0
    }else if(taxable_income.value <= 144000){
      taxRate.value = 0.1,quickDeduction.value = 2520
    }else if(taxable_income.value <= 300000){
      taxRate.value = 0.2,quickDeduction.value = 16920
    }else if(taxable_income.value <= 420000){
      taxRate.value = 0.25,quickDeduction.value = 31920
    }else if(taxable_income.value <= 660000){
      taxRate.value = 0.3,quickDeduction.value = 52920
    }else if(taxable_income.value <= 960000){
      taxRate.value = 0.35,quickDeduction.value = 85920
    }else{
      taxRate.value = 0.45,quickDeduction.value = 181920
    }
    tax.value = taxRate.value*taxable_income.value-quickDeduction.value
  }

  const computeLastWeekTax = () => {
    if(lastweek_taxable_income.value <= 36000){
      lastweek_taxRate.value = 0.03,lastweek_quickDeduction.value = 0
    }else if(lastweek_taxable_income.value <= 144000){
      lastweek_taxRate.value = 0.1,lastweek_quickDeduction.value = 2520
    }else if(lastweek_taxable_income.value <= 300000){
      lastweek_taxRate.value = 0.2,lastweek_quickDeduction.value = 16920
    }else if(lastweek_taxable_income.value <= 420000){
      lastweek_taxRate.value = 0.25,lastweek_quickDeduction.value = 31920
    }else if(lastweek_taxable_income.value <= 660000){
      lastweek_taxRate.value = 0.3,lastweek_quickDeduction.value = 52920
    }else if(lastweek_taxable_income.value <= 960000){
      lastweek_taxRate.value = 0.35,lastweek_quickDeduction.value = 85920
    }else{
      lastweek_taxRate.value = 0.45,lastweek_quickDeduction.value = 181920
    }
    lastweek_tax.value = lastweek_taxRate.value*lastweek_taxable_income.value-lastweek_quickDeduction.value
  }

  const computeTaxedIncome = () => {
     current_tax.value = tax.value - lastweek_tax.value;
     taxed_income.value = income.value - fiveonetax.value - current_tax.value;
  }

/*  const isDefaultInput = 
   all_income.value === months.value*income.value &&
   all_fiveonetax.value === months.value*fiveonetax.value &&
   all_sidecosts.value === months.value*sidecosts.value &&
   all_othercosts.value === months.value*othercosts.value &&
   all_tax_threshold.value === months.value*tax_threshold.value;
*/

   watch(() => months.value, () => {
     computeAllInput();
   });

  

</script>

<style>
  .PersonalTaxCalc-container {
    width: 60%;
    margin-left: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .input-container {
  width: 100%;  
  border-radius: 8px;
  padding: 5px;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
}
  .result-display{

  }
  .button-group {
    margin-left: 0%;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 40%;
    justify-content: space-between;
    margin-bottom: 10px;
  }
</style>

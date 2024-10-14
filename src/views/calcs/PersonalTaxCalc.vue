<template>
  <div>
    <n-space :size="5" vertical class="personal-tax-calc-container" align="center">
     
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
        <n-input-number class="input-container" v-model:value="months" size="small" :validator="monthsValidator"/>
      </n-space>

       <!-- 单月税前工资 -->
       <div>
        <n-space :wrap="false">
        <div>单月税前工资：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="income" size="small" :step="1000" :show-button="false" :validator="incomeValidator"/>元</n-space>
        </div>
        <div>累计税前工资：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="all_income"  size="small" :step="1000" :show-button="false" :validator="incomeValidator"/>元</n-space>
        </div>
        </n-space>
    </div>

        <!-- 五险一金 -->
        <div>
        <n-space :wrap="false">
        <div>五险一金：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="fiveonetax" size="small" :step="1000" :show-button="false" :validator="fiveonetaxValidator"/>元</n-space>
        </div>
        <div>累计五险一金：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="all_fiveonetax"  size="small" :step="1000" :show-button="false" :validator="fiveonetaxValidator"/>元</n-space>
        </div>
        </n-space>
        </div>

        <!-- 专项附加扣除 -->
        <div>
        <n-space :wrap="false">
        <div>专项附加扣除：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="sidecosts"  size="small" :step="1000" :show-button="false" :validator="sidecostsValidator"/>元</n-space>
        </div>
        <div>累计专项附加扣除：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="all_sidecosts"  size="small" :step="1000" :show-button="false" :validator="sidecostsValidator"/>元</n-space>
        </div>
      </n-space>
      </div>

        <!-- 其他扣除 -->
        <div>
        <n-space :wrap="false">
        <div>其他扣除：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="othercosts"  size="small" :step="1000" :show-button="false" :validator="othercostsValidator"/>元</n-space>
        </div>
        <div>累计其他扣除：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="all_othercosts"  size="small" :step="1000" :show-button="false" :validator="othercostsValidator"/>元</n-space>
        </div>
      </n-space>

      <!-- 固定扣除 -->
      <n-space :wrap="false">
        <div>个税起征点：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display1" v-model:value="tax_threshold" size="small" :show-button="false" readonly/>元</n-space>
        </div>
        <div>累计减除:
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display1" v-model:value="all_tax_threshold"  size="small" :show-button="false" readonly/>元</n-space>
        </div>
      </n-space>

    
   
    <div class="button-group">
      <n-button color="#ba5b49" @click="deleteAll">全部清除</n-button>
      <n-button color="#3271ae" @click="computeAllInput">按月份更新输入</n-button>
      <n-button color="green" @click="computeResult">计算结果</n-button>
    </div>
    </div>
    </n-space>
  </div>

    <hr />

    <div>
    <n-space :size="5" vertical class="personal-tax-calc-container" align=center>
      <!-- 计算结果展示 -->
      <n-space :size="5" vertical class="results-container">
        <n-space align="center" :wrap="false">
          <div class="result-label">应纳税所得额：</div>
          <n-input-number class="input-container" v-model:value="taxable_income" size="small" :step="1000" :show-button="false" />元
        </n-space>

        <n-space align="center" :wrap="false">
          <div class="result-label">累计应纳税额：</div>
          <n-input-number class="input-container" v-model:value="tax" size="small" :step="1000" :show-button="false" />元
        </n-space>

        <n-space align="center" :wrap="false">
          <div class="result-label">税率：</div>
          <n-input-number class="input-container" v-model:value="display_taxRate" size="small" :show-button="false" />%
        </n-space>

        <n-space align="center" :wrap="false">
          <div class="result-label">当月个税：</div>
          <n-input-number class="input-container" v-model:value="current_tax" size="small" :step="1000" :show-button="false" />元
        </n-space>

        <n-space align="center" :wrap="false">
          <div class="result-label">税后工资：</div>
          <n-input-number class="input-container" v-model:value="taxed_income" size="small" :step="1000" :show-button="false" />元
        </n-space>
      </n-space>
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
  import { useFiveOneTaxResultStore } from "@/stores/result/FiveOneTaxResultStore";
  import { computeFiveOneTax,computeSocialInsuranceBase,computeAccumulationFundBase} from "@/utils/computeFiveOneTax";


  const settingStore = useSettingStore();
  const { interestMethod, precision, currencyType, timeUnit, isDisplayInfo, timeMode } = storeToRefs(settingStore);
  const { fiveonetax } = storeToRefs(useFiveOneTaxResultStore());
  const { months, income, sidecosts, othercosts, tax_threshold } = storeToRefs(usePersonalTaxInputStore());
  const { all_income, all_fiveonetax, all_sidecosts, all_othercosts, all_tax_threshold, 
          taxable_income, taxRate, display_taxRate, quickDeduction, lastweek_taxable_income,
          lastweek_taxRate, lastweek_quickDeduction, tax, lastweek_tax,
          current_tax, taxed_income} = storeToRefs(usePersonalTaxResultStore());
  const monthsValidator = (x: number) => x >= 0 && x <= 12; 
  const incomeValidator = (x: number) => x >= 0; 
  const fiveonetaxValidator = (x:number) => x >=0;
  const sidecostsValidator = (x:number) => x >=0;
  const othercostsValidator = (x:number) => x >=0;


  const deleteAll = () => {
 /*   if (rawData.value.length === 0) {
      window.$message.warning(NO_DELETING, MESSAGE_CONFIG)
      return;
    }*/
    months.value = 1;
    fiveonetax.value = 0;sidecosts.value = 0;othercosts.value = 0;
    income.value = 3000;tax_threshold.value =5000;
    computeAllInput();
    all_income.value = 0;all_fiveonetax.value = 0;all_sidecosts.value = 0;all_othercosts.value = 0;all_tax_threshold.value = 0;
      taxRate.value = 0.03;display_taxRate.value = 100*taxRate.value;
    taxable_income.value = 0;quickDeduction.value = 0;tax.value = 0;lastweek_tax.value = 0;current_tax.value = 0;taxed_income.value = 0;
  }

  const computeResult = () => {
      computeTaxableIncome();
      computeLastWeekTaxableIncome();
      computeTax();
      computeLastWeekTax();
      computeTaxedIncome();
      toPresicion();
      display_taxRate.value = 100*taxRate.value;
  }

  const computeAllInput = () => {
   all_income.value = months.value*income.value;
   all_fiveonetax.value = months.value*fiveonetax.value;
   all_sidecosts.value = months.value*sidecosts.value;
   all_othercosts.value = months.value*othercosts.value;
   all_tax_threshold.value = months.value*tax_threshold.value;
   all_fiveonetax.value=Number(all_fiveonetax.value.toFixed(precision.value));
  }
 
  const computeTaxableIncome = () => {
   taxable_income.value = Math.max(0,all_income.value - all_fiveonetax.value - all_sidecosts.value - all_othercosts.value -all_tax_threshold.value)
  }

  const computeLastWeekTaxableIncome = () => {
    lastweek_taxable_income.value = Math.max(0,taxable_income.value - income.value + fiveonetax.value + sidecosts.value + othercosts.value + tax_threshold.value)
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
    lastweek_tax.value = Math.min(lastweek_taxRate.value*lastweek_taxable_income.value-lastweek_quickDeduction.value,tax.value);
  }

  const computeTaxedIncome = () => {
     current_tax.value = tax.value - lastweek_tax.value;
     taxed_income.value = income.value - fiveonetax.value - current_tax.value;
    }

    const toPresicion = () => {
      taxable_income.value=Number(taxable_income.value.toFixed(precision.value));
      quickDeduction.value=Number(quickDeduction.value.toFixed(precision.value));
      tax.value=Number(tax.value.toFixed(precision.value));
      lastweek_tax.value=Number(lastweek_tax.value.toFixed(precision.value));
      current_tax.value=Number(current_tax.value.toFixed(precision.value));
      taxed_income.value=Number(taxed_income.value.toFixed(precision.value));
    }

    watch(() => income.value, () => {
    computeSocialInsuranceBase();
    computeAccumulationFundBase();
    computeFiveOneTax();
    computeAllInput();
  });


   watch(() => months.value, () => {
     computeAllInput();
   });
  
  

</script>

<style scoped>
.personal-tax-calc-container {
  width: 75%;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.label, .result-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-right: 10px;
}

.input-box, .result-display {
  width: 160px;
}

.result-display {
  border: 1px solid ;
  padding: 8px;
  border-radius: 4px;
  text-align: right;
  background-color: #e8f5e9;
}

.button-group {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.clear-btn {
  background-color: #f44336;
  color: white;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

.compute-btn {
  background-color: #ff9800;
  color: white;
  transition: all 0.2s ease;
}
.custom-slider{
  width:100%;
}
</style>
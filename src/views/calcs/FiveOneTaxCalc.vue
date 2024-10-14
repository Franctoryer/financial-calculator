<template>
    <div>
    <n-space :size="5" vertical align =center class="PersonalTaxCalc-container">

    <div>
      <n-space vertical>
      <!-- 单月税前工资 -->
      <div>
        <n-space vertical :wrap="false">
        <div>单月税前工资：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="income" size="small" :step="1000" :show-button="false"/>元</n-space>
        </div>
        <div>社保基数：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="SocialInsuranceBase" size="small" :step="1000" :show-button="false"/>元</n-space>
        </div>
        <div>住房公积金基数：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="input-container" v-model:value="AccumulationFundBase" size="small" :step="1000" :show-button="false"/>元</n-space>
        </div>
        </n-space>
      </div>

      <div class="button-group">
        <n-button color="#ba5b49" @click="deleteAll">全部清除</n-button>
        <n-button color="green" @click="computeFiveOneTax">计算结果</n-button>
      </div>
      </n-space>
    </div>
    <hr>
    <div>
      <n-space :size="5" vertical>

        <!-- 养老保险金 -->
        <div>养老保险金：
          <n-space :wrap="false">
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display1" v-model:value="OldAgeInsuranceRate" size="small" :step="1000" :show-button="false"/>%</n-space>
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display2" v-model:value="OldAgeInsurance"  size="small" :step="1000" :show-button="false"/>元</n-space>
        </n-space>
       </div>

       <!-- 医疗保险金 -->
       <div>医疗保险金：
          <n-space :wrap="false">
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display1" v-model:value="MedicalInsuranceRate" size="small" :step="1000" :show-button="false"/>%</n-space>
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display2" v-model:value="MedicalInsurance"  size="small" :step="1000" :show-button="false"/>元</n-space>
        </n-space>
       </div>

       <!-- 失业保险金 -->
       <div>失业保险金：
          <n-space :wrap="false">
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display1" v-model:value="UnemploymentInsuranceRate" size="small" :step="1000" :show-button="false"/>%</n-space>
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display2" v-model:value="UnemploymentInsurance"  size="small" :step="1000" :show-button="false"/>元</n-space>
        </n-space>
       </div>

        <!-- 住房公积金 -->
        <div>住房公积金：
          <n-space :wrap="false">
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display1" v-model:value="AccumulationFundRate" size="small" :step="1000" :show-button="false"/>%</n-space>
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display2" v-model:value="AccumulationFund"  size="small" :step="1000" :show-button="false"/>元</n-space>
        </n-space>
       </div>

      </n-space>
    </div>

  <!-- 总计： -->
  <div>总计：
          <n-space :wrap="false" class="custom-n-space"><n-input-number class="result-display4" v-model:value="fiveonetax"  size="large" :step="1000" :show-button="false"/>元</n-space>
       </div>
      </n-space>
  </div>
</template>

<script setup lang="ts">
  import { NRadioGroup, NRadioButton, NSwitch, NSpace, NSlider, NInputNumber, NIcon, NIconWrapper, NSelect, NButton } from 'naive-ui';
  import { useSettingStore } from '@/stores/settingStore';
  import { storeToRefs } from 'pinia';
  import { ref } from 'vue';
  import { watchEffect, watch } from 'vue';
  import { UNKNOWN_OPTION, NO_DELETING, IRR_REQUIREMENT_ERROR } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import { usePersonalTaxInputStore } from "@/stores/input/PersonalTaxInputStore";
  import { useFiveOneTaxInputStore } from "@/stores/input/FiveOneTaxInputStore";
  import { useFiveOneTaxResultStore } from "@/stores/result/FiveOneTaxResultStore";
  import { computeFiveOneTax,computeSocialInsuranceBase,computeAccumulationFundBase} from "@/utils/computeFiveOneTax";

  const settingStore = useSettingStore();
  const { interestMethod, precision, currencyType, timeUnit, isDisplayInfo, timeMode } = storeToRefs(settingStore);
  const { income } = storeToRefs(usePersonalTaxInputStore());
  const {SocialInsuranceBase,
        AccumulationFundBase,
        OldAgeInsuranceRate,
        OldAgeInsurance,
        MedicalInsuranceRate,
        MedicalInsurance,
        UnemploymentInsuranceRate,
        UnemploymentInsurance,
        AccumulationFundRate,
        AccumulationFund} = storeToRefs(useFiveOneTaxInputStore());
  const { fiveonetax } = storeToRefs(useFiveOneTaxResultStore());

  const deleteAll = () => {
 /*   if (rawData.value.length === 0) {
      window.$message.warning(NO_DELETING, MESSAGE_CONFIG)
      return;
    }*/
        income.value = 3000;
        SocialInsuranceBase.value = 3000;
        AccumulationFundBase.value = 3000;
        OldAgeInsuranceRate.value = 8;
        OldAgeInsurance.value = 0;
        MedicalInsuranceRate.value = 2;
        MedicalInsurance.value = 0;
        UnemploymentInsuranceRate.value = 0.5;
        UnemploymentInsurance.value = 0;
        AccumulationFundRate.value = 7;
        AccumulationFund.value = 0;
        fiveonetax.value = 0;
  }

  watch(() => income.value, () => {
    computeSocialInsuranceBase();
    computeAccumulationFundBase();
  });
</script>

<style>
.PersonalTaxCalc-container {
  width: 75%;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>

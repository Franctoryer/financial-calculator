<template>
  <div class="input-container">
    <n-space :size="5" vertical class="PersonalTaxCalc-container">
      <!-- 月份 -->
      <n-space vertical :size="5">
        <div class="option-title">月份（实际工作月数）：</div>
        <n-slider v-model:value="months" :step="1" :max="12">
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
      <div>
      <n-space>
        <div>单月税前工资：
          <n-input-number v-model:value="income" size="small" :step="1000" :validator="incomeValidator"/>
        </div>
        <div>累计税前工资：
          <n-input-number v-model:value="income" size="small" :step="1000" :validator="incomeValidator"/>
        </div>
      </n-space>
    </div>

        <!-- 五险一金 -->
        <div>
        <n-space>
        <div>五险一金：
          <n-input-number v-model:value="fiveonetax" size="small" :step="1000" :validator="fiveonetaxValidator"/>
        </div>
        <div>累计五险一金：
          <n-input-number v-model:value="fiveonetax" size="small" :step="1000" :validator="fiveonetaxValidator"/>
        </div>
        </n-space>
        </div>

        <!-- 专项附加扣除 -->
        <div>
        <n-space>
        <div>专项附加扣除：
          <n-input-number v-model:value="sidecosts" size="small" :step="1000" :validator="sidecostsValidator"/>
        </div>
        <div>专项附加扣除：
          <n-input-number v-model:value="sidecosts" size="small" :step="1000" :validator="sidecostsValidator"/>
        </div>
      </n-space>
      </div>

        <!-- 其他扣除 -->
        <div>
        <n-space>
        <div>其他扣除：
          <n-input-number v-model:value="othercosts" size="small" :step="1000" :validator="othercostsValidator"/>
        </div>
        <div>其他扣除：
          <n-input-number v-model:value="othercosts" size="small" :step="1000" :validator="othercostsValidator"/>
        </div>
      </n-space>
    </div>
    </n-space>
  </div>
  <div class="button-group">
      <n-button @click="deleteAll" color="#ba5b49">全部清除</n-button>
      <n-button color="#3271ae" @click="computeResult">计算</n-button>
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
  import { UNKNOWN_OPTION, NO_DELETING, IRR_REQUIREMENT_ERROR } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import { usePersonalTaxInputStore } from "@/stores/input/PersonalTaxInputStore";

  const settingStore = useSettingStore();
  const { interestMethod, precision, currencyType, timeUnit, isDisplayInfo, timeMode } = storeToRefs(settingStore);
  const { months, income, fiveonetax, sidecosts, othercosts } = storeToRefs(usePersonalTaxInputStore());
 
  const monthsValidator = (x: number) => x >= 0 && x <= 12; 
  const incomeValidator = (x: number) => x >= 0; 
  const fiveonetaxValidator = (x:number) => x >=0;
  const sidecostsValidator = (x:number) => x >=0;
  const othercostsValidator = (x:number) => x >=0;

  const deleteAll = () => {

  }
  const computeResult = () => {
   
  }

</script>

<style>
  .PersonalTaxCalc-container {
    width: 80%;
    margin-left: 20px;
  }

  ul {
    padding-left: 20px;
  }
  li {
    list-style-type: circle;
  }
  .input-container {
  margin: 10px;
  border-radius: 8px;
  padding: 5px;
}
  .result-display{

  }
  .button-group {
    margin-left: 5%;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 60%;
    justify-content: space-between;
    margin-bottom: 10px;
  }
</style>

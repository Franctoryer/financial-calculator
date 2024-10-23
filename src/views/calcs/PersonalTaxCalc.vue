<template>
  <div class="personal-tax-calc-container">
    <div class="all-row">
      <div class="option-row">
        <div class="option">
          选择地区：
          <n-select 
            v-if="RegionOptions.length" 
            v-model:value="RegionName" 
            size="small" 
            :options="RegionOptions" 
            class="select"
          >
            <template #arrow>
              <MapMarkerAlt/>
            </template>
          </n-select>
        </div>
        <div class="option">
          月份：
          <n-input-number v-model:value="months" size="small" :validator="monthsValidator" />
        </div>
      </div>
       <!-- 单月税前工资 -->
      <div class="option-row">
          <div class="option">
            单月税前工资：
              <n-input-number v-model:value="income" size="small" :step="1000" :show-button="false"
                :validator="incomeValidator">
                <template #suffix>
                  {{ currencySymbol }}
                </template>
              </n-input-number>
          </div>
          <div class="option">
            累计税前工资：
              <n-input-number v-model:value="all_income"
                size="small" :step="1000" :show-button="false" :validator="incomeValidator" class="input-number">
                <template #suffix>
                  {{ currencySymbol }}
                </template>
              </n-input-number>
          </div>
      </div>
      <!-- 五险一金 -->
      <div class="option-row">
          <div class="option">
            <router-link to="/calc/fiveone-tax" class="fiveone-tax">五险一金↵：</router-link>
            <n-input-number class="input-container" v-model:value="fiveonetax"
                size="small" :step="1000" :show-button="false" :validator="fiveonetaxValidator">
                <template #suffix>
                  {{ currencySymbol }}
                </template>
            </n-input-number>
          </div>
          <div class="option">累计五险一金：
              <n-input-number class="input-container"
                v-model:value="all_fiveonetax" size="small" :step="1000" :show-button="false"
                :validator="fiveonetaxValidator">
                <template #suffix>
                  {{ currencySymbol }}
                </template>
              </n-input-number>
          </div>
      </div>
      <!-- 专项附加扣除 -->
      <div class="option-row">
          <div class="option">
            <div class="option-and-icon">
              <div>专项附加扣除：</div>
              <n-icon 
                :component="BookSearch24Regular" 
                :size="20" @click="isPersonalTax = true" 
                :depth="3"
                v-if="isQkDocLkup"
                class="doc-icon"
              >
              </n-icon>
            </div>
            <n-modal 
              :show="isPersonalTax"
              size="huge"
              style="width: 80%;"
              preset="card"
              @update:show="handleModalShowChange"
            >
              <n-scrollbar style="max-height: 60vh" trigger="none">
                <PersonalTaxCalcManual  class="modal-content"/>
              </n-scrollbar>
            </n-modal>
            <n-input-number class="input-container" v-model:value="sidecosts"
                size="small" :step="1000" :show-button="false" :validator="sidecostsValidator">
                <template #suffix>
                  {{ currencySymbol }}
                </template>
              </n-input-number>
          </div>
          <div class="option">
            累计专项附加扣除：
            <n-input-number class="input-container"
                v-model:value="all_sidecosts" size="small" :step="1000" :show-button="false"
                :validator="sidecostsValidator">
                <template #suffix>
                  {{ currencySymbol }}
                </template>
              </n-input-number>
          </div>
      </div>
      <!-- 其他扣除 -->
      <div class="option-row">
          <div class="option">
            其他扣除：
            <n-input-number class="input-container" v-model:value="othercosts"
                size="small" :step="1000" :show-button="false" :validator="othercostsValidator">
                <template #suffix>
                  {{ currencySymbol }}
                </template>
              </n-input-number>
          </div>
          <div class="option"> 
            累计其他扣除：
            <n-input-number class="input-container"
                v-model:value="all_othercosts" size="small" :step="1000" :show-button="false"
                :validator="othercostsValidator">
                <template #suffix>
                  {{ currencySymbol }}
                </template>
              </n-input-number>
          </div>
      </div>
      <!-- 固定扣除 -->
      <div class="option-row">
          <div class="option">
            个税起征点：
            <n-input-number class="result-display1"
                v-model:value="tax_threshold" size="small" :show-button="false" readonly>
                <template #suffix>
                  {{ currencySymbol }}
                </template>
              </n-input-number>
          </div>
          <div class="option">累计减除:
            <n-input-number class="result-display1"
                v-model:value="all_tax_threshold" size="small" :show-button="false" readonly>
                <template #suffix>
                  {{ currencySymbol }}
                </template>
              </n-input-number>
          </div>
      </div>
    </div>
    <div class="button-group">
      <n-button @click="deleteAll" strong secondary type="error">全部清除</n-button>
      <n-button @click="computeAllInput" strong secondary type="warning">按月份更新输入</n-button>
      <n-button @click="onClickCalculate()" strong secondary type="info">计算结果</n-button>
    </div>
    <n-divider/>
  <n-table>
    <thead>
      <tr>
        <th>应纳税所得额</th>
        <th>累计应纳税额</th>
        <th>税率</th>
        <th>当月个税</th>
        <th>税后工资</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ taxable_income_view.number }} {{ currencySymbol }}</td>
        <td>{{ tax_view.number }} {{ currencySymbol }}</td>
        <td>{{ display_taxRate_view.number }} %</td>
        <td>{{ current_tax_view.number }} {{ currencySymbol }}</td>
        <td>{{ taxed_income_view.number }} {{ currencySymbol }}</td>
      </tr>
    </tbody>
  </n-table>
  </div>
  

  
</template>

<script setup lang="ts">
import { NSpace, NSlider, NInputNumber, NIcon, NIconWrapper, NButton, NDivider, NTable, NSelect, NModal, NScrollbar } from 'naive-ui';
import AnimalCat24Regular from '@vicons/fluent/AnimalCat24Regular'
import AnimalTurtle24Regular from '@vicons/fluent/AnimalTurtle24Regular';
import AnimalRabbit24Regular from '@vicons/fluent/AnimalRabbit24Regular';
import MapMarkerAlt from '@vicons/fa/MapMarkerAlt'
import { useSettingStore } from '@/stores/settingStore';
import { storeToRefs } from 'pinia';
import { ref, onMounted } from 'vue';
import { UNKNOWN_OPTION, NO_DELETING, IRR_REQUIREMENT_ERROR, NO_MORE_CLICK } from "@/constants/message";
import { MESSAGE_CONFIG } from "@/constants/messageConfig";
import { watchEffect, watch } from 'vue';
import { usePersonalTaxInputStore } from "@/stores/input/PersonalTaxInputStore";
import { usePersonalTaxResultStore } from "@/stores/result/PersonalTaxResultStore";
import { useFiveOneTaxInputStore } from "@/stores/input/FiveOneTaxInputStore";
import { useFiveOneTaxResultStore } from "@/stores/result/FiveOneTaxResultStore";
import { computeFiveOneTax, computeSocialInsuranceBase, computeAccumulationFundBase } from "@/utils/computeFiveOneTax";
import type { HistoryData } from "@/types/HistoryData";
import { useHistoryStore } from "@/stores/historyStore";
import { useRoute } from "vue-router"
import gsap from "gsap";
import { reactive } from 'vue';
// @ts-ignore
import {  BookSearch24Regular } from '@vicons/fluent';
import PersonalTaxCalcManual from '../manuals/PersonalTaxCalcManual.vue';
import { debounce, throttle } from 'lodash';

//节流状态变量
let isThrottling = false;

const RegionOptions = [
  { label: '请选择地区'	, value: '请选择地区'	},
  { label: '北京'	, value: '北京'	 }, 
  { label: '上海', value: '上海' },
  { label: '天津'	, value: '天津'	 },
  { label: '河北', value:   '河北' },
  { label:  '山西', value:  '山西' },
  { label: '内蒙古', value: '内蒙古' },
  { label: '辽宁', value: '辽宁' },
  { label: '吉林', value: '吉林' },
  { label:  '黑龙江', value:  '黑龙江' },
  { label:  '福建', value:  '福建' },
  { label:  '江西', value:  '江西' },
  { label:  '山东', value:  '山东' },
  { label:  '湖南', value:  '湖南' },
  { label:  '广西', value:  '广西'},
  { label:  '重庆', value:  '重庆' },
  { label:  '四川', value:  '四川' },
  { label:  '云南', value:  '云南' },
  { label:  '贵州', value:  '贵州' },
  { label:  '西藏', value:  '西藏' },
  { label:  '陕西', value:  '陕西'},
];
const settingStore = useSettingStore();
const { precision, currencySymbol, isQkDocLkup } = storeToRefs(settingStore);
const { RegionName } = storeToRefs(useFiveOneTaxInputStore());
const { fiveonetax } = storeToRefs(useFiveOneTaxResultStore());
const { months, income, sidecosts, othercosts, tax_threshold } = storeToRefs(usePersonalTaxInputStore());
const { all_income, all_fiveonetax, all_sidecosts, all_othercosts, all_tax_threshold,
  taxable_income, taxRate, display_taxRate, quickDeduction, lastweek_taxable_income,
  lastweek_taxRate, lastweek_quickDeduction, tax, lastweek_tax,
  current_tax, taxed_income } = storeToRefs(usePersonalTaxResultStore());
const monthsValidator = (x: number) => x >= 1 && x <= 12;
const incomeValidator = (x: number) => x >= 0;
const fiveonetaxValidator = (x: number) => x >= 0;
const sidecostsValidator = (x: number) => x >= 0;
const othercostsValidator = (x: number) => x >= 0;

const deleteAll = () => {
  RegionName.value = '请选择地区';
  months.value = 1;
  fiveonetax.value = 0; sidecosts.value = 0; othercosts.value = 0;
  income.value = 3000; tax_threshold.value = 5000;
  computeAllInput();
  all_income.value = 0; all_fiveonetax.value = 0; all_sidecosts.value = 0; all_othercosts.value = 0; all_tax_threshold.value = 0;
  taxRate.value = 0.03; display_taxRate.value = 100 * taxRate.value;
  taxable_income.value = 0; quickDeduction.value = 0; tax.value = 0; lastweek_tax.value = 0; current_tax.value = 0; taxed_income.value = 0;
}

const computeResult = () => {
  computeTaxableIncome();
  computeLastWeekTaxableIncome();
  computeTax();
  computeLastWeekTax();
  computeTaxedIncome();
  toPresicion();
  display_taxRate.value = 100 * taxRate.value;
}

//节流处理 
const throttledCalculate = throttle(() => {
computeResult();
addHistory();
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

const computeAllInput = () => {
  all_income.value = months.value * income.value;
  all_fiveonetax.value = months.value * fiveonetax.value;
  all_sidecosts.value = months.value * sidecosts.value;
  all_othercosts.value = months.value * othercosts.value;
  all_tax_threshold.value = months.value * tax_threshold.value;
  all_fiveonetax.value = Number(all_fiveonetax.value.toFixed(precision.value));
}

const computeTaxableIncome = () => {
  taxable_income.value = Math.max(0, all_income.value - all_fiveonetax.value - all_sidecosts.value - all_othercosts.value - all_tax_threshold.value)
}

const computeLastWeekTaxableIncome = () => {
  lastweek_taxable_income.value = Math.max(0, taxable_income.value - income.value + fiveonetax.value + sidecosts.value + othercosts.value + tax_threshold.value)
}

const computeTax = () => {
  if (taxable_income.value <= 36000) {
    taxRate.value = 0.03, quickDeduction.value = 0
  } else if (taxable_income.value <= 144000) {
    taxRate.value = 0.1, quickDeduction.value = 2520
  } else if (taxable_income.value <= 300000) {
    taxRate.value = 0.2, quickDeduction.value = 16920
  } else if (taxable_income.value <= 420000) {
    taxRate.value = 0.25, quickDeduction.value = 31920
  } else if (taxable_income.value <= 660000) {
    taxRate.value = 0.3, quickDeduction.value = 52920
  } else if (taxable_income.value <= 960000) {
    taxRate.value = 0.35, quickDeduction.value = 85920
  } else {
    taxRate.value = 0.45, quickDeduction.value = 181920
  }
  tax.value = taxRate.value * taxable_income.value - quickDeduction.value
}

const computeLastWeekTax = () => {
  if (lastweek_taxable_income.value <= 36000) {
    lastweek_taxRate.value = 0.03, lastweek_quickDeduction.value = 0
  } else if (lastweek_taxable_income.value <= 144000) {
    lastweek_taxRate.value = 0.1, lastweek_quickDeduction.value = 2520
  } else if (lastweek_taxable_income.value <= 300000) {
    lastweek_taxRate.value = 0.2, lastweek_quickDeduction.value = 16920
  } else if (lastweek_taxable_income.value <= 420000) {
    lastweek_taxRate.value = 0.25, lastweek_quickDeduction.value = 31920
  } else if (lastweek_taxable_income.value <= 660000) {
    lastweek_taxRate.value = 0.3, lastweek_quickDeduction.value = 52920
  } else if (lastweek_taxable_income.value <= 960000) {
    lastweek_taxRate.value = 0.35, lastweek_quickDeduction.value = 85920
  } else {
    lastweek_taxRate.value = 0.45, lastweek_quickDeduction.value = 181920
  }
  lastweek_tax.value = Math.min(lastweek_taxRate.value * lastweek_taxable_income.value - lastweek_quickDeduction.value, tax.value);
}

const computeTaxedIncome = () => {
  current_tax.value = tax.value - lastweek_tax.value;
  taxed_income.value = income.value - fiveonetax.value - current_tax.value;
}

const toPresicion = () => {
  taxable_income.value = Number(taxable_income.value.toFixed(precision.value));
  quickDeduction.value = Number(quickDeduction.value.toFixed(precision.value));
  tax.value = Number(tax.value.toFixed(precision.value));
  lastweek_tax.value = Number(lastweek_tax.value.toFixed(precision.value));
  current_tax.value = Number(current_tax.value.toFixed(precision.value));
  taxed_income.value = Number(taxed_income.value.toFixed(precision.value));
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

const historyStore = useHistoryStore();
// @@@@@@@@@@@@@@@@@@@@@@@@
// 添加历史记录
// @@@@@@@@@@@@@@@@@@@@@@@@
const addHistory = () => {
  let history: HistoryData = {
    saveTime: Date.now(),
    name: 'personal-tax',
    inputData: {
      RegionName: RegionName.value,
      months: months.value,
      income: income.value,
      fiveonetax: fiveonetax.value,
      sidecosts: sidecosts.value,
      othercosts: othercosts.value,
      tax_threshold: tax_threshold.value
    },
    resultData: {
      all_income: all_income.value,
      all_fiveonetax: all_fiveonetax.value,
      all_sidecosts: all_sidecosts.value,
      all_othercosts: all_othercosts.value,
      all_tax_threshold: all_tax_threshold.value,
      taxable_income: taxable_income.value,
      tax: tax.value,
      display_taxRate: display_taxRate.value,
      current_tax: current_tax.value,
      taxed_income: taxed_income.value   
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
    RegionName.value = inputData.RegionName
    months.value = inputData.months;
    income.value = inputData.income;
    fiveonetax.value = inputData.fiveonetax;
    sidecosts.value = inputData.sidecosts;
    othercosts.value = inputData.othercosts;
    tax_threshold.value = inputData.tax_threshold;
    all_income.value = resultData.all_income;
    all_fiveonetax.value = resultData.all_fiveonetax;
    all_sidecosts.value = resultData.all_sidecosts;
    all_othercosts.value = resultData.all_othercosts;
    all_tax_threshold.value = resultData.all_tax_threshold;
    taxable_income.value = resultData.taxable_income;
    tax.value = resultData.tax;
    display_taxRate.value = resultData.display_taxRate;
    current_tax.value = resultData.current_tax;
    taxed_income.value = resultData.taxed_income;
  }
}

// 添加数字变化特效
const taxable_income_view = reactive({
  number: taxed_income.value
})
const tax_view = reactive({
  number: tax.value
})
const display_taxRate_view = reactive({
  number: display_taxRate.value
})
const current_tax_view = reactive({
  number: current_tax.value
})
const taxed_income_view = reactive({
  number: taxed_income.value
})

watch(taxable_income, (newVal) => {
  gsap.to(taxable_income_view, { 
    duration: 0.5, 
    number: newVal,
    onUpdate: () => {
      // 在动画过程中格式化数字
      taxable_income_view.number = Number(taxable_income_view.number.toFixed(precision.value));
    }
  });
})
watch(tax, (newVal) => {
  gsap.to(tax_view, { 
    duration: 0.5, 
    number: newVal,
    onUpdate: () => {
      // 在动画过程中格式化数字
      tax_view.number = Number(tax_view.number.toFixed(precision.value));
    }
  });
})
watch(display_taxRate, (newVal) => {
  gsap.to(display_taxRate_view, { 
    duration: 0.5, 
    number: newVal,
    onUpdate: () => {
      // 在动画过程中格式化数字
      display_taxRate_view.number = Number(display_taxRate_view.number.toFixed(precision.value));
    }
  });
})
watch(current_tax, (newVal) => {
  gsap.to(current_tax_view, { 
    duration: 0.5, 
    number: newVal,
    onUpdate: () => {
      // 在动画过程中格式化数字
      current_tax_view.number = Number(current_tax_view.number.toFixed(precision.value));
    }
  });
})
watch(taxed_income, (newVal) => {
  gsap.to(taxed_income_view, { 
    duration: 0.5, 
    number: newVal,
    onUpdate: () => {
      // 在动画过程中格式化数字
      taxed_income_view.number = Number(taxed_income_view.number.toFixed(precision.value));
    }
  });
})

// 文档速查
const isPersonalTax = ref(false);
const handleModalShowChange = (value: any) => {
  isPersonalTax.value = value;
};
</script>

<style scoped>
.month-input {
  width: 100%;
}

.personal-tax-calc-container {
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.label,
.result-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-right: 10px;
}
.button-group {
  margin-top: 20px;
  display: flex;
  justify-content: space-evenly;
}

.option {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 5px;
  width: 100%;
}

.option-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  gap: 10%;
}

td {
  text-align: center;
  width: 20%;
}

th {
  text-align: center;
  font-weight: bold;
}

.all-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fiveone-tax {
  text-decoration: none;
  color: #e5a84b;
}

.doc-icon {
  cursor: pointer;
}
.option-and-icon {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}
</style>
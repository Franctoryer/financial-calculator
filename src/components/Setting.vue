<template>
  <div>
    <n-space :size="30" vertical class="setting-container">
      <!-- 计息方式 -->
      <n-space vertical :size="5">
        <div class="option-title">计息方式：</div>
        <n-radio-group v-model:value="interestMethod">
          <n-radio-button value="single"> 单利 </n-radio-button>
          <n-radio-button value="compound"> 复利 </n-radio-button>
        </n-radio-group>
      </n-space>
      <!-- 精度 -->
      <n-space vertical :size="5">
        <div class="option-title">精度（保留小数点个数）：</div>
        <n-slider v-model:value="precision" :step="1" :max="8">
          <template #thumb v-if="precision < 3">
            <n-icon-wrapper :size="16" :border-radius="10">
              <n-icon :size="15" :component="AnimalTurtle24Regular"/>
            </n-icon-wrapper>
          </template>
          <template #thumb v-else-if="precision >= 3 && precision <= 5">
            <n-icon-wrapper :size="16" :border-radius="10">
              <n-icon :size="15" :component="AnimalCat24Regular"/>
            </n-icon-wrapper>
          </template>
          <template #thumb v-else>
            <n-icon-wrapper :size="16" :border-radius="10">
              <n-icon :size="15" :component="AnimalRabbit24Regular"/>
            </n-icon-wrapper>
          </template>
        </n-slider>
        <n-input-number v-model:value="precision" size="small" :validator="precisonValidator"/>
      </n-space>
      <!-- 货币类型 -->
      <n-space vertical :size="5">
        <div class="option-title">货币类型：</div>
        <n-select v-model:value="currencyType" :options="currencyOptions" />
      </n-space>
      <!-- 时间单位 -->
      <n-space vertical :size="5">
        <div class="option-title">时间单位：</div>
        <n-radio-group v-model:value="timeUnit">
          <n-radio-button value="year"> 年 </n-radio-button>
          <n-radio-button value="month"> 月 </n-radio-button>
          <n-radio-button value="week"> 周 </n-radio-button>
          <n-radio-button value="day"> 日 </n-radio-button>
        </n-radio-group>
      </n-space>
      <n-space vertical :size="5">
        是否显示提示信息：
        <n-switch :round="false" v-model:value="isDisplayInfo"/>
      </n-space>
    </n-space>
  </div>
</template>

<script setup lang="ts">
  import { NRadioGroup, NRadioButton, NSwitch, NSpace, NSlider, NInputNumber, NIcon, NIconWrapper, NSelect, NAlert } from 'naive-ui';
  import AnimalCat24Regular from '@vicons/fluent/AnimalCat24Regular'
  import AnimalTurtle24Regular from '@vicons/fluent/AnimalTurtle24Regular';
  import AnimalRabbit24Regular from '@vicons/fluent/AnimalRabbit24Regular';
  import { useSettingStore } from '@/stores/settingStore';
  import { storeToRefs } from 'pinia';

  const { interestMethod, precision, currencyType, timeUnit, isDisplayInfo } = storeToRefs(useSettingStore());
  const precisonValidator = (x: number) => x >= 0 && x <= 8;  // 验证精度值是否合法
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

</script>

<style scoped>
  .setting-container {
    width: 100%;
  }

  ul {
    padding-left: 20px;
  }
  li {
    list-style-type: circle;
  }
</style>
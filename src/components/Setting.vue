<template>
  <div>
    <n-space :size="30" vertical class="setting-container">
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
      <!-- 时间点模式 -->
      <n-space vertical :size="5">
        <div class="option-title">时间点模式（BGN/END）：</div>
        <n-radio-group v-model:value="timeMode">
          <n-radio-button value="BGN"> 期初 </n-radio-button>
          <n-radio-button value="END"> 期末 </n-radio-button>
        </n-radio-group>
      </n-space>
      <!-- 货币类型 -->
      <n-space vertical :size="5">
        <div class="option-title">货币类型：</div>
        <n-select 
          v-model:value="currencyType" 
          :options="currencyOptions" 
          filterable 
          :filter="filterCurrency"
        >
          <template #arrow>
            <BookCoins20Filled/>
          </template>
        </n-select>
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
      <n-space vertical :size="5">
        是否启用快速文档查找：
        <n-switch :round="false" v-model:value="isQkDocLkup"/>
      </n-space>
      <n-space vertical :size="5">
        无障碍访问模式：
        <n-switch :round="false" v-model:value="isBarrierFree" />
      </n-space>
      <!-- 恢复默认设置按钮 -->
      <n-button @click="settingStore.storeDefault" type="default" secondary>
        <template #icon>
          <n-icon>
            <SquareHintArrowBack16Regular/>
          </n-icon>
        </template>
        恢复默认设置
      </n-button>
    </n-space>
  </div>
</template>

<script setup lang="ts">
  import { NTooltip, NRadioGroup, NRadioButton, NSwitch, NSpace, NSlider, NInputNumber, NIcon, NIconWrapper, NSelect, NButton } from 'naive-ui';
  import AnimalCat24Regular from '@vicons/fluent/AnimalCat24Regular'
  import AnimalTurtle24Regular from '@vicons/fluent/AnimalTurtle24Regular';
  import AnimalRabbit24Regular from '@vicons/fluent/AnimalRabbit24Regular';
  import SquareHintArrowBack16Regular from '@vicons/fluent/SquareHintArrowBack16Regular';
  import { useSettingStore } from '@/stores/settingStore';
  import { storeToRefs } from 'pinia';
  import { h } from 'vue';
  import type { VNode } from 'vue';
  import type { SelectOption } from 'naive-ui';
  // @ts-ignore
  import { BookCoins20Filled } from '@vicons/fluent';

  const settingStore = useSettingStore();
  const { precision, currencyType, timeUnit, isDisplayInfo, timeMode, isBarrierFree, isQkDocLkup } = storeToRefs(settingStore);
  const precisonValidator = (x: number) => x >= 0 && x <= 8;  // 验证精度值是否合法
  const currencyOptions = [
    { label: '美元', value: 'USD' },
    { label: '欧元', value: 'EUR' },
    { label: '英镑', value: 'GBP' },
    { label: '日元', value: 'JPY' },
    { label: '瑞士法郎', value: 'CHF' },
    { label: '加元', value: 'CAD' },
    { label: '澳元', value: 'AUD' },
    { label: '人民币', value: 'CNY' },
    { label: '印度卢比', value: 'INR' },
    { label: '俄罗斯卢布', value: 'RUB' },
    { label: '巴西雷亚尔', value: 'BRL' },
    { label: '南非兰特', value: 'ZAR' },
    { label: '墨西哥比索', value: 'MXN' },
    { label: '新加坡元', value: 'SGD' },
    { label: '港元', value: 'HKD' },
    { label: '新西兰元', value: 'NZD' },
    { label: '韩元', value: 'KRW' },
    { label: '泰铢', value: 'THB' },
    { label: '马来西亚林吉特', value: 'MYR' },
    { label: '印尼卢比', value: 'IDR' },
    { label: '菲律宾比索', value: 'PHP' },
    { label: '越南盾', value: 'VND' },
    { label: '阿联酋迪拉姆', value: 'AED' },
    { label: '沙特里亚尔', value: 'SAR' },
    { label: '土耳其里拉', value: 'TRY' },
    { label: '埃及镑', value: 'EGP' },
    { label: '以色列新谢克尔', value: 'ILS' },
    { label: '智利比索', value: 'CLP' },
    { label: '哥伦比亚比索', value: 'COP' },
    { label: '阿根廷比索', value: 'ARS' },
    { label: '秘鲁索尔', value: 'PEN' },
    { label: '乌拉圭比索', value: 'UYU' },
    { label: '委内瑞拉玻利瓦尔', value: 'VES' },
    { label: '巴拿马巴波亚', value: 'PAB' },
    { label: '古巴比索', value: 'CUP' },
    { label: '多米尼加比索', value: 'DOP' },
    { label: '牙买加元', value: 'JMD' },
    { label: '巴哈马元', value: 'BSD' },
    { label: '特立尼达和多巴哥元', value: 'TTD' },
    { label: '巴巴多斯元', value: 'BBD' },
    { label: '格林纳达元', value: 'XCD' },
    { label: '苏里南元', value: 'SRD' },
    { label: '圭亚那元', value: 'GYD' },
    { label: '波兰兹罗提', value: 'PLN' },
    { label: '捷克克朗', value: 'CZK' },
    { label: '匈牙利福林', value: 'HUF' },
    { label: '罗马尼亚列伊', value: 'RON' },
    { label: '保加利亚列弗', value: 'BGN' },
    { label: '克罗地亚库纳', value: 'HRK' },
    { label: '挪威克朗', value: 'NOK' },
    { label: '瑞典克朗', value: 'SEK' },
    { label: '丹麦克朗', value: 'DKK' },
    { label: '冰岛克朗', value: 'ISK' },
    { label: '乌克兰格里夫纳', value: 'UAH' },
    { label: '格鲁吉亚拉里', value: 'GEL' },
    { label: '哈萨克斯坦坚戈', value: 'KZT' },
    { label: '吉尔吉斯斯坦索姆', value: 'KGS' },
    { label: '乌兹别克斯坦索姆', value: 'UZS' },
    { label: '土库曼斯坦马纳特', value: 'TMT' },
    { label: '塔吉克斯坦索莫尼', value: 'TJS' },
    { label: '阿塞拜疆马纳特', value: 'AZN' },
    { label: '亚美尼亚德拉姆', value: 'AMD' },
    { label: '白俄罗斯卢布', value: 'BYN' },
    { label: '摩尔多瓦列伊', value: 'MDL' },
    { label: '纳米比亚元', value: 'NAD' },
    { label: '博茨瓦纳普拉', value: 'BWP' },
    { label: '赞比亚克瓦查', value: 'ZMW' },
    { label: '马拉维克瓦查', value: 'MWK' },
    { label: '莫桑比克梅蒂卡尔', value: 'MZN' },
    { label: '安哥拉宽扎', value: 'AOA' },
    { label: '尼日利亚奈拉', value: 'NGN' },
    { label: '加纳塞地', value: 'GHS' },
    { label: '肯尼亚先令', value: 'KES' },
    { label: '坦桑尼亚先令', value: 'TZS' },
    { label: '乌干达先令', value: 'UGX' },
    { label: '卢旺达法郎', value: 'RWF' },
    { label: '布隆迪法郎', value: 'BIF' },
    { label: '埃塞俄比亚比尔', value: 'ETB' },
    { label: '索马里先令', value: 'SOS' },
    { label: '苏丹镑', value: 'SDG' },
    { label: '利比亚第纳尔', value: 'LYD' },
    { label: '突尼斯第纳尔', value: 'TND' },
    { label: '阿尔及利亚第纳尔', value: 'DZD' },
    { label: '摩洛哥迪拉姆', value: 'MAD' },
    { label: '塞拉利昂利昂', value: 'SLL' },
    { label: '佛得角埃斯库多', value: 'CVE' },
    { label: '毛里塔尼亚乌吉亚', value: 'MRU' },
    { label: '塞舌尔卢比', value: 'SCR' },
    { label: '毛里求斯卢比', value: 'MUR' },
    { label: '科摩罗法郎', value: 'KMF' },
    { label: '马达加斯加阿里亚里', value: 'MGA' },
    { label: '斐济元', value: 'FJD' },
    { label: '萨摩亚塔拉', value: 'WST' },
    { label: '汤加潘加', value: 'TOP' },
    { label: '瓦努阿图瓦图', value: 'VUV' },
    { label: '所罗门群岛元', value: 'SBD' },
    { label: '巴布亚新几内亚基那', value: 'PGK' },
    { label: '柬埔寨瑞尔', value: 'KHR' },
    { label: '老挝基普', value: 'LAK' },
    { label: '蒙古图格里克', value: 'MNT' },
    { label: '不丹努尔特鲁姆', value: 'BTN' },
    { label: '尼泊尔卢比', value: 'NPR' },
    { label: '斯里兰卡卢比', value: 'LKR' },
    { label: '马尔代夫拉菲亚', value: 'MVR' }
  ];
  const filterCurrency = (input: any, option: any) => {
    const searchTerm = input.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchTerm) || 
      option.value.toLowerCase().includes(searchTerm)
    );
  }
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
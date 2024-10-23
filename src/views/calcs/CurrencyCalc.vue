<template>
  <div class="main">
    <div class="options">
      <div class="option">
        金额数：
        <n-input-number v-model:value="money" :show-button="false">
          <template #suffix>
            {{ getCurrencySymbol(fromCurrency) }}
          </template>
        </n-input-number>
      </div>
      <div class="option">
        从：
        <n-select 
          :options="currencyOptions" 
          v-model:value="fromCurrency" 
          filterable 
          :filter="filterCurrency"
          clearable
          placeholder="货币名称或ISO代码"
        >
          <template #arrow>
            <BookCoins20Filled/>
          </template>
        </n-select>
      </div>
      <div class="option">
        到：
        <n-select 
          :options="currencyOptions" 
          v-model:value="toCurrency" 
          filterable 
          :filter="filterCurrency"
          placeholder="货币名称或ISO代码"
          clearable
        >
          <template #arrow>
            <BookCoins20Filled/>
          </template>
        </n-select>
      </div>
      <n-button type="info" @click="onClickCalculate" strong secondary :disabled="isButtonDisabled">转化</n-button>
      <n-button type="error" @click="deleteALL" strong secondary :disabled="isButtonDisabled">重置</n-button>
    </div>
    <n-divider/>
    <n-table>
      <thead>
        <tr>
          <th>转换金额数</th>
          <th>汇率</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ resultMoneyView.number }} {{ getCurrencySymbol(toCurrency) }}</td>
          <td>{{ exchangeRateView.number }}</td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>

<script setup lang="ts">
  import { NInputNumber, NSelect, NTable, NDivider, NButton } from "naive-ui";
  import { getCurrencySymbol } from "@/utils/getCurrencyFlag";
  import { storeToRefs } from "pinia"
  import { onMounted, watch, reactive } from "vue"
  import { useCurrencyInputStore } from "@/stores/input/CurrencyInputStore"
  import { useCurrencyResultStore } from "@/stores/result/CurrencyResultStore"
  import { useSettingStore } from "@/stores/settingStore";
  import { BAD_REQUEST } from "@/constants/message";
    import { UNKNOWN_OPTION, NO_DELETING, IRR_REQUIREMENT_ERROR, NO_MORE_CLICK } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import type { HistoryData } from "@/types/HistoryData";
  import { useHistoryStore } from "@/stores/historyStore";
  import { useRoute } from "vue-router";
  import gsap from "gsap"
  import { ref } from "vue";
  import { useLoadingBar } from 'naive-ui'
  // @ts-ignore
  import { BookCoins20Filled } from '@vicons/fluent';
  import { debounce, throttle } from 'lodash';

  //节流状态变量
let isThrottling = false;

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
  const { money, fromCurrency, toCurrency } = storeToRefs(useCurrencyInputStore());
  const { resultMoney, exchangeRate } = storeToRefs(useCurrencyResultStore())
  const { precision } = storeToRefs(useSettingStore());
  const isButtonDisabled = ref(false);

  const loadingBar = useLoadingBar(); // 加载条
  // 计算结果
  const calculateResult = async () => {
    isButtonDisabled.value = true;  // 禁用按钮
    try {
      const url = `https://api.frankfurter.app/latest?from=${fromCurrency.value}&to=${toCurrency.value}`;
      loadingBar.start();
      const res = await fetch(url, { method: 'GET' });
      const jsonData = await res.json();
      exchangeRate.value = jsonData["rates"][`${toCurrency.value}`]
      resultMoney.value = exchangeRate.value * money.value;
      addHistory();
      loadingBar.finish();
    } catch {
      window.$message.error(BAD_REQUEST, MESSAGE_CONFIG);
      loadingBar.error();
    } finally {
      isButtonDisabled.value = false;  // 启用按钮
    }
  }

    //节流处理 
const throttledCalculate = throttle(() => {
  calculateResult();
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


  const deleteALL = () =>{
    money.value = 1 ;
    fromCurrency.value = null;
    toCurrency.value = null;
    resultMoney.value = 0 ;
    exchangeRate.value = 0;
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@
  // 添加历史记录
  // @@@@@@@@@@@@@@@@@@@@@@@@
  const historyStore = useHistoryStore();
  const addHistory = () => {
    let history: HistoryData = {
      saveTime: Date.now(),
      name: 'currency',
      inputData: {
        money: money.value,
        fromCurrency: fromCurrency.value,
        toCurrency: toCurrency.value
      },
      resultData: {
        resultMoney: resultMoney.value,
        exchangeRate: exchangeRate.value
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
      money.value = inputData.money;
      fromCurrency.value = inputData.fromCurrency;
      toCurrency.value = inputData.toCurrency;
      resultMoney.value = resultData.resultMoney;
      exchangeRate.value = resultData.exchangeRate;
    }
  }

  // @@@@@@@@@@@@@@@@@@@
  // 添加数字递增效果
  // @@@@@@@@@@@@@@@@@@@
  const resultMoneyView = reactive({
    number: Number(resultMoney.value)
  })
  const exchangeRateView = reactive({
    number: Number(exchangeRate.value)
  })
  watch(resultMoney, (n) => {
    gsap.to(resultMoneyView, {
      duration: 0.5,
      number: Number(n),
      onUpdate: () => {
        resultMoneyView.number = Number(resultMoneyView.number.toFixed(precision.value));
      }
    })
  })

  watch(exchangeRate, (n) => {
    gsap.to(exchangeRateView, {
      duration: 0.5,
      number: Number(n),
    })
  })
</script>

<style scoped>
  .main {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
  }

  .options {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: end;
  }
  .option {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
  }

  th {
    text-align: center;
    font-weight: bold;
  }
  td {
    text-align: center;
    width: 50%;
  }
</style>

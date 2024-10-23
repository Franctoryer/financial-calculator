<template>
  <div class="main">
    <n-space vertical class="interest">
      贴现率：
      <n-slider v-model:value="interest" :step="0.05" :max="1"/>
      <n-input-number 
        v-model:value="interest" 
        size="small" 
        :validator="(num: number) => num >= 0 && num <= 1"
        :step="0.01"
      />
    </n-space>
    <div class="judge-compound">
      <n-radio-group v-model:value="interestMethod">
        <n-radio-button value="Simple">
          单利
        </n-radio-button>
        <n-radio-button value="Compound">
          分期复利
        </n-radio-button>
        <n-radio-button value="ContinuousCompound">
          连续复利
        </n-radio-button>
      </n-radio-group>
      <n-icon 
        :component="BookSearch24Regular" 
        :size="20" @click="isInterestMethod = true" 
        :depth="3"
        v-if="isQkDocLkup"
      >
      </n-icon>
    </div>
    <n-alert type="info" class="judge-compound" v-if="isDisplayInfo && interestMethod === 'Simple'">
      当前为 <b style="color: rgb(191, 15, 15)">单利</b> 模式，净现值一般采用 <b>分期复利</b> 计算，请注意甄别
    </n-alert>
    <n-alert type="info" class="judge-compound" v-if="isDisplayInfo && interestMethod === 'ContinuousCompound'">
      当前为 <b style="color: rgb(191, 15, 15)">连续复利</b> 模式，净现值一般采用 <b>分期复利</b> 计算，请注意甄别
    </n-alert>
    <div class="button-group">
      <n-button @click="addRow()" type="success" strong secondary> 添加行 </n-button>
      <n-button @click="deleteRow()" type="warning" strong secondary>删除最后一行</n-button>
      <n-button @click="deleteAll" type="error" strong secondary>全部清除</n-button>
      <n-button type="info" @click="onClickCalculate" strong secondary>计算</n-button>
    </div>
    <hr>
    <div class="data-and-chart">
      <n-data-table 
        bordered
        :columns="columns" 
        :data="displayData" 
        :single-line="false"
        striped 
        :pagination="{ pageSize: 10 }"
        size="small"
        :row-props="rowProps"
        class="data-table"
        :max-height="250"
      />
      <n-dropdown
        placement="bottom-start"
        trigger="manual"
        :x="xRef"
        :y="yRef"
        :options="options"
        :show="showDropdownRef"
        :on-clickoutside="onClickoutside"
        @select="handleSelect"
      />
      <!-- <pre>{{ JSON.stringify(rawData, null, 2) }}</pre> -->
      <div ref="cashFlowChart" id="cashFlowChart"></div>
    </div>
    <n-modal 
      :show="isInterestMethod"
      size="huge"
      style="width: 80%;"
      preset="card"
      @update:show="handleModalShowChange"
    >
      <n-scrollbar style="max-height: 60vh" trigger="none">
        <InterestMethodManual class="modal-content"/>
      </n-scrollbar>
    </n-modal>
    <hr>
    <n-table>
      <thead>
        <tr>
          <th>净现值</th>
          <th>内部收益率</th>
          <th>盈利指数</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ npvView.number }} {{ currencySymbol }}</td>
          <td>{{ irrView.number }}</td>
          <td>{{ piView.number }}</td>
        </tr>
      </tbody>
    </n-table>
    <n-alert type="warning" class="irr-warning" v-if="isDisplayInfo && precision >= 5"> 高精度下内部收益率会不准确</n-alert>
    <div ref="senChart" id="senChart"></div>
  </div>
</template>

<script setup lang="ts">
  import { NTable, NDataTable, NInputNumber, NButton, NSpace, NSlider, NDropdown, NModal, NScrollbar, NAlert, NIcon, NRadioGroup, NRadioButton,  } from 'naive-ui';
  import { ref, h, computed, nextTick, reactive } from 'vue';
  import { parseCurrency, formatCurrency } from "@/constants/InputNumber";
  import type { DataTableColumns, DropdownOption } from 'naive-ui'
  import type { ComputedRef } from 'vue';
  import type { CCFRowData } from '@/types/CCFData';
  import { useSettingStore } from "@/stores/settingStore";
  import { useCircledCFInputStore } from "@/stores/input/CircledCFInputStore"
  import { useCircledCFResultStore } from "@/stores/result/CircledCFResultStore";
  import { storeToRefs } from "pinia";
  import { NPV, continuousCompoundingNPV, simpleInterestNPV } from "@/utils/NPV";
  import { IRR } from "@/utils/IRR";
  import { UNKNOWN_OPTION, NO_DELETING, IRR_REQUIREMENT_ERROR, NO_MORE_CLICK } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import * as echarts from "echarts";
  import { onMounted } from 'vue';
  import { watchEffect, watch } from 'vue';
    // @ts-ignore
  import { AddSubtractCircle24Filled, BookSearch24Regular } from '@vicons/fluent';
  import type { TooltipItem } from "@/types/TooltipItem";
  import { useRoute } from 'vue-router';
  import { useHistoryStore } from "@/stores/historyStore";
  import gsap from "gsap";
  import type { HistoryData } from "@/types/HistoryData";
  import { useThemeStore } from "@/stores/themeStore";
  import 'echarts/theme/dark'
  import InterestMethodManual from '../manuals/InterestMethodManual.vue';
  import { debounce, throttle } from 'lodash';

//节流状态变量
let isThrottling = false;
  // 主题颜色
  const { themeClass, isDark } = storeToRefs(useThemeStore());
  // 模态框
  const isInterestMethod = ref(false);
  const handleModalShowChange = (value: any) => {
    isInterestMethod.value = value;
  };
  const { timeUnitText, precision, isDisplayInfo, currencySymbol, isBarrierFree, isQkDocLkup } = storeToRefs(useSettingStore());
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 表格相关数据和方法
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 原始数据，和表格输入绑定的数据
  const { CCFRawData: rawData, interest, interestMethod } = storeToRefs(useCircledCFInputStore());
  // 表格上展示的数据
  const displayData = computed(() => {
    let sumTime = 0;
    let result = [];
    for (let item of rawData.value) {
      if (item.freq <= 1) {
        result.push({order: `第${sumTime}${timeUnitText.value}`, cash: item.cash, freq: item.freq})
        sumTime += item.freq;
      } else {
        let oldSumTime = sumTime;
        sumTime += item.freq;
        result.push({order: `第${oldSumTime}~${sumTime - 1}${timeUnitText.value}`, cash: item.cash, freq: item.freq})
      }
    }
    return result;
  })
  // 现金流数据，计算需要的数据
  const cashFlowData: ComputedRef<number[]> = computed(() => rawData.value.flatMap(item => Array(item.freq).fill(item.cash)))
  const createColumns = (): DataTableColumns<CCFRowData> => [
      {
        title: '时间',
        key: 'order',
        className: 'time',
        align: 'center',
        width: '20%'
      },
      {
        // 这个有取相反数的图标
        title: '现金流入/支出',
        key: 'cash',
        width: '55%',
        render(row, index) {
          return h('div', {
            style: {
              display: 'flex',
              alignItems: 'center'
            }
          }, [
            h(NButton, {
              size: 'small',
              bordered: false,
              circle: true,
              onClick: () => {
                // 将输入的内容变成其相反数
                const oppositeValue = -(row.cash);
                rawData.value[index].cash = oppositeValue;
              }
            }, {
              default: () => h(NIcon, null, {
                default: () => h(AddSubtractCircle24Filled) // 使用图标
              })
            }),
            h(NInputNumber, {
              value: row.cash,
              format: formatCurrency,
              parse: parseCurrency,
              step: 100,
              size: 'small',
              style: 'width: 100%',
              showButton: false,
              onUpdateValue(v) {
                rawData.value[index].cash = v || 0;
              }
            }, {
              suffix: () => currencySymbol.value
            })
          ]);
        }
      },
      {
        title: '频数',
        key: 'freq',
        render(row, index) {
          return h(NInputNumber, {
            value: row.freq,
            size: 'small',
            validator: (x: number) => x >= 1 && x <= 200,
            onUpdateValue(v) {
              rawData.value[index].freq = v || 0
            }
          })
        }
      }
  ]
  const columns = createColumns();
  // 右键菜单
  const options: DropdownOption[] = [
    {
      label: '向上插入一行',
      key: 'insert-above'
    },
    {
      label: () => h('span', { style: { color: '#ba5b49' } }, '删除当前行'),
      key: 'delete'
    },
    {
      label: '向下插入一行',
      key: 'insert-below'
    },
  ]
  const showDropdownRef = ref(false)
  const xRef = ref(0)
  const yRef = ref(0)
  const selectedRowIndex = ref<number | null>(null);  // 记录选中的行的索引

  const handleSelect = (key: string) => {
    if (selectedRowIndex.value === null) {
      return;
    }

    switch(key) {
      case 'delete': {
        deleteRow(selectedRowIndex.value)
        showDropdownRef.value = false;
        selectedRowIndex.value = null;  // 重置选中的索引
        break;
      }
      case 'insert-below': {
        addRow(selectedRowIndex.value + 1)
        showDropdownRef.value = false;
        selectedRowIndex.value = null;  // 重置选中的索引
        break;
      }
      case 'insert-above': {
        addRow(selectedRowIndex.value)
        showDropdownRef.value = false;
        selectedRowIndex.value = null;  // 重置选中的索引
        break;
      }
      default: {
        window.$message.error(UNKNOWN_OPTION, MESSAGE_CONFIG);
      }
    }
  }
  const onClickoutside = () => {
    showDropdownRef.value = false
  }
  const rowProps = (row: CCFRowData, index: number) => {
    return {
      onContextmenu: (e: MouseEvent) => {
        e.preventDefault();
        selectedRowIndex.value = index;  // 记录当前行的索引
        showDropdownRef.value = false;
        showDropdownRef.value = false
        nextTick().then(() => {
          showDropdownRef.value = true
          xRef.value = e.clientX
          yRef.value = e.clientY
        })
      }
    }
  }
  // 增加表格行数
  const addRow = (index?: number) => {
    let len = rawData.value.length;
    rawData.value.splice(index || len + 1, 0, {
      order: len + 1,
      cash: 1000,
      freq: 1
    })
  }
  // 删除表格对应的行
  const deleteRow = (index?: number) => {
    if (rawData.value.length === 0) {
      window.$message.warning(NO_DELETING, MESSAGE_CONFIG)
      return;
    }
    let len = rawData.value.length;
    rawData.value.splice(index || len - 1, 1);  // 删除对应索引的行数据
  }
  // 删除所有数据
  const deleteAll = () => {
    if (rawData.value.length === 0) {
      window.$message.warning(NO_DELETING, MESSAGE_CONFIG)
      return;
    }
    rawData.value = [];
  }


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 结果相关的数据和方法(NPV和IRR)
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 导入净现值和内部收益率
  const { npv, irr, pi } = storeToRefs(useCircledCFResultStore());
  // 按计算按钮，刷新结果，将数据保存到历史记录
  const computeResult = () => {
    npv.value = computeNPV(interest.value);
    irr.value = computeIRR();
    pi.value = computePI();
    addHistory();
  }

  //节流处理 
const throttledCalculate = throttle(() => {
 computeResult();
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
  // 计算净现值
  const computeNPV = (interest: number) => {
    if (cashFlowData.value.length === 0) {
      return 0;
    } else if (cashFlowData.value.length === 1) {
      return cashFlowData.value[0];
    } else {
      let result: number;
      switch (interestMethod.value) {
        case 'Simple':
          result = Number(simpleInterestNPV(interest, cashFlowData.value).toFixed(precision.value));
          break;
        case 'Compound':
          result = Number(NPV(interest, cashFlowData.value).toFixed(precision.value)); 
          break;
        case 'ContinuousCompound':
          result = Number(continuousCompoundingNPV(interest, cashFlowData.value).toFixed(precision.value))
          break;
        default:
          result = NaN;
      }
      return result; 
    }
  }
  // 计算IRR
  const computeIRR = () => {
    if (cashFlowData.value.length === 0) {
      return NaN;
    }
    if (!isValidToIRR()) {
      window.$message.error(IRR_REQUIREMENT_ERROR, MESSAGE_CONFIG)
      return NaN;
    }
    let result: number;
    switch (interestMethod.value) {
      case 'Simple':
        result = Number(IRR(simpleInterestNPV, cashFlowData.value).toFixed(precision.value));
        break;
      case 'Compound':
        result = Number(IRR(NPV, cashFlowData.value).toFixed(precision.value)); 
        break;
      case 'ContinuousCompound':
        result = Number(IRR(continuousCompoundingNPV, cashFlowData.value).toFixed(precision.value))
        break;
      default:
        result = NaN;
    }
    return result;
  }
  // 计算PI
  const computePI = () => {
    // 如果期初投资是正数，盈利指标没有意义
    if (cashFlowData.value.length === 0 || cashFlowData.value[0] >= 0) {
      return NaN;
    }
    let result = (npv.value - cashFlowData.value[0]) / (-cashFlowData.value[0]);
    return  Number(result.toFixed(precision.value));
  }
  // 判断输入的现金流是否能计算IRR(至少一正一负)
  const isValidToIRR = () => {
    let positive = 0;
    let negative = 0;
    cashFlowData.value.forEach(val => {
      if (val > 0)  positive++;
      if (val < 0)  negative++;
    })

    return positive > 0 && negative > 0;
  }
  // 将计算结果和计算输入存入历史记录
  const historyStore = useHistoryStore();

  // 添加历史记录
  const addHistory = () => {
    let history: HistoryData = {
      saveTime: Date.now(),
      name: 'circled-cashflow',
      inputData: {
        interest: interest.value,
        interestMethod: interestMethod.value,
        rawData: JSON.parse(JSON.stringify(rawData.value))  // 引用对象要深拷贝而不是浅拷贝
      },
      resultData: {
        npv: npv.value,
        irr: irr.value,
        pi: pi.value
      }
    } 
    historyStore.addHistory(history);
  }

  // 添加数字滚动特效
  const npvView = reactive({
    number: Number(npv.value)
  });
  const irrView = reactive({
    number: Number(irr.value)
  });
  const piView = reactive({
    number: Number(pi.value)
  });
  watch(npv, (n) => {
    gsap.to(npvView, { 
      duration: 0.5, 
      number: Number(n),
      onUpdate: () => {
        // 在动画过程中格式化数字
        npvView.number = Number(npvView.number.toFixed(precision.value));
      }
    });
  });
  watch(irr, (newVal, oldVal) => {
    // 如果旧值或者新值是NAN，没有动画
    if (Number.isNaN(newVal) || Number.isNaN(oldVal)) {
      irrView.number = newVal;
      return;
    }
    gsap.to(irrView, { 
      duration: 0.5, 
      number: newVal,
      onUpdate: () => {
        // 在动画过程中格式化数字
        irrView.number = Number(irrView.number.toFixed(precision.value));
      }
    });
  })
  watch(pi, (newVal, oldVal) => {
    // 如果旧值或者新值是NAN，没有动画
    if (Number.isNaN(newVal) || Number.isNaN(oldVal)) {
      piView.number = newVal;
      return;
    }
    gsap.to(piView, { 
      duration: 0.5, 
      number: newVal,
      onUpdate: () => {
        // 在动画过程中格式化数字
        piView.number = Number(piView.number.toFixed(precision.value));
      }
    });
  })
  
  // @@@@@@@@@@@@@@@@@@@@@@@@@
  // 灵敏度分析（NPV和PI）
  // @@@@@@@@@@@@@@@@@@@@@@@@@
  const senArr = computed(() => {
    let result1 = [];
    let result2 = [];
    let initialValue = cashFlowData.value.length > 0 && cashFlowData.value[0] < 0 ? -cashFlowData.value[0] : NaN;
    // 计算贴现率每增长0.1，净现值的变化
    for (let i = 0; i <= 1; i += 0.1) {
      let npv = computeNPV(i);
      result1.push(npv);
      result2.push(Number((npv / initialValue).toFixed(precision.value)));
    }
    return { result1, result2 };
  })

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 现金流可视化（现金流量图）
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 画现金流量图
  const cashFlowChart = ref(null);
  let myChart: any;
  const chartOption1 = {
    backgroundColor: `${isDark.value ? '#101014' : 'white'}`,
    aria:{
      enabled: true,
      decal:{
        show: isBarrierFree.value,
      }
    },
    gird: {
      right: '10px',
    },
    yAxis: {
      type: 'category',
      data: Array.from({ length: cashFlowData.value.length }, (v, k) => `第${k}${timeUnitText.value}`),
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    xAxis: {
      type: 'value'
    },
    toolbox: {
      show: true,
      itemSize: 12,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        saveAsImage: {},
        restore: {},
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },//'<b>{b0}</b>: {c0}'
      formatter: function (params: any) {
          // 如果是 'axis' 触发，params 是一个数组，包含每个系列的数据
          // 如果是 'item' 触发，params 只有一个系列的数据
          let result = params.map((item: TooltipItem) => {
              let color = item.value < 0 ? '#ba5140' : '#4f6f46';
              if (item.value === 0) {
                return '';
              }
              return `<b>${item.name}</b>: <b style="color: ${color}">${item.value} ${currencySymbol.value}</b>`;
          }).join('<br/>');
        return result;
      }
    },
    legend: {
      show: true,
      top: '5%',
      left: '5%',
      itemWidth: 15,
      itemHeight: 15,
      data: [
        {name: '支出', itemStyle: { color: '#ba5140'}},
        {name: '流入', itemStyle: { color: '#4f6f46'}}
      ],
      selectedMode: false
    },
    series: [
      {
        name: '支出',
        data: cashFlowData.value.map(value => value < 0 ? value : 0),
        type: 'bar',
        itemStyle: {
          color: (params: any) => {
            return params.value < 0 ? '#ba5140' : '#4f6f46';
          }
        },
        label: {
          show: true,
          formatter: (params: any) => params.value < 0 && cashFlowData.value.length <= 15 ? params.name : ''
        },
      },
      {
        name: '流入',
        data: cashFlowData.value.map(value => value > 0 ? value : 0),
        type: 'bar',
        itemStyle: {
          color: (params: any) => {
            return params.value < 0 ? '#ba5140' : '#4f6f46';
          }
        },
        label: {
          show: true,
          formatter: (params: any) => params.value > 0 && cashFlowData.value.length <= 15 ? params.name : ''
        },
        barGap: '-100%', // 设置柱形图重叠
        xAxisIndex: 0 // 确保两个系列使用同一个x轴
      },
    ]
  };
  onMounted(() => {
    myChart = isDark.value ? echarts.init(cashFlowChart.value, 'dark') : echarts.init(cashFlowChart.value);
    myChart.setOption(chartOption1, true);
    const resizeOb = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // 通过 ECharts 提供的方法获取实例并调用 resize 方法
        // @ts-ignore
        echarts.getInstanceByDom(entry.target).resize();
      }
    });
    // @ts-ignore
    resizeOb.observe(cashFlowChart.value);
  })
  // 监听 cashFlowData 的变化
  watchEffect(() => {
    // 更新 ECharts 图表
    if (cashFlowChart.value) {
      myChart.setOption({
        aria:{
          enabled: true,
          decal:{
            show: isBarrierFree.value,
          }
        },
        yAxis: {
          data: Array.from({ length: cashFlowData.value.length }, (v, k) => `第${k}${timeUnitText.value}`),
        },
        xAxis: {
          type: 'value',
        },
        series: [
          {
            data: cashFlowData.value.map(value => value < 0 ? value : 0),
            label: {
              show: true,
              formatter: (params: any) => params.value < 0 && cashFlowData.value.length <= 15 ? params.name : ''
            }
          },
          {
            data: cashFlowData.value.map(value => value > 0 ? value : 0),
            label: {
              show: true,
              formatter: (params: any) => params.value > 0 && cashFlowData.value.length <= 15 ? params.name : ''
            }
          }
        ],
      });
    }
  });
  watch(isDark, (newVal, oldVal) => {
    if (newVal != oldVal) {
      let newOption = {
        backgroundColor: `${isDark.value ? '#101014' : 'white'}`,
        aria:{
          enabled: true,
          decal:{
            show: isBarrierFree.value,
          }
        },
        gird: {
          right: '10px',
        },
        yAxis: {
          type: 'category',
          data: Array.from({ length: cashFlowData.value.length }, (v, k) => `第${k}${timeUnitText.value}`),
          axisLine: { show: false },
          axisLabel: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
        xAxis: {
          type: 'value'
        },
        toolbox: {
          show: true,
          itemSize: 12,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            saveAsImage: {},
            restore: {},
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },//'<b>{b0}</b>: {c0}'
          formatter: function (params: any) {
              // 如果是 'axis' 触发，params 是一个数组，包含每个系列的数据
              // 如果是 'item' 触发，params 只有一个系列的数据
              let result = params.map((item: TooltipItem) => {
                  if (item.value === 0) {
                    return '';
                  }
                  let color = item.value < 0 ? '#ba5140' : '#4f6f46';
                  return `<b>${item.name}</b>: <b style="color: ${color}">${item.value} ${currencySymbol.value}</b>`;
              }).join('<br/>');
            return result;
          }
        },
        legend: {
          show: true,
          top: '5%',
          left: '5%',
          itemWidth: 15,
          itemHeight: 15,
          data: [
            {name: '支出', itemStyle: { color: '#ba5140'}},
            {name: '流入', itemStyle: { color: '#4f6f46'}}
          ],
          selectedMode: false
        },
        series: [
          {
            name: '支出',
            data: cashFlowData.value.map(value => value < 0 ? value : 0),
            type: 'bar',
            itemStyle: {
              color: (params: any) => {
                return params.value < 0 ? '#ba5140' : '#4f6f46';
              }
            },
            label: {
              show: true,
              formatter: (params: any) => params.value < 0 && cashFlowData.value.length <= 15 ? params.name : ''
            },
          },
          {
            name: '流入',
            data: cashFlowData.value.map(value => value > 0 ? value : 0),
            type: 'bar',
            itemStyle: {
              color: (params: any) => {
                return params.value < 0 ? '#ba5140' : '#4f6f46';
              }
            },
            label: {
              show: true,
              formatter: (params: any) => params.value > 0 && cashFlowData.value.length <= 15 ? params.name : ''
            },
            barGap: '-100%', // 设置柱形图重叠
            xAxisIndex: 0 // 确保两个系列使用同一个x轴
          },
        ]
      };
      myChart.dispose(); // 销毁旧实例
      myChart = echarts.init(cashFlowChart.value, isDark.value ? 'dark' : 'light'); // 根据主题初始化
      myChart.setOption(newOption); // 设置配置
    }
  })
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 灵敏度分析可视化
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@
  const senChart = ref(null);
  let myChart2: any;
  let senChartXData: number[] = [];
  for (let i = 0; i <= 1; i += 0.1) {
    senChartXData.push(Number(i.toFixed(1)));
  }
  const chartOption2 = {
    backgroundColor: `${isDark.value ? '#101014' : 'white'}`,
    title: {
      text: '灵敏度分析',
      left: 'center'
    },
    grid: [
      {
        left: 60,
        right: 70,
        height: '35%'
      },
      {
        left: 60,
        right: 70,
        top: '55%',
        height: '35%'
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false
      }
    },
    legend: {
      data: ['净现值', '盈利指数'],
      left: 10
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
      }
    },
    axisPointer: {
      link: [
        {
          xAxisIndex: 'all'
        }
      ]
    },
    xAxis: [
      {
        type: 'category',
        name: '贴现率',
        boundaryGap: false,
        data: senChartXData,
        axisTick: {
          show: false // 不显示 x 轴刻度线
        },
      },
      {
        type: 'category',
        gridIndex: 1,
        boundaryGap: false,
        data: senChartXData,
        position: 'top',
        axisLabel: {
          show: false // 不显示 X 轴标签
        },
        axisTick: {
          show: false // 不显示 x 轴刻度线
        },
      }
    ],
    yAxis: [
      {
        name: '净现值',
        type: 'value',
        scale: true,
      },
      {
        gridIndex: 1,
        name: '盈利指标',
        type: 'value',
        inverse: true,
        scale: true
      }
    ],
    series: [
      {
        name: '净现值',
        type: 'line',
        symbolSize: 8,
        symbol: 'circle',
        data: senArr.value.result1
      },
      {
        name: '盈利指数',
        type: 'line',
        xAxisIndex: 1,
        yAxisIndex: 1,
        symbolSize: 8,
        symbol: 'diamond',
        data: senArr.value.result2
      }
    ]
  }
  onMounted(() => {
    myChart2 = isDark.value ? echarts.init(senChart.value, 'dark') : echarts.init(senChart.value);
    myChart2.setOption(chartOption2);
    const resizeOb = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // 通过 ECharts 提供的方法获取实例并调用 resize 方法
        // @ts-ignore
        echarts.getInstanceByDom(entry.target).resize();
      }
    });
    // @ts-ignore
    resizeOb.observe(senChart.value);
  })
  // 监听senArr的变化 
  watchEffect(() => {
    if (senChart.value) {
      myChart2.setOption({
        yAxis: [
          {
            scale: true
          },
          {
            scale: true
          }
        ],
        series: [
          {
            data: senArr.value.result1
          },
          {
            data: senArr.value.result2
          }
        ]
      })
    }
  })
  watch(isDark, (newVal, oldVal) => {
    if (newVal != oldVal) {
      let newOption = {
        backgroundColor: `${isDark.value ? '#101014' : 'white'}`,
        title: {
          text: '灵敏度分析',
          left: 'center'
        },
        grid: [
          {
            left: 60,
            right: 70,
            height: '35%'
          },
          {
            left: 60,
            right: 70,
            top: '55%',
            height: '35%'
          }
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false
          }
        },
        legend: {
          data: ['净现值', '盈利指数'],
          left: 10
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          }
        },
        axisPointer: {
          link: [
            {
              xAxisIndex: 'all'
            }
          ]
        },
        xAxis: [
          {
            type: 'category',
            name: '贴现率',
            boundaryGap: false,
            data: senChartXData,
            axisTick: {
              show: false // 不显示 x 轴刻度线
            },
          },
          {
            type: 'category',
            gridIndex: 1,
            boundaryGap: false,
            data: senChartXData,
            position: 'top',
            axisLabel: {
              show: false // 不显示 X 轴标签
            },
            axisTick: {
              show: false // 不显示 x 轴刻度线
            },
          }
        ],
        yAxis: [
          {
            name: '净现值',
            type: 'value',
            scale: true,
          },
          {
            gridIndex: 1,
            name: '盈利指标',
            type: 'value',
            inverse: true,
            scale: true
          }
        ],
        series: [
          {
            name: '净现值',
            type: 'line',
            symbolSize: 8,
            symbol: 'circle',
            data: senArr.value.result1
          },
          {
            name: '盈利指数',
            type: 'line',
            xAxisIndex: 1,
            yAxisIndex: 1,
            symbolSize: 8,
            symbol: 'diamond',
            data: senArr.value.result2
          }
        ]
      }
      myChart2.dispose(); // 销毁旧实例
      myChart2 = echarts.init(senChart.value, isDark.value ? 'dark' : 'light'); // 根据主题初始化
      myChart2.setOption(newOption); // 设置配置
    }
  })
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 处理跳转传参路由
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@
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
      interest.value = inputData.interest;
      interestMethod.value = inputData.interestMethod;
      rawData.value = inputData.rawData;
      npv.value = resultData.npv;
      irr.value = resultData.irr === null ? NaN : resultData.irr; // NaN会被解析成 null
      pi.value = resultData.pi === null ? NaN : resultData.pi; // NaN会被解析成 null
    }
  }
</script>

<style scoped>
  /* .light-theme {
    --btn-color: black;
  }

  .dark-theme {
    --btn-color: #d4d4d5;
  }

  .btn {
    color: var(--btn-color)
  } */
  .main {
    width: 95%;
    margin-left: auto;
    margin-right: auto;
  }
  .interest {
    margin-bottom: 20px;
    width: 50%;
  }

  .result {
    margin: 10px;
    font-size: medium;
    font-weight: 700;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  :deep(.time){
    font-weight: 800 !important;
  }

  .button-group {
    display: flex;
    flex-direction: row;
    width: 60%;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .judge-compound {
    height: max-content;
    margin-bottom: 15px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    width: max-content;
  }
  .info-message {
    margin-top: 10px;
  }

  th {
    text-align: center;
    font-weight: 600;
  }

  td {
    text-align: center;
    width: 33%;
  }

  .irr-warning {
    margin-top: 5px;
  }

  .data-table {
    flex: 55%;
  }

  #cashFlowChart {
    flex: 40%;
    height: 100%;
  }

  .data-and-chart {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 350px;
    align-items: center;
  }

  #senChart {
    width: 90%;
    height: 400px;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
  }

  /* .modal-content {
    border: 1px solid green;
  } */
  
</style>
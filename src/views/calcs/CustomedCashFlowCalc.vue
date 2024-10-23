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
    <div class="button-group">
      <n-button @click="addRow()" type="success" strong secondary> 添加行 </n-button>
      <n-button @click="deleteRow()" type="warning" strong secondary>删除最后一行</n-button>
      <n-button @click="deleteAll" type="error" strong secondary>全部清除</n-button>
      <n-button type="info" @click="onClickCalculate" strong secondary>计算</n-button>
    </div>
    <div class="data-and-chart">
      <n-data-table
        bordered
        :columns="columns"
        :data="rawData"
        size="small"
        :single-line="false"
        striped 
        :pagination="{ pageSize: 10 }"
        :max-height="250"
        :row-props="rowProps"
        class="data-table"
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
    <div ref="cashFlowChart" id="cashFlowChart" ></div>
    </div>
    <n-alert type="warning" class="irr-warning" v-if="isDisplayInfo && precision >= 5"> 高精度下内部收益率会不准确</n-alert>
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
    <div ref="senChart" id="senChart"></div>
  </div>
</template>

<script setup lang="ts">
  import { NInputNumber, NSpace, NSlider, NAlert, NButton, NIcon, NDataTable, NDatePicker, NDropdown, NTable } from 'naive-ui';
  import { useSettingStore } from "@/stores/settingStore";
  import { useCustomedCFInputStore } from "@/stores/input/CustomedCFInputStore";
  import { useCustomedCFResultStore } from "@/stores/result/CustomedCFResultStore";
  import { storeToRefs } from "pinia";
  import { ref, h, nextTick, onMounted, watchEffect, computed, watch, reactive } from "vue";
  import type { DataTableColumns, DropdownOption } from 'naive-ui'
  import type { CustomedCFData } from "@/types/CustomedCFData";
    // @ts-ignore
  import { AddSubtractCircle24Filled } from '@vicons/fluent';
  import { parseCurrency, formatCurrency } from "@/constants/InputNumber";
  import { UNKNOWN_OPTION, NO_DELETING, IRR_REQUIREMENT_ERROR, IRR_CONVERGENCE_ERROR, NO_MORE_CLICK } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import * as echarts from "echarts";
  import type { TooltipItem } from "@/types/TooltipItem";
  import { NPV } from "@/utils/customedNPV";
  // @ts-ignore
  import xirr from 'xirr';
  import { useHistoryStore } from "@/stores/historyStore"
  import type { HistoryData } from "@/types/HistoryData";
  import { useRoute } from "vue-router";
  import gsap from 'gsap';
  import { useThemeStore } from "@/stores/themeStore";
  import 'echarts/theme/dark'
  import { debounce, throttle } from 'lodash';

//节流状态变量
let isThrottling = false;
  // 主题颜色
  const { themeClass, isDark } = storeToRefs(useThemeStore());

  // @@@@@@@@@@@@@@@@@@@@@@@@@
  // @@@@设置信息、利率输入；表格相关数据和方法
  // @@@@@@@@@@@@@@@@@@@@@@@@@
  const { isDisplayInfo, currencySymbol, precision, isBarrierFree } = storeToRefs(useSettingStore());
  const {interest, rawData} = storeToRefs(useCustomedCFInputStore())
  // 创建表格的每一字段的内容（日期、现金流）
  const createColumns = (): DataTableColumns<CustomedCFData> => [
    {
      title: '日期',
      key: 'date',
      width: '50%',
      render(row, index) {
        return h(NDatePicker, {
          value: row.date, 
          size: 'small',
          onUpdateValue(v) {
            rawData.value[index].date = v || 0;
          }
        });
      }
    },
    {
      // 这个有取相反数的图标
      title: '现金流入/支出',
      key: 'cash',
      width: '50%',
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
  ];
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
  const rowProps = (row: CustomedCFData, index: number) => {
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
      date: Date.now(),
      cash: 1000
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

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@
  // @@@@@@@@结果相关的变量和方法
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@
  
  // 导入结果相关变量
  const customedCFResultStore = useCustomedCFResultStore();
  const { npv, irr, pi } = storeToRefs(customedCFResultStore)
  // 计算结果
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

  // 计算NPV
  const computeNPV = (interest: number) => {
    if (cashFlowData.value.length === 0) {
      return 0;
    }
    if (cashFlowData.value.length === 1) {
      return Number(cashFlowData.value[0].toFixed(precision.value));
    }
    let result = NPV(interest, rawData.value);
    return Number(result.toFixed(precision.value));
  }
  // 计算IRR
  const computeIRR = () => {
    if (!isValidToIRR()) {
      window.$message.error(IRR_REQUIREMENT_ERROR, MESSAGE_CONFIG)
      return NaN;
    }
    let inputData: any[] = [];
    rawData.value.forEach(data => {
      inputData.push({ amount: data.cash, when: data.date})
    })
    try {
      let result: number = xirr(inputData)
      return Number(result.toFixed(precision.value));
    } catch {
      window.$message.error(IRR_CONVERGENCE_ERROR, MESSAGE_CONFIG)  // 如果计算不收敛，弹窗提示
      return NaN;
    }
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

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 保存历史记录
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@
  const historyStore = useHistoryStore();
  // 添加历史记录
  const addHistory = () => {
    let history: HistoryData = {
      saveTime: Date.now(),
      name: 'customed-cashflow',
      inputData: {
        interest: interest.value,
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
      rawData.value = inputData.rawData;
      npv.value = resultData.npv;
      irr.value = resultData.irr === null ? NaN : resultData.irr; // NaN会被解析成 null
      pi.value = resultData.pi === null ? NaN : resultData.pi; // NaN会被解析成 null
    }
  }

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
  
 // 创建一个计算属性，用于转换日期格式
  const dates = computed(() => {
    return rawData.value.map(item => {
      const dateObj = new Date(item.date);
      return dateObj.toISOString().split('T')[0];
    });
  });
  
  // 创建另一个计算属性，用于提取现金流数据
  const cashFlowData = computed(() => {
    return rawData.value.map(item => item.cash);
  });
  // 画现金流量图
  const cashFlowChart = ref(null);
  let myChart: any;
  const chartOption1 = {
    aria:{
      enabled: true,
      decal:{
        show: isBarrierFree.value,
      }
    },
    backgroundColor: `${isDark.value ? '#101014' : 'white'}`,
    gird: {
        right: '10px',
    },
    yAxis: {
      type: 'category',
      data: dates.value,
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    xAxis: {
      type: 'value',
    },
    toolbox: {
      show: true,
      itemSize: 12,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        saveAsImage: {},
        restore: {}
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
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
          data: dates.value, 
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
            },
          },
          {
            data: cashFlowData.value.map(value => value > 0 ? value : 0),
            label: {
              show: true,
              formatter: (params: any) => params.value > 0 && cashFlowData.value.length <= 15 ? params.name : ''
            },
          }
        ],
      });
    }
  });
  watch(isDark, (newVal, oldVal) => {
    if (newVal != oldVal) {
      let newOption = {
        aria:{
          enabled: true,
          decal:{
            show: isBarrierFree.value,
          }
        },
        backgroundColor: `${isDark.value ? '#101014' : 'white'}`,
        gird: {
            right: '10px',
        },
        yAxis: {
          type: 'category',
          data: dates.value,
          axisLine: { show: false },
          axisLabel: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
        xAxis: {
          type: 'value',
        },
        toolbox: {
          show: true,
          itemSize: 12,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            saveAsImage: {},
            restore: {}
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
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
        axisLine: { onZero: true },
        data: senChartXData,
        axisTick: {
          show: false // 不显示 x 轴刻度线
        },
      },
      {
        type: 'category',
        gridIndex: 1,
        boundaryGap: false,
        axisLine: { onZero: true },
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
        scale: true
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
            axisLine: { onZero: true },
            data: senChartXData,
            axisTick: {
              show: false // 不显示 x 轴刻度线
            },
          },
          {
            type: 'category',
            gridIndex: 1,
            boundaryGap: false,
            axisLine: { onZero: true },
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
            scale: true
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
</script>

<style scoped>
  .main {
    width: 95%;
    margin-left: auto;
    margin-right: auto;
  }
  .interest {
    margin-bottom: 20px;
    width: 50%;
  }
  .button-group {
    display: flex;
    flex-direction: row;
    width: 60%;
    justify-content: space-between;
    margin-bottom: 10px;
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

  #cashFlowChart {
    margin-left: 20px;
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

  .data-table {
    flex: 50%;
  }

  #senChart {
    width: 90%;
    height: 400px;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
  }
</style>

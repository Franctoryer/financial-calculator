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
      <n-button @click="addRow()" color="#6e9bc5"> 添加行 </n-button>
      <n-button @click="deleteRow()" color="#c67915">删除最后一行</n-button>
      <n-button @click="deleteAll" color="#ba5b49">全部清除</n-button>
      <n-button color="#3271ae" @click="computeResult">计算</n-button>
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
          <td>{{ npv }} {{ currencySymbol }}</td>
          <td>{{ irr }}</td>
          <td>{{ pi }}</td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>

<script setup lang="ts">
  import { NInputNumber, NSpace, NSlider, NSwitch, NAlert, NButton, NIcon, NDataTable, NDatePicker, NDropdown, NTable } from 'naive-ui';
  import { useSettingStore } from "@/stores/settingStore";
  import { useCustomedCFInputStore } from "@/stores/input/CustomedCFInputStore";
  import { useCustomedCFResultStore } from "@/stores/result/CustomedCFResultStore";
  import { storeToRefs } from "pinia";
  import { ref, h, nextTick, onMounted, watchEffect, computed } from "vue";
  import type { DataTableColumns, DropdownOption } from 'naive-ui'
  import type { CustomedCFData } from "@/types/CustomedCFData";
  import { AddSubtractCircle24Filled } from '@vicons/fluent';
  import { parseCurrency, formatCurrency } from "@/constants/InputNumber";
  import { UNKNOWN_OPTION, NO_DELETING, IRR_REQUIREMENT_ERROR, IRR_CONVERGENCE_ERROR } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import * as echarts from "echarts";
  import type { TooltipItem } from "@/types/TooltipItem";
  import { NPV } from "@/utils/customedNPV";
  // @ts-ignore
  import xirr from 'xirr';

  // @@@@@@@@@@@@@@@@@@@@@@@@@
  // @@@@设置信息、利率输入；表格相关数据和方法
  // @@@@@@@@@@@@@@@@@@@@@@@@@
  const { isDisplayInfo, currencySymbol, precision } = storeToRefs(useSettingStore());
  const {interest, rawData} = storeToRefs(useCustomedCFInputStore())
  // 创建表格的每一字段的内容（日期、现金流）
  const createColumns = (): DataTableColumns<CustomedCFData> => [
    {
      title: '日期',
      key: 'date',
      width: '40%',
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
      width: '60%',
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
            style: 'width: 60%',
            onUpdateValue(v) {
              rawData.value[index].cash = v || 0;
            }
          }),
          h('span', { style: 'padding-left: 4px'}, `${currencySymbol.value}`),
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
    npv.value = computeNPV();
    irr.value = computeIRR();
    pi.value = computePI();
  }
  // 计算NPV
  const computeNPV = () => {
    if (cashFlowData.value.length === 0) {
      return 0;
    }
    if (cashFlowData.value.length === 1) {
      return Number(cashFlowData.value[0].toFixed(precision.value));
    }
    let result = NPV(interest.value, rawData.value);
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
    let result = npv.value / (-cashFlowData.value[0]);
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
  onMounted(() => {
    myChart = echarts.init(cashFlowChart.value);
    const chartOption = {
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
          data: cashFlowData.value,
          type: 'bar',
          itemStyle: {
            color: (params: any) => {
              return params.value < 0 ? '#ba5140' : '#4f6f46';
            }
          },
          label: {
            show: cashFlowData.value.length <= 15,
            formatter: '{b}'
          },
        },
        {
          name: '流入',
          data: cashFlowData.value,
          type: 'bar',
          itemStyle: {
            color: (params: any) => {
              return params.value < 0 ? '#ba5140' : '#4f6f46';
            }
          },
          barGap: '-100%', // 设置柱形图重叠
          xAxisIndex: 0 // 确保两个系列使用同一个x轴
        },
      ]
    };
    myChart.setOption(chartOption, true);
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
        yAxis: {
          data: dates.value, 
        },
        xAxis: {
          type: 'value',
        },
        series: [
          {
            data: cashFlowData.value,
            label: {
              show: cashFlowData.value.length <= 15,
              formatter: '{b}'
            },
          },
          {
            data: []
          }
        ],
      });
    }
  });
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
</style>

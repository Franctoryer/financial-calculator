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
    <div class="judge-compound" v-if="isCompound">
      <n-switch :round="false" v-model:value="isContinueCompound">
        <template #checked>
          采用连续复利
        </template>
        <template #unchecked>
          默认分期复利
        </template>
      </n-switch>
      <n-alert type="info" class="info-message" v-if="isDisplayInfo && isContinueCompound">
        当前为 <b style="color: rgb(191, 15, 15)">连续复利</b> 模式，净现值一般采用 <b>分期复利</b> 计算，请注意甄别
      </n-alert>
    </div>
    <n-alert type="info" class="judge-compound" v-if="isDisplayInfo && !isCompound">
      当前为 <b style="color: rgb(191, 15, 15)">单利</b> 模式，净现值一般采用 <b>分期复利</b> 计算，请注意甄别
    </n-alert>
    <div class="button-group">
      <n-button @click="addRow()" color="#6e9bc5"> 添加行 </n-button>
      <n-button @click="deleteRow()" color="#c67915">删除最后一行</n-button>
      <n-button @click="deleteAll" color="#ba5b49">全部清除</n-button>
      <n-button color="#3271ae" @click="">计算</n-button>
    </div>
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
    <n-alert type="warning" class="irr-warning" v-if="isDisplayInfo && precision >= 5"> 高精度下内部收益率会不准确</n-alert>
    <hr>
    <n-table>
      <thead>
        <tr>
          <th>净现值</th>
          <th>内部收益率</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>0 {{ currencySymbol }}</td>
          <td>0</td>
        </tr>
      </tbody>
    </n-table>
    <div ref="cashFlowChart" id="cashFlowChart" style="width: 100%; height: 400px;"></div>
  </div>
</template>

<script setup lang="ts">
  import { NInputNumber, NSpace, NSlider, NSwitch, NAlert, NButton, NIcon, NDataTable, NDatePicker, NDropdown, NTable } from 'naive-ui';
  import { useSettingStore } from "@/stores/settingStore";
  import { useCustomedCFInputStore } from "@/stores/input/CustomedCFInputStore";
  import { storeToRefs } from "pinia";
  import { ref, h, nextTick, onMounted, watchEffect, computed } from "vue";
  import type { DataTableColumns, DropdownOption } from 'naive-ui'
  import type { CustomedCFData } from "@/types/CustomedCFData";
  import { AddSubtractCircle24Filled } from '@vicons/fluent';
  import { parseCurrency, formatCurrency } from "@/constants/InputNumber";
  import { UNKNOWN_OPTION, NO_DELETING } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import * as echarts from "echarts";

  // @@@@@@@@@@@@@@@@@@@@@@@@@
  // @@@@设置信息、是否连续复利、利率输入；表格相关数据和方法
  // @@@@@@@@@@@@@@@@@@@@@@@@@
  const { isCompound, isDisplayInfo, currencySymbol, precision } = storeToRefs(useSettingStore());
  const {interest, isContinueCompound, rawData} = storeToRefs(useCustomedCFInputStore())
  // 创建表格的每一字段的内容（日期、现金流）
  const createColumns = (): DataTableColumns<CustomedCFData> => [
    {
      title: '日期',
      key: 'date',
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
      title: {
        text: '现金流量图'
      },
      xAxis: {
        type: 'category',
        data: dates.value,
        name: '时间'
      },
      yAxis: {
        type: 'value',
        name: `金额（${currencySymbol.value}）`
      },
      toolbox: {
        show: true,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          magicType: { 
            type: ['line', 'bar'],
            option: {
              line: {
                smooth: true,
                symbol: 'none',
              }
            }
          },
          saveAsImage: {},
          
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        show: true,
        top: '5%',
        left: 'center',
        itemWidth: 20,
        itemHeight: 20,
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
          }
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
        xAxis: {
          data: dates.value,
        },
        yAxis: {
          type: 'value',
          name: `金额（${currencySymbol.value}）`
        },
        series: [
          {
            data: cashFlowData.value,
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
    width: 90%;
    margin-left: auto;
    margin-right: auto;
  }
  .interest {
    margin-bottom: 20px;
    width: 50%;
  }

  .judge-compound {
    display: flex;
    flex-direction: column;
    justify-self: left;
    align-items: flex-start;
    justify-content: space-evenly;
    height: max-content;
    margin-top: 10px;
    margin-bottom: 10px;
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
    width: 50%;
  }
  .irr-warning {
    margin-top: 5px;
  }

  #cashFlowChart {
    margin-top: 20px;
  }
</style>

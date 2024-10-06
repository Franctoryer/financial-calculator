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
    </div>
    <n-data-table 
      bordered
      :columns="columns" 
      :data="displayData" 
      striped 
      :pagination="{ pageSize: 10 }"
      :max-height="250"
      size="small"
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
    <!-- <pre>{{ JSON.stringify(rawData, null, 2) }}</pre> -->
    <hr>
    <div class="result" style="color: #ba5140">
    净现值：{{ npv }}
    </div>
    <hr>
    <div ref="cashFlowChart" id="cashFlowChart" style="width: 100%; height: 400px;"></div>
  </div>
</template>

<script setup lang="ts">
  import { NDataTable, NInputNumber, NButton, NSpace, NSlider, NDropdown, NSwitch, NAlert, NIcon, NBackTop } from 'naive-ui';
  import { ref, h, computed, nextTick } from 'vue';
  import { parseCurrency, formatCurrency } from "@/constants/InputNumber";
  import type { DataTableColumns, DropdownOption } from 'naive-ui'
  import type { Ref, ComputedRef } from 'vue';
  import type { CCFRowDataRaw, CCFRowData } from '@/types/CCFData';
  import { useSettingStore } from "@/stores/settingStore";
  import { storeToRefs } from "pinia";
  import { NPV, continuousCompoundingNPV, simpleInterestNPV } from "@/utils/NPV";
  import { IRR } from "@/utils/IRR";
  import { UNKNOWN_OPTION, NO_DELETING } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import * as echarts from "echarts";
  import { onMounted } from 'vue';
  import { watchEffect } from 'vue';
  import { AddSubtractCircle24Filled } from '@vicons/fluent';

  const { timeUnitText, precision, isCompound, isDisplayInfo } = storeToRefs(useSettingStore());

  const isContinueCompound = ref(false);
  const interest = ref(0.2);
  // 原始数据，和表格输入绑定的数据
  const rawData: Ref<CCFRowDataRaw[]> = ref([
    {
      order: 1,
      cash: 1000,
      freq: 1
    }
  ])
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
        result.push({order: `第${oldSumTime} ~ ${sumTime - 1}${timeUnitText.value}`, cash: item.cash, freq: item.freq})
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
        align: 'center'
      },
      {
        // 这个没有图标
        // title: '现金流入/支出',
        // key: 'cash',
        // render(row, index) {
        //   return h(NInputNumber, {
        //     value: row.cash,
        //     format: formatCurrency,
        //     parse: parseCurrency,
        //     step: 100,
        //     size: 'small',
        //     onUpdateValue(v) {
        //       rawData.value[index].cash = v || 0
        //     }
        //   })
        // }
        // 这个有取相反数的图标
        title: '现金流入/支出',
        key: 'cash',
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

  const deleteAll = () => {
    if (rawData.value.length === 0) {
      window.$message.warning(NO_DELETING, MESSAGE_CONFIG)
      return;
    }
    rawData.value = [];
  }
  // 计算净现值
  const npv = computed(() => {
    if (cashFlowData.value.length === 0) {
      return 0;
    } else if (cashFlowData.value.length === 1) {
      return cashFlowData.value[0];
    } else {
      let result;
      if (!isCompound.value) {
        result = simpleInterestNPV(interest.value, cashFlowData.value).toFixed(precision.value);
      } else {
        result = isContinueCompound.value ? continuousCompoundingNPV(interest.value, cashFlowData.value).toFixed(precision.value) : NPV(interest.value, cashFlowData.value).toFixed(precision.value); 
      }
      return result; 
    }
  });

  // 画现金流量图
  const cashFlowChart = ref(null);
  onMounted(() => {
    const myChart = echarts.init(cashFlowChart.value);
    const chartOption = {
      title: {
        text: '现金流量图'
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: cashFlowData.value.length }, (v, k) => `第${k}${timeUnitText.value}`),
        name: '时间'
      },
      yAxis: {
        type: 'value',
        name: '金额（￥）'
      },
      toolbox: {
        show: true,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          magicType: { type: ['line', 'bar'] },
          saveAsImage: {}
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
  myChart.setOption(chartOption, true)
  })
  // 监听 cashFlowData 的变化
  watchEffect(() => {
    // 更新 ECharts 图表
    if (cashFlowChart.value) {
      const myChart = echarts.init(cashFlowChart.value);
      myChart.setOption({
        xAxis: {
          data: Array.from({ length: cashFlowData.value.length }, (v, k) => `第${k}${timeUnitText.value}`),
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
    width: 50%;
    justify-content: space-between;
    margin-bottom: 10px;
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
  .info-message {
    margin-top: 10px;
  }
</style>
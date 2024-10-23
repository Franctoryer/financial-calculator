<template>
  <div class="main">
      <div class="head">
        <div class="head-option">
          计算目标：
          <div class="radio-and-icon">
            <n-radio-group v-model:value="objective">
            <n-radio-button value="PV">
              PV
            </n-radio-button>
            <n-radio-button value="FV">
              FV
            </n-radio-button>
            <n-radio-button value="PMT">
              PMT
            </n-radio-button>
            <n-radio-button value="I/Y">
              I/Y
            </n-radio-button>
            <n-radio-button value="N">
              N
            </n-radio-button>
          </n-radio-group>
          <n-icon 
            :component="BookSearch24Regular" 
            :size="20" 
            :depth="3"
            v-if="isQkDocLkup"
            class="doc-icon"
            @click="isFourToOne = !isFourToOne"
          >
          </n-icon>
          </div>
          <n-modal 
            :show="isFourToOne"
            size="huge"
            style="width: 80%;"
            preset="card"
            @update:show="handleModalShowChange"
          >
            <n-scrollbar style="max-height: 60vh" trigger="none">
              <FourToOneManual class="modal-content"/>
            </n-scrollbar>
          </n-modal>
        </div>
      
        <div class="btns">
          <n-button @click="deleteAll" type="error" strong secondary>全部清除</n-button>
          <n-button @click="onClickCalculate()" type="info" strong secondary>计算</n-button>
        </div>
      </div>
    <div :class="`options ${themeClass}`">
      <div class="row">
        <div class="option">
          现值（PV）：
          <n-input-number 
            :disabled="objective == 'PV'" 
            :placeholder="objective == 'PV' ? '计算目标' : '请输入'"
            v-model:value="PV"
            :show-button="false"
          >
          <template #suffix>
            {{ currencySymbol }}
          </template>
        </n-input-number>
        </div>
        <div class="option">
          终值（FV）：
          <n-input-number 
            :disabled="objective == 'FV'" 
            :placeholder="objective == 'FV' ? '计算目标' : '请输入'"
            v-model:value="FV"
            :show-button="false"
          >
          <template #suffix>
            {{ currencySymbol }}
          </template>
        </n-input-number>
        </div>
        <div class="option">
          每期付款/收益（PMT）：
          <n-input-number 
            :disabled="objective == 'PMT'" 
            :placeholder="objective == 'PMT' ? '计算目标' : '请输入'"
            v-model:value="PMT"
            :show-button="false"
          >
          <template #suffix>
            {{ currencySymbol }}
          </template>
        </n-input-number>
        </div>
      </div>
      <div class="row">
        <div class="option">
          贴现率（I/Y）：
          <n-input-number 
            :disabled="objective == 'I/Y'" 
            :placeholder="objective == 'I/Y' ? '计算目标' : '请输入'"
            v-model:value="I_Y"
          >
          <template #suffix>
            %
          </template>
        </n-input-number>
        </div>
        <div class="option">
          期数（N）：
          <n-input-number 
            :disabled="objective == 'N'" 
            :placeholder="objective == 'N' ? '计算目标' : '请输入'"
            v-model:value="N"
          >
          <template #suffix>
            {{ timeUnitText }}
          </template>
        </n-input-number>
        </div>
      </div> 
    </div>
    <n-table class="result-table">
      <thead>
        <tr>
          <th class="result-column">{{ objectiveText }}</th>
          <th>总利息</th>
          <th>所有定期付款/收益的总和</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="result-column">{{ Number(objectiveResultView.number).toFixed(precision) }} {{ resultSymbol }}</td>
          <td> {{ Number(allInterestView.number).toFixed(precision) }} {{ currencySymbol }} </td>
          <td> {{ Number(allPmtView.number).toFixed(precision) }} {{ currencySymbol }} </td>
        </tr>
      </tbody>
    </n-table>
    <n-divider/>
    <div class="sensitive-options">
      <div class="sensitive-option">
        敏感因子：
        <n-radio-group v-model:value="senseitiveFactor">
          <n-radio-button value="PV" :disabled="objective === 'PV'">
            PV
          </n-radio-button>
          <n-radio-button value="FV" :disabled="objective === 'FV'">
            FV
          </n-radio-button>
          <n-radio-button value="PMT" :disabled="objective === 'PMT'">
            PMT
          </n-radio-button>
          <n-radio-button value="I/Y" :disabled="objective === 'I/Y'">
            I/Y
          </n-radio-button>
          <n-radio-button value="N" :disabled="objective === 'N'">
            N
          </n-radio-button>
        </n-radio-group>
      </div>
      <div class="sensitive-option">
        阈值：
        <div class="max-and-min">
          <n-input-number
          v-model:value="sensitiveMin"
          placeholder="最小值"
          >
          <template #prefix>
            <span style="font-weight: bold;">MIN</span>
          </template>
          <template #suffix v-if="senseitiveFactor === 'PV' || senseitiveFactor === 'FV' || senseitiveFactor === 'PMT'">
            {{ currencySymbol }}
          </template>

          <template #suffix v-if="senseitiveFactor === 'I/Y'">
            %
          </template>
          <template #suffix v-if="senseitiveFactor === 'N'">
            {{ timeUnitText }}
          </template>
          </n-input-number>
        <n-input-number
          v-model:value="sensitiveMax"
          placeholder="最大值"
        >
          <template #prefix>
            <span style="font-weight: bold;">MAX</span>
          </template>
          <template #suffix v-if="senseitiveFactor === 'PV' || senseitiveFactor === 'FV' || senseitiveFactor === 'PMT'">
            {{ currencySymbol }}
          </template>

          <template #suffix v-if="senseitiveFactor === 'I/Y'">
            %
          </template>
          <template #suffix v-if="senseitiveFactor === 'N'">
            {{ timeUnitText }}
          </template>
        </n-input-number>
      </div> 
     </div>
    </div>
    <div ref="senChart" id="senChart"></div>
  </div>
</template>

<script setup lang="ts">
  import { NRadioGroup, NRadioButton, NInputNumber, NButton, NTable, NDivider, NIcon, NModal, NScrollbar } from "naive-ui";
  import { onMounted, watch, computed, ref, watchEffect, nextTick } from "vue";
  import { storeToRefs } from "pinia";
  import { useSettingStore } from "@/stores/settingStore";
  import { useInvestInputStore } from "@/stores/input/InvestInputStore"
  import { useInvestResultStore } from "@/stores/result/InvestResultStore"
  import { calculatePV, calculateFV, calculatePMT, calculateN, calculateIY } from "@/utils/TVM";
  import { UNKNOWN_OPTION, NO_DELETING, IRR_REQUIREMENT_ERROR, NO_MORE_CLICK } from "@/constants/message";
  import { MESSAGE_CONFIG } from "@/constants/messageConfig";
  import type { HistoryData } from "@/types/HistoryData";
  import { useHistoryStore } from "@/stores/historyStore";
  import { useRoute } from "vue-router";
  import * as echarts from "echarts";
  import { getTVMObjective } from "@/utils/getTVMObjective";
  import { useThemeStore } from "@/stores/themeStore";
  import 'echarts/theme/dark'
  import { reactive } from "vue";
  import gsap from "gsap";
  // @ts-ignore
  import { BookSearch24Regular } from '@vicons/fluent';
  import FourToOneManual from "@/views/manuals/FourToOneManual.vue"
  import { debounce, throttle } from 'lodash';

//节流状态变量
let isThrottling = false;
  // 主题颜色
  const { themeClass, isDark } = storeToRefs(useThemeStore());

  // 获取全局设置信息
  const { timeUnitText, precision, currencySymbol, timeMode, isQkDocLkup } = storeToRefs(useSettingStore());
  // 输入数据
  const { objective, PV, FV, PMT, I_Y, N, objectiveText } = storeToRefs(useInvestInputStore());
  // 结果数据
  const { objectiveResult, allInterest, allPmt } = storeToRefs(useInvestResultStore());
  const resultSymbol = computed(() => {
    switch (objective.value) {
      case 'PV':
        return currencySymbol.value;
      case 'FV':
        return currencySymbol.value;
      case 'PMT':
        return currencySymbol.value;
      case 'I/Y':
        return "%";
      case 'N':
        return timeUnitText.value;
      default:
        return "";
    }
  });
  const isDue = computed(() => timeMode.value === 'BGN')
  // 计算方法
  const calculate = () => {
    
    objectiveResult.value = calculateResult(PV.value, FV.value, PMT.value, N.value, I_Y.value);
    calculateAllPmt();
    calculateAllInterest();
    addHistory();
  }
        //节流处理 
const throttledCalculate = throttle(() => {
calculate();
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
  // 计算结果
  const calculateResult = (PV: number | null, FV: number | null, PMT: number | null, N: number | null, I_Y: number | null): number => {
    if (FV === null && objective.value !== "FV") {
      // window.$message.error("请输入终值（FV）", MESSAGE_CONFIG)
      return NaN;
    }
    if (PV === null && objective.value !== "PV") {
      // window.$message.error("请输入现值（PV）", MESSAGE_CONFIG)
      return NaN;
    }
    if (N === null && objective.value !== "N") {
      // window.$message.error("请输入期数（N）", MESSAGE_CONFIG)
      return NaN;
    }
    if (PMT === null && objective.value !== "PMT") {
      // window.$message.error("请输入每期付款/投资（PMT）", MESSAGE_CONFIG)
      return NaN;
    }
    if (I_Y === null && objective.value !== "I/Y") {
      // window.$message.error("请输入贴现率（I/Y）", MESSAGE_CONFIG)
      return NaN;
    }
    switch (objective.value) {
      case 'PV':
        // @ts-ignore
        return calculatePV(FV, PMT, I_Y, N, isDue.value);
      case 'FV':
        // @ts-ignore
        return calculateFV(PV, PMT, I_Y, N, isDue.value);
      case 'PMT':
        // @ts-ignore
        return calculatePMT(PV, FV, I_Y, N, isDue.value);
      case 'I/Y':
        // @ts-ignore
        return calculateIY(PV, FV, PMT, N, isDue.value);
      case 'N':
        // @ts-ignore
        return calculateN(PV, FV, PMT, I_Y, isDue.value);
    }

    return NaN;
  };
  // 计算所有定期支付总和
  const calculateAllPmt = () => {
    if (objective.value === "PMT") {
      // @ts-ignore
      allPmt.value = N.value * objectiveResult.value;
    } else if (objective.value === "N") {
      // @ts-ignore
      allPmt.value = PMT.value * objectiveResult.value
    } else {
      // @ts-ignore
      allPmt.value = PMT.value * N.value;
    }
  }
  // 计算所有利息
  const calculateAllInterest = () => {
    let pv: any = PV.value;
    let fv: any = FV.value;
    let pmt: any = PMT.value;
    let n: any = N.value;
    switch (objective.value) {
      case "PV":
        pv = objectiveResult.value;
        break;
      case "FV":
        fv = objectiveResult.value;
        break;
      case "PMT":
        pmt = objectiveResult.value;
        break;
      case "N":
        n = objectiveResult.value;
        break;
    }

    allInterest.value = -(pv + fv + pmt * n);
  }
  // 每次更改计算目标，结果归零
  let isRouteHanding = false;
  watch(objective, (newVal) => {
    if (!isRouteHanding) {
      objectiveResult.value = 0;
      allInterest.value = 0;
      allPmt.value = 0;
      senseitiveFactor.value = null;
      switch (newVal) { 
        case "PV":
          PV.value = null;
          break;
        case "FV":
          FV.value = null;
          break;
        case "PMT":
          PMT.value = null;
          break;
        case "I/Y":
          I_Y.value = null;
          break;
        case "N":
          N.value = null;
          break;
      }
    }
  })
  // 删除按钮 
  const deleteAll = () => {
    PV.value = null;
    FV.value = null;
    PMT.value = null;
    I_Y.value = null;
    N.value = null;
  }
  // 添加历史记录
  const historyStore = useHistoryStore();
  const addHistory = () => {
    let history: HistoryData = {
      saveTime: Date.now(),
      name: 'invest',
      inputData: {
        objective: objective.value,
        FV: FV.value,
        PV: PV.value,
        PMT: PMT.value,
        I_Y: I_Y.value,
        N: N.value,
      },
      resultData: {
        objectiveResult: objectiveResult.value.toFixed(precision.value),
        allInterest: allInterest.value.toFixed(precision.value),
        allPmt: allPmt.value.toFixed(precision.value),
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
  const handleHistoryRoute = async () => {
    if (route.query.inputData && route.query.resultData) {
      isRouteHanding = true;
      let inputData = JSON.parse(route.query.inputData as string)
      let resultData = JSON.parse(route.query.resultData as string)
      objective.value = inputData.objective;
      PV.value = inputData.PV;
      FV.value = inputData.FV;
      PMT.value = inputData.PMT;
      I_Y.value = inputData.I_Y;
      N.value = inputData.N;
      objectiveResult.value = resultData.objectiveResult;
      allInterest.value = resultData.allInterest;
      allPmt.value = resultData.allPmt;
      await nextTick();
      isRouteHanding = false;
    }
  }


  // @@@@@@@@@@@@@@@@@@@@@@@
  // 敏感性分析
  // @@@@@@@@@@@@@@@@@@@@@@@
  const senseitiveFactor = ref<string | null>(null)
  const sensitiveMin = ref(0);
  const sensitiveMax = ref(0);
  // 生成横坐标数据
  const SenX = computed(() => {
    if (sensitiveMin.value >= sensitiveMax.value) {
      return [NaN];
    } else {
      let result = [];
      let step = (sensitiveMax.value - sensitiveMin.value) / 20;  // 10个采样点
      for (let i = 0; i <= 20; i++) {
        result.push(Number((sensitiveMin.value + step * i).toFixed(2)));
      }
      return result;
    }
  })
  // 生成纵坐标数据
  const SenY = computed(() => {
    // 如果还没有选择敏感因子，直接返回
    if (senseitiveFactor.value === null) {
      return;
    }
    let pv = PV.value;
    let fv = FV.value;
    let pmt = PMT.value;
    let n = N.value;
    let iy = I_Y.value;
    let paramsMap = {
      "PV": pv,
      "FV": fv,
      "PMT": pmt,
      "N": n,
      "I/Y": iy
    }
    let result1: number[] = [];
    let result2: number[] = [];
    SenX.value.forEach(x => {
      // @ts-ignore
      paramsMap[senseitiveFactor.value] = x;
      // @ts-ignore
      paramsMap[objective.value] = calculateResult(paramsMap["PV"], paramsMap["FV"], paramsMap["PMT"], paramsMap["N"], paramsMap["I/Y"]);
      // @ts-ignore
      let temp = -(paramsMap["FV"] + paramsMap["PV"] + paramsMap["PMT"] * paramsMap["N"])
      // @ts-ignore
      result1.push(Number(paramsMap[objective.value].toFixed(precision.value)));
      result2.push(Number(temp.toFixed(precision.value)))
    })

    return { result1, result2 };
  })
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@
  // 灵敏度分析可视化
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@
  const senChart = ref(null);
  let myChart: any;
  let chartOption = {
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
        data: [`${senseitiveFactor.value}`, '总利息'],
        left: 10
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
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
          name: `${senseitiveFactor.value}`,
          boundaryGap: false,
          data: SenX.value,
          axisTick: {
            show: false // 不显示 x 轴刻度线
          },
        },
        {
          type: 'category',
          gridIndex: 1,
          boundaryGap: false,
          data: SenX.value,
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
          name: `${senseitiveFactor.value}`,
          type: 'value',
          scale: true,
        },
        {
          gridIndex: 1,
          name: '总利息',
          type: 'value',
          inverse: true,
          scale: true
        }
      ],
      series: [
        {
          name: `${objective.value}`,
          type: 'line',
          symbolSize: 8,
          symbol: 'circle',
          data: SenY.value?.result1
        },
        {
          name: '总利息',
          type: 'line',
          xAxisIndex: 1,
          yAxisIndex: 1,
          symbolSize: 8,
          symbol: 'diamond',
          data: SenY.value?.result2
        }
      ]
  }
  onMounted(() => {
    myChart = isDark.value ? echarts.init(senChart.value, 'dark') : echarts.init(senChart.value);
    myChart.setOption(chartOption);
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
  watchEffect(() => {
    if (senChart.value) {
      myChart.setOption({
        xAxis: [
          {
            type: 'category',
            name: `${senseitiveFactor.value}`,
            boundaryGap: false,
            data: SenX.value,
          },
          {
            type: 'category',
            gridIndex: 1,
            data: SenX.value,
          }
        ],
        yAxis: [
          {
            name: `${objective.value}`,
            type: 'value',
            scale: true,
          },
          {
            gridIndex: 1,
            name: '总利息',
            type: 'value',
            inverse: true,
            scale: true
          }
        ],
        legend: {
          data: [`${objective.value}`, '总利息'],
          left: 10
        },
        series: [
          {
            name: `${objective.value}`,
            data: SenY.value?.result1
          },
          {
            data: SenY.value?.result2
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
            data: [`${senseitiveFactor.value}`, '总利息'],
            left: 10
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
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
              name: `${senseitiveFactor.value}`,
              boundaryGap: false,
              data: SenX.value,
              axisTick: {
                show: false // 不显示 x 轴刻度线
              },
            },
            {
              type: 'category',
              gridIndex: 1,
              boundaryGap: false,
              data: SenX.value,
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
              name: `${senseitiveFactor.value}`,
              type: 'value',
              scale: true,
            },
            {
              gridIndex: 1,
              name: '总利息',
              type: 'value',
              inverse: true,
              scale: true
            }
          ],
          series: [
            {
              name: `${objective.value}`,
              type: 'line',
              symbolSize: 8,
              symbol: 'circle',
              data: SenY.value?.result1
            },
            {
              name: '总利息',
              type: 'line',
              xAxisIndex: 1,
              yAxisIndex: 1,
              symbolSize: 8,
              symbol: 'diamond',
              data: SenY.value?.result2
            }
          ]
      }
      myChart.dispose(); // 销毁旧实例
      myChart = echarts.init(senChart.value, isDark.value ? 'dark' : 'light'); // 根据主题初始化
      myChart.setOption(newOption); // 设置配置
    }
  })

  // @@@@@@@@@@@@@@@@@@
  // 数字递增特效
  // @@@@@@@@@@@@@@@@@@@
  const objectiveResultView = reactive({
    number: objectiveResult.value
  })
  const allPmtView = reactive({
    number: allPmt.value
  })
  const allInterestView = reactive({
    number: allInterest.value
  });

  watch(objectiveResult, (n) => {
    gsap.to(objectiveResultView, { 
      duration: 0.5, 
      number: Number(n),
      onUpdate: () => {
        // 在动画过程中格式化数字
        objectiveResultView.number = Number(objectiveResultView.number.toFixed(precision.value));
      }
    });
  });
  watch(allPmt, (n) => {
    gsap.to(allPmtView, { 
      duration: 0.5, 
      number: Number(n),
      onUpdate: () => {
        // 在动画过程中格式化数字
        allPmtView.number = Number(allPmtView.number.toFixed(precision.value));
      }
    });
  });
  watch(allInterest, (n) => {
    gsap.to(allInterestView, { 
      duration: 0.5, 
      number: Number(n),
      onUpdate: () => {
        // 在动画过程中格式化数字
        allInterestView.number = Number(allInterestView.number.toFixed(precision.value));
      }
    });
  });

  // @@@@@@@@@@@@@@@@@@@@@@@@
  // 文档速查
  // @@@@@@@@@@@@@@@@@@@@@@@@
  let isFourToOne = ref(false);
  const handleModalShowChange = (value: any) => {
    isFourToOne.value = value;
  };
</script>

<style scoped>
.light-theme {
  --options-border: 2px solid rgb(225, 225, 225);
}

.dark-theme {
  --options-border: 2px solid #275747;
}

.main {
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  border: var(--options-border);
  padding: 15px;
  border-radius: 1cap;
}
.option {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 5px;
  width: 100%;
}

.head-option {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 5px;
  font-weight: bold;
}
.row {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.head {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: flex-end;
}

.btns {
  display: flex;
  flex-direction: row;
  gap:20px;
}

.result-table {
  width: 100%;
  margin-top: 30px;
}

td {
  text-align: center;
  width: 33.33%;
}

th {
  text-align: center;
}

.result-column {
  font-weight: bold;
}

.max-and-min {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.sensitive-options {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
}

.sensitive-option {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 5px;
}

#senChart {
  width: 100%;
  height: 400px;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
}

.radio-and-icon {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.doc-icon {
  cursor: pointer;
}
</style>

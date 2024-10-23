<template>
  <div class="calculator">
    <div :class="`display ${themeClass}`">
      <div ref="katexContainer" class="formula-display"></div>
      <!-- 显示计算结果 -->
      <div class="result-display" v-if="isFranctional"> = {{ convertToFraction(result) }}</div>
      <div class="result-display" v-else> = {{ displayResult }}</div>
    </div>
    <div class="setting">
      <n-switch :round="false" v-model:value="isAngle" :rail-style="railStyle">
        <template #checked>
          角度制
        </template>
        <template #unchecked>
          弧度制
        </template>
      </n-switch>
      <n-switch :round="false" v-model:value="isFranctional" :rail-style="railStyle" v-if="canBeFractional">
        <template #checked>
          分数展示
        </template>
        <template #unchecked>
          小数展示
        </template>
      </n-switch>
      <n-switch :round="false" v-model:value="isKey" :rail-style="railStyle">
        <template #checked>
          键盘输入
        </template>
        <template #unchecked>
          鼠标输入
        </template>
      </n-switch>
    </div>
    <div class="buttons">
      <MathButton formula="x^2" @click="append('^2')" type="tertiary" hot-key="^2" id="^2"/>
      <MathButton formula="x^{\square}" @click="append('^(')" type="tertiary" hot-key="^" id="shift+6"/>
      <MathButton formula="|x|" @click="append('abs(')" type="tertiary" hot-key="|" id="|"/> 
      <MathButton formula="7" @click="append('7')" id="button7"/>
      <MathButton formula="8" @click="append('8')" id="button8"/>
      <MathButton formula="9" @click="append('9')" id="button9"/>
      <MathButton formula="\div" @click="append('/')" type="tertiary" hot-key="/" id="/"/>
      <MathButton formula="AC" @click="clear" secondary type="error" hot-key="shift + ⌫" id="clear"/>

      <MathButton formula="\surd{}" @click="append('sqrt(')" type="tertiary" hot-key="q" id="q"/>
      <MathButton formula="\ln" @click="append('log(')" type="tertiary" hot-key="l" id="l"/>
      <MathButton formula="1/x" @click="append('(1/')" type="tertiary" hot-key="w" id="w"/>
      <MathButton formula="4" @click="append('4')" id="button4"/>
      <MathButton formula="5" @click="append('5')" id="button5"/>
      <MathButton formula="6" @click="append('6')" id="button6"/>
      <MathButton formula="\times" @click="append('*')" type="tertiary" hot-key="*" id="shift+8"/>
      <MathButton formula="DEL" @click="deleteLast" secondary type="warning" hot-key="⌫" id="backspace"/>

      <MathButton formula="\sin" @click="append('sin(')" type="tertiary" hot-key="s" id="buttonS"/>
      <MathButton formula="\cos" @click="append('cos(')" type="tertiary" hot-key="c" id="buttonC"/>
      <MathButton formula="\tan" @click="append('tan(')" type="tertiary" hot-key="t" id="buttonT"/>
      <MathButton formula="1" @click="append('1')" id="button1"/>
      <MathButton formula="2" @click="append('2')" id="button2"/>
      <MathButton formula="3" @click="append('3')" id="button3"/>
      <MathButton formula="-" @click="append('-')" type="tertiary" id="-"/>
      <MathButton formula="Ans" @click="appendLastResult" secondary type="info" hot-key="a" id="a"/>

      <MathButton formula="\arcsin" @click="append('asin(')" type="tertiary" hot-key="shift + s" id="buttonShiftS"/>
      <MathButton formula="\arccos" @click="append('acos(')" type="tertiary" hot-key="shift + c" id="buttonShiftC"/>
      <MathButton formula="\arctan" @click="append('atan(')" type="tertiary" hot-key="shift + t" id="buttonShiftT"/>
      <MathButton formula="0" @click="append('0')" id="button0"/>
      <MathButton formula="." @click="append('.')" id="."/>
      <MathButton formula="," @click="append(',')" id=","/>
      <MathButton formula="+" @click="append('+')" type="tertiary" id="shift+="/>
      <MathButton formula="=" @click="onClickCalculate" secondary type="info" hot-key="↵" id="enter"/>

      <MathButton formula="(" @click="append('(')" type="tertiary" id="("/>
      <MathButton formula=")" @click="append(')')" type="tertiary" id=")"/>
      <MathButton formula="x!" @click="append('!')" type="tertiary" id="shift+1"/>
      <MathButton formula="\pi" @click="append('pi')" hot-key="p + i" id="p+i"/>
      <MathButton formula="e" @click="append('e')" id="buttonE"/>
      <MathButton formula="\%" @click="append('%')" id="shift+5"/>
      <MathButton formula="nPr" @click="append('permutations(')" type="tertiary" hot-key="[" id="permutations("/>
      <MathButton formula="nCr" @click="append('combinations(')" type="tertiary" hot-key="]" id="combinations("/>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from "pinia";
import { useSettingStore } from "@/stores/settingStore";
import { evaluate, isComplex } from 'mathjs';
import { NO_DELETING, INF_ERROR, TAN_ANGLE_ERROR, COMPLEX_ERROR, TAN_ERROR, LOG_ERROR, ZERO_DIVISION_ERROR, NO_MORE_CLICK } from "@/constants/message";
import { MESSAGE_CONFIG } from '@/constants/messageConfig';
import MathButton from '@/components/MathButton.vue';
import { convert2tex } from "@/utils/convert2tex";
import katex from "katex"
import { NSwitch, NIcon, NIconWrapper } from 'naive-ui';
import hotkeys from 'hotkeys-js';
import { useBaseInputStore } from "@/stores/input/BaseInputStore"
import { useBaseResultStore } from "@/stores/result/BaseResultStore"
import { useBaseCalcStore } from "@/stores/baseCalcStore";
import type { CSSProperties } from 'vue'
import type { HistoryData } from "@/types/HistoryData";
import { useHistoryStore } from "@/stores/historyStore";
import { useRoute } from "vue-router";
import { canConvertToFraction, convertToFraction } from "@/utils/fraction";
import { useThemeStore } from "@/stores/themeStore";
import { debounce, throttle } from 'lodash';

//节流状态变量
let isThrottling = false;
// 主题颜色
const { themeClass } = storeToRefs(useThemeStore());

// 定义状态变量
const { precision } = storeToRefs(useSettingStore());  // 精度
const { formula } = storeToRefs(useBaseInputStore());  // 存储公式
const { result } = storeToRefs(useBaseResultStore());  // 存储结果
// 定义了一个新变量 displayResult，原来的result默认保持8位小数（用于判断是否需要转成小数，因为只知道四舍五入后的结果没法判断这个）
const displayResult = computed(() => Number(Number(result.value).toFixed(precision.value)))
const lastResult = ref<string | null>(null);  // 存储上一次计算的结果
const { isKey, isAngle } = storeToRefs(useBaseCalcStore());   // 是否键盘输入/是否角度制
const formulaDisplay = computed(() => {
  try {
    return convert2tex(formula.value);
  } catch(e) {
    console.log(e);
    return formula.value;
  }
})
const isFranctional = ref(false);   // 是否已经转成小数
const canBeFractional = computed(() => canConvertToFraction(result.value))  // 是否能够转成小数

// 添加输入字符到公式
const appendLastResult = () => {
  if (lastResult.value) {
    // 如果数字结尾，此时输入ANS，代表用户想丢弃当前输入框的所有数据，因此ANS覆盖已有数据
    if (/\d$/.test(formula.value)) {
      formula.value = lastResult.value;
    } else {
      formula.value += lastResult.value;
    }
  }
};
const append = (char: string) => {
  formula.value += char;
  result.value = '';  // 每次输入时清空显示结果，重新输入公式
};
const calculate = () => {
  if (formula.value === '') {
    result.value = '0';
  } else {
    try {
      let expression = formula.value;

      // 替换符号为 JavaScript 可识别的表达式
      expression = expression.replace(/%/g, '/100');

      const tanRegex = /tan\((.*?)\)/g;
      // 正则表达式匹配 tan 函数，并提取其参数
      if (!isAngle.value) {
        let match;
        while ((match = tanRegex.exec(expression)) !== null) {
          const tanArgument = match[1]; // 获取 tan 函数中的参数
          const evaluatedArgument = evaluate(tanArgument); // 计算参数的值

          const tolerance = 1e-10; // 容差，用于处理 π/2 等临界点
          // 检查参数是否接近 π/2 的倍数
          if (Math.abs((evaluatedArgument - Math.PI / 2) % Math.PI) < tolerance) {
            window.$message.error(TAN_ERROR, MESSAGE_CONFIG)
            result.value = 'Error';
            return; // 返回错误，不继续计算
          }
        }
      } else {
        let match;
        while ((match = tanRegex.exec(expression)) !== null) {
          const tanArgument = match[1]; // 获取 tan 函数中的参数
          const evaluatedArgument = evaluate(tanArgument); // 计算参数的值

          const tolerance = 1e-10; // 容差，用于处理 π/2 等临界点
          // 检查参数是否接近 π/2 的倍数
          if (Math.abs((evaluatedArgument - 90) % 90) < tolerance) {
            window.$message.error(TAN_ANGLE_ERROR, MESSAGE_CONFIG)
            result.value = 'Error';
            return; // 返回错误，不继续计算
          }
        }
        expression = addDegreeToTrigFunctions(expression);  // 如果采用角度制，sin(x)改成 sin(x deg)
      }
      
      // 判断对数是否有效
      let match;
      const lnRegex = /log\(([^)]+)\)/g; // 匹配 ln() 函数的正则表达式

      while ((match = lnRegex.exec(expression)) !== null) {
        const lnArgument = match[1]; // 获取 ln 函数中的参数
        const evaluatedArgument = evaluate(lnArgument); // 计算参数的值

        // 检查参数是否小于等于 0
        if (evaluatedArgument <= 0) {
          window.$message.error(LOG_ERROR, MESSAGE_CONFIG);
          result.value = 'Error';
          return; // 返回错误，不继续计算
        }
      }
      // 使用 mathjs 计算表达式的结果
      const evaluatedResult = evaluate(expression);
       // 检查结果是否为无穷大或复杂数
       if (isComplex(evaluatedResult)) {
        result.value = 'Error';
        window.$message.error(COMPLEX_ERROR, MESSAGE_CONFIG);
        return;
      }
       if (!isFinite(evaluatedResult)) {
        result.value = 'Error';
        window.$message.error(ZERO_DIVISION_ERROR, MESSAGE_CONFIG);
        return;
      }

      // 整数、小数输出精确
      if (Number.isInteger(evaluatedResult)) {
        result.value = evaluatedResult.toString(); // 结果为整数，直接输出
      } else {
        result.value = evaluatedResult.toFixed(8); // 结果为小数，使用精度
      }

      lastResult.value = result.value; // 更新ANS
      addHistory();
    } catch (error) {
      window.$message.error('表达式无效')
      result.value = 'Error';
    }
  }
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

// 如果检测到不能转成分数，则立马把 isFractional 置为false
watchEffect(() => {
  if (!canBeFractional.value) {
    isFranctional.value = false;
  }
})

// @@@@@@@@@@@@@@@@@@@@@@@@
// 一些特殊按钮
// @@@@@@@@@@@@@@@@@@@@@@@@
// 清空输入框
const clear = () => {
  if (formula.value === '' && result.value === '') {
    handleRedirectAC();
    return;
  }
  formula.value = '';
  result.value = '';
};
// 删除最后一个字符
const deleteLast = () => {
  if (formula.value === '') {
    handleRedirectDel();
    return;
  } else { 
    formula.value = formula.value.slice(0, -1); 
  }
};
const handleRedirectDel = debounce(() => {
  window.$message.info(NO_DELETING, MESSAGE_CONFIG)
}, 200)
const handleRedirectAC = debounce(() => {
  window.$message.info(NO_DELETING, MESSAGE_CONFIG)
}, 200)



// @@@@@@@@@@@@@@@@@@@@@@
// 渲染数学公式
// @@@@@@@@@@@@@@@@@@@@@@
const katexContainer = ref(null)
// 监听输入变化并更新 KaTeX 渲染
watchEffect(() => {
  if (katexContainer.value) {
    try {
      // 使用 KaTeX 渲染输入的 LaTeX 表达式
      katex.render(formulaDisplay.value, katexContainer.value, {
        throwOnError: true, // 当遇到错误时不抛出异常，只显示错误消息
      })
    } catch (error) {
      console.error('KaTeX 渲染失败:', error)
    }
  }
})

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// 一些替换函数
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@
function addDegreeToTrigFunctions(str: string) {
    // 正则表达式匹配 tan(x), sin(x), cos(x)，确保它们带有括号
    const regex = /\btan\(([^)]+)\)|\bsin\(([^)]+)\)|\bcos\(([^)]+)\)/g;

    // 替换函数，用于替换匹配到的字符串
    // @ts-ignore
    const replaceFunc = (match, p1, p2, p3) => {
        // 根据匹配的组来决定是 tan, sin 还是 cos
        const type = match.startsWith('tan') ? 'tan' :
                     match.startsWith('sin') ? 'sin' : 'cos';
        // 提取 x 的值
        const value = p1 || p2 || p3; // 提取匹配到的参数
        // 返回替换后的字符串
        return `${type}(${value} deg)`;
    };

    // 使用正则表达式和替换函数来替换字符串中的所有匹配项
    return str.replace(regex, replaceFunc);
}

// @@@@@@@@@@@@@@@@@@@@@@
// 键盘输入
// @@@@@@@@@@@@@@@@@@@@@@
onMounted(() => {
  hotkeys('1', () => { append('1'); document.getElementById('button1')?.focus(); });
  hotkeys('2', () => { append('2'); document.getElementById('button2')?.focus(); });
  hotkeys('3', () => { append('3'); document.getElementById('button3')?.focus(); });
  hotkeys('4', () => { append('4'); document.getElementById('button4')?.focus(); });
  hotkeys('5', () => { append('5'); document.getElementById('button5')?.focus(); });
  hotkeys('6', () => { append('6'); document.getElementById('button6')?.focus(); });
  hotkeys('7', () => { append('7'); document.getElementById('button7')?.focus(); });
  hotkeys('8', () => { append('8'); document.getElementById('button8')?.focus(); });
  hotkeys('9', () => { append('9'); document.getElementById('button9')?.focus(); });
  hotkeys('0', () => { append('0'); document.getElementById('button0')?.focus(); });
  hotkeys('t', () => { append('tan('); document.getElementById('buttonT')?.focus(); });
  hotkeys('c', () => { append('cos('); document.getElementById('buttonC')?.focus(); });
  hotkeys('s', () => { append('sin('); document.getElementById('buttonS')?.focus(); });
  hotkeys('e', () => { append('e'); document.getElementById('buttonE')?.focus(); });
  hotkeys('shift+t', () => { append('atan('); document.getElementById('buttonShiftT')?.focus(); });
  hotkeys('shift+c', () => { append('acos('); document.getElementById('buttonShiftC')?.focus(); });
  hotkeys('shift+s', () => { append('asin('); document.getElementById('buttonShiftS')?.focus(); });
  hotkeys('shift+9', () => { append('('); document.getElementById('(')?.focus(); });
  hotkeys('shift+0', () => { append(')'); document.getElementById(')')?.focus(); });
  hotkeys('enter', () => { calculate(); document.getElementById('enter')?.focus(); });
  hotkeys('backspace', () => { deleteLast(); document.getElementById('backspace')?.focus(); }); 
  hotkeys('shift+1', () => { append('!'); document.getElementById('shift+1')?.focus(); });
  hotkeys('shift+6', () => { append('^('); document.getElementById('shift+6')?.focus(); });
  hotkeys('[', () => { append('permutations('); document.getElementById('permutations(')?.focus(); });
  hotkeys(']', () => { append('combinations('); document.getElementById('combinations(')?.focus(); });
  hotkeys(',', () => { append(','); document.getElementById(',')?.focus(); });
  hotkeys('.', () => { append('.'); document.getElementById('.')?.focus(); });
  hotkeys('shift+=', () => { append('+'); document.getElementById('shift+=')?.focus(); });
  hotkeys('-', () => { append('-'); document.getElementById('-')?.focus(); });
  hotkeys('shift+8', () => { append('*'); document.getElementById('shift+8')?.focus(); });
  hotkeys('/', () => { append('/'); document.getElementById('/')?.focus(); });
  hotkeys('shift+backspace', () => { clear(); document.getElementById('shift+backspace')?.focus(); });
  hotkeys('esc', () => { 
    isAngle.value = !isAngle.value; 
    document.getElementById('esc')?.focus(); 
  });
  hotkeys('shift+\\', () => { append('abs('); document.getElementById('shift+\\')?.focus(); });
  hotkeys('shift+5', () => { append('%'); document.getElementById('shift+5')?.focus(); });
  hotkeys('p+i', () => { append('pi'); document.getElementById('p+i')?.focus(); });
  hotkeys('a', () => { appendLastResult(); document.getElementById('a')?.focus(); });
  hotkeys('`', () => { 
    isKey.value = !isKey.value; 
  });
  hotkeys('ctrl+enter', () => { 
    if (canBeFractional.value) { 
      isFranctional.value = !isFranctional.value 
    } 
  });
  hotkeys('l', () => { append('log('); document.getElementById('l')?.focus(); });
  hotkeys('q', () => { append('sqrt('); document.getElementById('q')?.focus(); });
  hotkeys('w', () => { append('(1/'); document.getElementById('w')?.focus(); });
})

// 解绑热键
onUnmounted(() => {
  hotkeys.unbind('1');
  hotkeys.unbind('2');
  hotkeys.unbind('3');
  hotkeys.unbind('4');
  hotkeys.unbind('5');
  hotkeys.unbind('6');
  hotkeys.unbind('7');
  hotkeys.unbind('8');
  hotkeys.unbind('9');
  hotkeys.unbind('0');
  hotkeys.unbind('t');
  hotkeys.unbind('c');
  hotkeys.unbind('s');
  hotkeys.unbind('e');
  hotkeys.unbind('shift+t');
  hotkeys.unbind('shift+c');
  hotkeys.unbind('shift+s');
  hotkeys.unbind('shift+9');
  hotkeys.unbind('shift+0');
  hotkeys.unbind('enter');
  hotkeys.unbind('backspace');
  hotkeys.unbind('shift+1');
  hotkeys.unbind('shift+6');
  hotkeys.unbind('[');
  hotkeys.unbind(']');
  hotkeys.unbind(',');
  hotkeys.unbind('.');
  hotkeys.unbind('shift+=');
  hotkeys.unbind('-');
  hotkeys.unbind('shift+8');
  hotkeys.unbind('/');
  hotkeys.unbind('shift+backspace');
  hotkeys.unbind('esc');
  hotkeys.unbind('shift+\\');
  hotkeys.unbind('shift+5');
  hotkeys.unbind('p+i');
  hotkeys.unbind('a');
  hotkeys.unbind('`');
  hotkeys.unbind('ctrl+enter');
  hotkeys.unbind('l');
  hotkeys.unbind('q');
  hotkeys.unbind('w');
});

// 选择器样式
const railStyle = ({
  focused,
  checked
}: {
  focused: boolean
  checked: boolean
}) => {
  const style: CSSProperties = {}
  if (checked) {
    style.background = '#ba5140'
    if (focused) {
      style.boxShadow = '0 0 0 2px #ba514040'
    }
  }
  else {
    style.background = '#4994c4'
    if (focused) {
      style.boxShadow = '0 0 0 2px #4994c440'
    }
  }
  return style
}
onMounted(() => {
  const buttons = document.querySelectorAll('.buttons')[0]
  const inputBtns = Array.from(buttons.children);
  if (isKey.value) {
    inputBtns.forEach(button => {
      // @ts-ignore
      button.style.height = '60px'
      // @ts-ignore
      button.style.fontSize = '22px'
    })
  } else {
    inputBtns.forEach(button => {
      // @ts-ignore
      button.style.height = '50px'
      // @ts-ignore
      button.style.fontSize = '25px'
    })
  }

})
watch(isKey, (newVal) => {
  const buttons = document.querySelectorAll('.buttons')[0]
  const inputBtns = Array.from(buttons.children);
  if (newVal) {
    inputBtns.forEach(button => {
      // @ts-ignore
      button.style.height = '60px'
      // @ts-ignore
      button.style.fontSize = '22px'
    })
  } else {
    inputBtns.forEach(button => {
      // @ts-ignore
      button.style.height = '50px'
      // @ts-ignore
      button.style.fontSize = '25px'
    })
  }
})

const historyStore = useHistoryStore();
// @@@@@@@@@@@@@@@@@@@@@@@@
// 添加历史记录
// @@@@@@@@@@@@@@@@@@@@@@@@
const addHistory = () => {
  let history: HistoryData = {
    saveTime: Date.now(),
    name: 'base',
    inputData: {
      formula: formula.value
    },
    resultData: {
      result: result.value
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
    formula.value = inputData.formula;
    result.value = resultData.result;
  }
}
</script>

<style scoped>

.light-theme {
  --display-border: 2px solid rgb(168, 166, 166);
  --calculator-border: 2px solid rgb(168, 166, 166);
}

.dark-theme {
  --display-border: 2px solid #1d5e50;
  --calculator-border: 2px solid #1d5e50;
}
.calculator {
  width: 95%;
  margin-left: 2.5%;
  margin-right: 2.5%;
  padding-bottom: 5px;
}

.formula-display {
  flex: 30%;
  font-size: 25px;
}
.result-display {
  font-size: 30px;
  font-weight: bold;
}

.display {
  border: var(--display-border);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  border-radius: 0.5cap;
  height: 80px;
  margin-bottom: 10px;
  width: 97%;
  padding: 10px; 
}
.buttons {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  margin-top: 10px;
  color: rgb(35, 34, 34);
  font-family: 'Times New Roman', Times, serif;
}
button {
  height: 50px;
  font-size: 25px;
}

.setting {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
}
</style>

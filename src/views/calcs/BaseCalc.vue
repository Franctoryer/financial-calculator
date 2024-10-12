<template>
  <div class="calculator">
    <div class="display">
      <div ref="katexContainer" class="formula-display"></div>
      <!-- 显示计算结果 -->
      <div class="result-display">= {{ result }}</div>
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
      <MathButton formula="x^2" @click="append('^2')" type="tertiary" hot-key="^2"/>
      <MathButton formula="x^{\square}" @click="append('^(')" type="tertiary" hot-key="^"/>
      <MathButton formula="|x|" @click="append('abs(')" type="tertiary" hot-key="|"/> 
      <MathButton formula="7" @click="append('7')"/>
      <MathButton formula="8" @click="append('8')" />
      <MathButton formula="9" @click="append('9')" />
      <MathButton formula="\div" @click="append('/')" type="tertiary" hot-key="/"/>
      <MathButton formula="AC" @click="clear" secondary type="error" hot-key="shift + BS"/>

      <MathButton formula="\surd{}" @click="append('sqrt(')" type="tertiary"/>
      <MathButton formula="\log" @click="append('log(')" type="tertiary"/>
      <MathButton formula="1/x" @click="append('(1/')" type="tertiary"/>
      <MathButton formula="4" @click="append('4')" />
      <MathButton formula="5" @click="append('5')" />
      <MathButton formula="6" @click="append('6')" />
      <MathButton formula="\times" @click="append('*')" type="tertiary" hot-key="*"/>
      <MathButton formula="DEL" @click="deleteLast" secondary type="warning" hot-key="BS"/>

      <MathButton formula="\sin" @click="append('sin(')" type="tertiary" hot-key="s"/>
      <MathButton formula="\cos" @click="append('cos(')" type="tertiary" hot-key="c"/>
      <MathButton formula="\tan" @click="append('tan(')" type="tertiary" hot-key="t"/>
      <MathButton formula="1" @click="append('1')" />
      <MathButton formula="2" @click="append('2')" />
      <MathButton formula="3" @click="append('3')" />
      <MathButton formula="-" @click="append('-')" type="tertiary"/>
      <MathButton formula="Ans" @click="appendLastResult" secondary type="info" hot-key="a"/>

      <MathButton formula="\arcsin" @click="append('asin(')" type="tertiary" hot-key="shift + s"/>
      <MathButton formula="\arccos" @click="append('acos(')" type="tertiary" hot-key="shift + c"/>
      <MathButton formula="\arctan" @click="append('atan(')" type="tertiary" hot-key="shift + t"/>
      <MathButton formula="0" @click="append('0')" />
      <MathButton formula="." @click="append('.')"/>
      <MathButton formula="," @click="append(',')"/>
      <MathButton formula="+" @click="append('+')" type="tertiary"/>
      <MathButton formula="=" @click="calculate" secondary type="info" hot-key="Enter"/>

      <MathButton formula="(" @click="append('(')" type="tertiary"/>
      <MathButton formula=")" @click="append(')')" type="tertiary"/>
      <MathButton formula="x!" @click="append('!')" type="tertiary"/>
      <MathButton formula="\pi" @click="append('pi')" hot-key="p + i"/>
      <MathButton formula="e" @click="append('e')"/>
      <MathButton formula="\%" @click="append('%')"/>
      <MathButton formula="nPr" @click="append('permutations(')" type="tertiary" hot-key="["/>
      <MathButton formula="nCr" @click="append('combinations(')" type="tertiary" hot-key="]"/>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect, computed, onMounted } from 'vue';
import { storeToRefs } from "pinia";
import { useSettingStore } from "@/stores/settingStore";
import { evaluate } from 'mathjs';
import { NO_DELETING, ZERO_DIVISION_ERROR, NO_CLEAR } from "@/constants/message";
import { MESSAGE_CONFIG } from '@/constants/messageConfig';
import MathButton from '@/components/MathButton.vue';
import { convert2tex } from "@/utils/convert2tex";
import katex from "katex"
import { NSwitch } from 'naive-ui';
import hotkeys from 'hotkeys-js';
import { useBaseInputStore } from "@/stores/input/BaseInputStore"
import { useBaseResultStore } from "@/stores/result/BaseResultStore"
import { useBaseCalcStore } from "@/stores/baseCalcStore";
import type { CSSProperties } from 'vue'


// 定义状态变量
const { precision } = storeToRefs(useSettingStore());
const { formula } = storeToRefs(useBaseInputStore());  // 存储公式
const { result } = storeToRefs(useBaseResultStore());  // 存储结果
const lastResult = ref<string | null>(null);  // 存储上一次计算的结果
const { isKey, isAngle } = storeToRefs(useBaseCalcStore());
const formulaDisplay = computed(() => {
  try {
    return convert2tex(formula.value);
  } catch(e) {
    console.log(e);
    return formula.value;
  }
})

// 添加输入字符到公式
const appendLastResult = () => {
  if (lastResult.value) {
    formula.value += lastResult.value;
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

      // 正则表达式匹配 tan 函数，并提取其参数
      if (!isAngle.value) {
        const tanRegex = /tan\((.*?)\)/g;
        let match;
        while ((match = tanRegex.exec(expression)) !== null) {
          const tanArgument = match[1]; // 获取 tan 函数中的参数
          const evaluatedArgument = evaluate(tanArgument); // 计算参数的值

          const tolerance = 1e-10; // 容差，用于处理 π/2 等临界点
          // 检查参数是否接近 π/2 的倍数
          if (Math.abs((evaluatedArgument - Math.PI / 2) % Math.PI) < tolerance) {
            result.value = 'Error';
            return; // 返回错误，不继续计算
          }
        }
      } else {
        expression = addDegreeToTrigFunctions(expression);  // 如果采用角度制，sin(x)改成 sin(x deg)
      }
      
      // 使用 mathjs 计算表达式的结果
      const evaluatedResult = evaluate(expression);

      // 整数、小数输出精确
      if (Number.isInteger(evaluatedResult)) {
        result.value = evaluatedResult.toString(); // 结果为整数，直接输出
      } else {
        result.value = evaluatedResult.toFixed(precision.value).toString(); // 结果为小数，使用精度
      }

      lastResult.value = result.value; // 更新ANS
    } catch (error) {
      result.value = 'Error';
    }
  }
};

// @@@@@@@@@@@@@@@@@@@@@@@@
// 一些特殊按钮
// @@@@@@@@@@@@@@@@@@@@@@@@
// 清空输入框
const clear = () => {
  if (formula.value === '' && result.value === '') {
    return;
  }
  formula.value = '';
  result.value = '';
};
// 删除最后一个字符
const deleteLast = () => {
  if (formula.value === '') {
    return;
  } else { 
    formula.value = formula.value.slice(0, -1); 
  }
};
const handleRedirectDel = (): void => {
  window.$message.info(NO_DELETING, MESSAGE_CONFIG)
}
const handleRedirectAC = (): void => {
  window.$message.info(NO_CLEAR, MESSAGE_CONFIG)
}

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

hotkeys('1', () => append('1'));
hotkeys('2', () => append('2'));
hotkeys('3', () => append('3'));
hotkeys('4', () => append('4'));
hotkeys('5', () => append('5'));
hotkeys('6', () => append('6'));
hotkeys('7', () => append('7'));
hotkeys('8', () => append('8'));
hotkeys('9', () => append('9'));
hotkeys('0', () => append('0'));
hotkeys('t', () => append('tan('));
hotkeys('c', () => append('cos('));
hotkeys('s', () => append('sin('));
hotkeys('e', () => append('e'));
hotkeys('shift+t', () => append('atan('));
hotkeys('shify+c', () => append('acos('));
hotkeys('shift+s', () => append('asin('));
hotkeys('shift+9', () => append('('));
hotkeys('shift+0', () => append(')'));
hotkeys('enter', calculate);
hotkeys('backspace', deleteLast); 
hotkeys('shift+1', () => append('!'));
hotkeys('shift+6', () => append('^('));
hotkeys('[', () => append('permutations('));
hotkeys(']', () => append('combinations('));
hotkeys(',', () => append(','));
hotkeys('.', () => append('.'));
hotkeys('shift+=', () => append('+'));
hotkeys('-', () => append('-'));
hotkeys('shift+8', () => append('*'));
hotkeys('/', () => append('/'));
hotkeys('shift+backspace', clear);
hotkeys('esc', () => isAngle.value = !isAngle.value);
hotkeys('shift+\\', () => append('abs('));
hotkeys('shift+5', () => append('%'));
hotkeys('p+i', () => append('pi'));
hotkeys('a', appendLastResult);

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

// @@@@@@@@@@@@@@@@@@@@@@@@
// 添加历史记录
// @@@@@@@@@@@@@@@@@@@@@@@@
// const addHistory = () => {
//     let history: HistoryData = {
//       saveTime: Date.now(),
//       name: 'circled-cashflow',
//       inputData: {
//         interest: interest.value,
//         isContinueCompound: isContinueCompound.value,
//         rawData: JSON.parse(JSON.stringify(rawData.value))  // 引用对象要深拷贝而不是浅拷贝
//       },
//       resultData: {
//         npv: npv.value,
//         irr: irr.value,
//         pi: pi.value
//       }
//     } 
//     historyStore.addHistory(history);
//   }
</script>

<style scoped>
.calculator {
  width: 95%;
  margin-left: auto;
  margin-right: auto;
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
  border: 2px solid rgb(168, 166, 166);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding: 10px;
  border-radius: 0.5cap;
  height: 70px;
  justify-self: center;
  margin-bottom: 10px;
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
}
</style>

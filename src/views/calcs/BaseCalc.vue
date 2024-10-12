<template>
  <div class="calculator">
    <div class="display">
      <div ref="katexContainer" class="formula-display"></div>
      <!-- 显示计算结果 -->
      <div class="result-display">= {{ result }}</div>
    </div>
    <div class="buttons">
      <MathButton formula="x^2" @click="append('^2')" type="tertiary"/>
      <MathButton formula="x^{\square}" @click="append('^(')" type="tertiary"/>
      <MathButton formula="|x|" @click="append('abs(')" type="tertiary"/> 
      <MathButton formula="7" @click="append('7')"/>
      <MathButton formula="8" @click="append('8')" />
      <MathButton formula="9" @click="append('9')" />
      <MathButton formula="\div" @click="append('/')" type="tertiary"/>
      <MathButton formula="AC" @click="clear" secondary type="error"/>

      <MathButton formula="\surd{}" @click="append('sqrt(')" type="tertiary"/>
      <MathButton formula="\log" @click="append('log(')" type="tertiary"/>
      <MathButton formula="1/x" @click="append('(1/')" type="tertiary"/>
      <MathButton formula="4" @click="append('4')" />
      <MathButton formula="5" @click="append('5')" />
      <MathButton formula="6" @click="append('6')" />
      <MathButton formula="\times" @click="append('*')" type="tertiary"/>
      <MathButton formula="DEL" @click="deleteLast" secondary type="warning"/>

      <MathButton formula="\sin" @click="append('sin(')" type="tertiary"/>
      <MathButton formula="\cos" @click="append('cos(')" type="tertiary"/>
      <MathButton formula="\tan" @click="append('tan(')" type="tertiary"/>
      <MathButton formula="1" @click="append('1')" />
      <MathButton formula="2" @click="append('2')" />
      <MathButton formula="3" @click="append('3')" />
      <MathButton formula="-" @click="append('-')" type="tertiary"/>
      <MathButton formula="=" @click="calculate" secondary type="info"/>

      <MathButton formula="\arcsin" @click="append('asin(')" type="tertiary"/>
      <MathButton formula="\arccos" @click="append('acos(')" type="tertiary"/>
      <MathButton formula="\arctan" @click="append('atan(')" type="tertiary"/>
      <MathButton formula="0" @click="append('0')" />
      <MathButton formula="." @click="append('.')" type="tertiary"/>
      <MathButton formula="," @click="append(',')" type="tertiary"/>
      <MathButton formula="+" @click="append('+')" type="tertiary"/>
      <MathButton formula="Ans" @click="appendLastResult" secondary type="info"/>


      <MathButton formula="(" @click="append('(')" type="tertiary"/>
      <MathButton formula=")" @click="append(')')" type="tertiary"/>
      <MathButton formula="x!" @click="append('!')" type="tertiary"/>
      <MathButton formula="\pi" @click="append('pi')"/>
      <MathButton formula="e" @click="append('e')"/>
      <MathButton formula="\%" @click="append('%')" type="tertiary"/>
      <MathButton formula="nPr" @click="append('permutations(')" type="tertiary"/>
      <MathButton formula="nCr" @click="append('combinations(')" type="tertiary"/>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, computed } from 'vue';
import { storeToRefs } from "pinia";
import { useSettingStore } from "@/stores/settingStore";
import { evaluate } from 'mathjs';
import { NO_DELETING, ZERO_DIVISION_ERROR, NO_CLEAR } from "@/constants/message";
import { MESSAGE_CONFIG } from '@/constants/messageConfig';
import MathButton from '@/components/MathButton.vue';
import { convert2tex } from "@/utils/convert2tex";
import katex from "katex"

// 定义状态变量
const { precision } = storeToRefs(useSettingStore());
const formula = ref<string>('');  // 存储公式
const result = ref<string | null>(null);  // 存储结果
let lastResult = ref<string | null>(null);  // 存储上一次计算的结果
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
      expression = expression
        .replace(/\u00D7/g, '*')
        .replace(/\u00F7/g, '/')
        .replace(/%/g, '/100');

      // 正则表达式匹配 tan 函数，并提取其参数
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

      // 使用 mathjs 计算表达式的结果
      const evaluatedResult = evaluate(expression);

      // 整数、小数输出精确
      if (Number.isInteger(evaluatedResult)) {
        result.value = evaluatedResult.toString(); // 结果为整数，直接输出
      } else {
        result.value = evaluatedResult.toFixed(precision.value).toString(); // 结果为小数，使用精度
      }

      lastResult.value = result.value; // 仅更新结果
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
    handleRedirectAC()
  }
  formula.value = '';
  result.value = '';
};
// 删除最后一个字符
const deleteLast = () => {
  if (formula.value === '') {
    handleRedirectDel()
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
}
.buttons {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  margin-top: 20px;
  color: rgb(35, 34, 34);
  font-family: 'Times New Roman', Times, serif;
}
button {
  height: 50px;
  font-size: 25px;
}
</style>

<template>
  <div class="calculator">
    <div class="display">
      <!-- 使用 MathJax 显示用户输入的公式 -->
      <div ref="formulaDisplay" class="formula-display"></div>
      <!-- 显示计算结果 -->
      <div class="result-display">= {{ result }}</div>
    </div>
    <div class="buttons">
      <Button label="x²" @click="append('^2')" />
      <Button label="^" @click="append('^')" />
      <Button label="|x|" @click="append('abs(')" />
      <Button label="7" class="p-button-num" @click="append('7')" />
      <Button label="8" class="p-button-num" @click="append('8')" />
      <Button label="9" class="p-button-num" @click="append('9')" />
      <Button label="DEL" class="p-button-warning" @click="deleteLast"/>
      <Button label="AC" class="p-button-danger" @click="clear" />

      <Button label="√x" @click="append('sqrt(')" />
      <Button label="π" @click="append('pi')" />
      <Button label="e" class="p-button-e" @click="append('e')" />
      <Button label="4" class="p-button-num" @click="append('4')" />
      <Button label="5" class="p-button-num" @click="append('5')" />
      <Button label="6" class="p-button-num" @click="append('6')" />
      <Button label="×" @click="append('*')" />
      <Button label="÷" @click="append('/')"/>

      <Button label="sin" @click="append('sin(')" />
      <Button label="cos" @click="append('cos(')" />
      <Button label="tan" @click="append('tan(')" />
      <Button label="1" class="p-button-num" @click="append('1')" />
      <Button label="2" class="p-button-num" @click="append('2')" />
      <Button label="3" class="p-button-num" @click="append('3')" />
      <Button label="+" @click="append('+')" />
      <Button label="-" @click="append('-')" />

      <Button label="(" @click="append('(')" />
      <Button label=")" @click="append(')')" />
      <Button label="x!" @click="append('!')" />
      <Button label="0" class="p-button-num" @click="append('0')" />
      <Button label="." @click="append('.')"/>
      <Button label="%" @click="append('%')" />
      <Button label="=" class="p-button-success" @click="calculate" />
      <Button label="Ans" class="p-button-lastcalc" @click="appendLastResult" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Button from 'primevue/button';
import { init } from 'mathjax/es5/tex-mml-chtml.js';
import { storeToRefs } from "pinia";
import { useSettingStore } from "@/stores/settingStore";
import { evaluate } from 'mathjs';
import { NO_DELETING,ZERO_DIVISION_ERROR,NO_CLEAR} from "@/constants/message";
import { MESSAGE_CONFIG } from '@/constants/messageConfig';


let MathJax: any;  // MathJax 初始化变量

// 定义状态变量
const { precision } = storeToRefs(useSettingStore());
const formula = ref<string>('');  // 存储公式
const result = ref<string | null>(null);  // 存储结果
let lastResult = ref<string | null>(null);  // 存储上一次计算的结果
// 引用 DOM 元素，显示公式
const formulaDisplay = ref<HTMLElement | null>(null);

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

// 清空输入框
const clear = () => {
  if(formula.value === '' && result.value === ''){
    handleRedirectAC()
      }
  else {formula.value = '';result.value = ''}
  formula.value = '';
};

// 删除最后一个字符
const deleteLast = () => {
  if(formula.value === ''){
    handleRedirectDel()
      }
  else {formula.value = formula.value.slice(0, -1);}
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




// 计算阶乘
const calculateFactorial = () => {
  try {
    const num = parseInt(formula.value);
    if (isNaN(num) || num < 0) {
      result.value = 'Error';
      return;
    }
    result.value = factorial(num).toString();
  } catch {
    result.value = 'Error';
  }
};

const factorial = (n: number): number => {
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
};

// 在组件挂载后初始化 MathJax
onMounted(async () => {
  MathJax = await init({
    loader: { load: ['input/tex', 'output/chtml'] },
    tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
  });

  if (formulaDisplay.value) {
    await MathJax.typesetPromise([formulaDisplay.value]);
  }
});

// 观察公式的变化，动态渲染公式
watch(formula, async () => {
  if (formulaDisplay.value) {
    formulaDisplay.value.innerHTML = formula.value; // 直接显示公式
    await MathJax.typesetPromise([formulaDisplay.value]);
  }
});

 /**
   * @param event 点击事件
  */
   const handleRedirectDel = (): void => {
      window.$message.info(NO_DELETING,MESSAGE_CONFIG)
  }
  const handleRedirectAC = (): void => {
      window.$message.info(NO_CLEAR,MESSAGE_CONFIG)
  }
</script>

<style scoped>
.calculator {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;

  border-radius: 10px;
  
}

.formula-display {
  font-size: 1.5rem;
  margin-bottom: 10px;
  padding: 10px;
  min-height: 60px;
  border: 1px solid #ccc;
  background-color: #fff;
  color: black;
  font-family: 'Times New Roman', Times, serif;
  border-radius: 10px;
  border: 4px solid #343a40;
}

.result-display {
  font-size: 1.5rem;
  padding: 10px;
  min-height: 60px;
  border: 1px solid #ccc;
  color: black;
  font-family: 'Times New Roman', Times, serif;
  margin-bottom: 20px;
  border-radius: 10px;
  border: 4px solid #343a40;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  margin-top: 20px;
  color:rgb(35, 34, 34);
  font-family: 'Times New Roman', Times, serif;

}

button {
  padding: 20px;
  font-size: 1.5rem;
  cursor: pointer;
  background-color: #e2edf8;
  border: none;
  border-radius: 5px;
  color: #343a40;
  font-family: 'Times New Roman', Times, serif;
  border-radius: 0;
  height: 50px;
  display: flex;
  justify-content: center; 
  align-items: center;     
  text-align: center; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
}
button:hover{
  transform: scale(1.1); /* 悬停时放大 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
}
.p-button-num {
  background-color: #c1d5e7;
  color: #343a40;
  font-family: 'Arial', Times, serif;
  font-weight: bold;
}

.p-button-e {
  background-color: #e2edf8;
  color: #343a40;
  font-family: 'Arial', Times, serif;
  font-weight: bold;
}

button:active {
  background-color: #d9d9d9;
  color:rgb(35, 34, 34);
  font-family: 'Times New Roman', Times, serif;
}

.p-button-warning {
 background-color: rgb(174, 78, 209);
 color:rgb(242, 238, 238);
 font-family: 'Arial', Times, serif;
 font-weight: bold;
}

.p-button-danger {
 background-color: rgb(198, 73, 73);
 color:rgb(242, 238, 238);
 font-family: 'Arial', Times, serif;
 font-weight: bold;
}

.p-button-success {
  background-color: #3d789d;
  color:rgb(242, 238, 238);
  font-family: 'Times New Roman', Times, serif;
}
.p-button-lastcalc{
  background-color: #97d7e1;
  color:rgb(0, 0, 0);
  font-family: 'Arial', Times, serif;
 font-weight: bold;
}
</style>

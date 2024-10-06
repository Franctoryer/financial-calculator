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
      <Button label="7" @click="append('7')" />
      <Button label="8" @click="append('8')" />
      <Button label="9" @click="append('9')" />
      <Button label="DEL" class="p-button-warning" @click="deleteLast" />
      <Button label="AC" class="p-button-danger" @click="clear" />

      <Button label="√x" @click="append('sqrt(')" />
      <Button label="π" @click="append('pi')" />
      <Button label="e" @click="append('e')" />
      <Button label="4" @click="append('4')" />
      <Button label="5" @click="append('5')" />
      <Button label="6" @click="append('6')" />
      <Button label="×" @click="append('*')" />
      <Button label="÷" @click="append('/')"/>

      <Button label="sin" @click="append('sin(')" />
      <Button label="cos" @click="append('cos(')" />
      <Button label="tan" @click="append('tan(')" />
      <Button label="1" @click="append('1')" />
      <Button label="2" @click="append('2')" />
      <Button label="3" @click="append('3')" />
      <Button label="+" @click="append('+')" />
      <Button label="-" @click="append('-')" />

      <Button label="(" @click="append('(')" />
      <Button label=")" @click="append(')')" />
      <Button label="%" @click="append('%')" />
      <Button label="0" @click="append('0')" />
      <Button label="." @click="append('.')"/>
      <Button label="x!" @click="append('!')" />
      <Button label="=" class="p-button-success" @click="calculate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Button from 'primevue/button';
import { init } from 'mathjax/es5/tex-mml-chtml.js';
import { evaluate } from 'mathjs';

let MathJax: any;  // MathJax 初始化变量

// 定义状态变量
const formula = ref<string>('');  // 存储公式
const result = ref<string | null>(null);  // 存储结果

// 引用 DOM 元素，显示公式
const formulaDisplay = ref<HTMLElement | null>(null);

// 添加输入字符到公式
const append = (char: string) => {
  formula.value += char;
  result.value = null;  // 每次输入时清空显示结果，重新输入公式
};

// 清空输入框
const clear = () => {
  formula.value = '';
  result.value = null;
};

// 删除最后一个字符
const deleteLast = () => {
  formula.value = formula.value.slice(0, -1);
};

// 计算结果
const calculate = () => {
  try {
    let expression = formula.value;

    // 替换符号为 JavaScript 可识别的表达式
    expression = expression
      .replace(/\u00D7/g, '*')
      .replace(/\u00F7/g, '/')
      .replace(/%/g, '/100')
      .replace(/\^/g, '**');


    // 使用 mathjs 来计算表达式的结果
    result.value = evaluate(expression).toString();  // 仅更新结果
  } catch (error) {
    result.value = 'Error';
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
</script>

<style scoped>
.calculator {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
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
}

.result-display {
  font-size: 1.5rem;
  padding: 10px;
  min-height: 60px;
  border: 1px solid #ccc;
  color: black;
  font-family: 'Times New Roman', Times, serif;
  margin-bottom: 20px;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  margin-top: 20px;
  color: rgb(103, 102, 107);
  font-family: 'Times New Roman', Times, serif;
}

button {
  padding: 20px;
  font-size: 1.5rem;
  cursor: pointer;
  background-color: #f2f2f2;
  border: none;
  border-radius: 5px;
  color: rgb(103, 102, 107);
  font-family: 'Times New Roman', Times, serif;
}

button:active {
  background-color: #d9d9d9;
  color: rgb(103, 102, 107);
  font-family: 'Times New Roman', Times, serif;
}

.p-button-success {
  background-color: #28a745;
  color: rgb(103, 102, 107);
  font-family: 'Times New Roman', Times, serif;
}
</style>

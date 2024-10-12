export function convert2tex(formula: string): string {
  const latexMap = {
    '*': ' \\times ',
    '/': ' \\div ',
    'pi': ' \\pi ',
    'sin': ' \\sin ',
    'tan': ' \\tan ',
    'cos': ' \\cos ',
    'sqrt': '\\surd',
    '%': '\\%'
  }
  // 遍历 latexMap 的键，并替换 formula 中的对应字符
  for (const key in latexMap) {
    console.log(convert2Reg(key));
    const regex = new RegExp(convert2Reg(key), 'g'); // 创建一个全局的正则表达式
    // @ts-ignore
    formula = formula.replace(regex, latexMap[key]); // 替换字符
  }
  formula = replaceAbsWithPipes(formula);
  formula = replacePower(formula);
  console.log(formula);
  return formula;
}

function convert2Reg(str: string) {
  const regMp = {
    '*': '\\*'
  }
  for (const key in regMp) {
    // @ts-ignore
    str = str.replace(key, regMp[key]);
  }

  return str;
}

// 把abs(<表达式>)转成 |<表达式>|
function replaceAbsWithPipes(expression: string) {
  let result = '';
  let i = 0;

  while (i < expression.length) {
      // 检测到 'abs('，我们开始处理
      if (expression.slice(i, i + 4) === 'abs(') {
          let start = i + 4;
          let openBrackets = 1;
          i = start;

          // 用栈处理括号匹配，直到找到匹配的 ')'
          while (i < expression.length && openBrackets > 0) {
              if (expression[i] === '(') openBrackets++;
              else if (expression[i] === ')') openBrackets--;
              i++;
          }

          // 如果有未匹配的括号，保持原样
          if (openBrackets > 0) {
              result += expression.slice(start - 4, i); // 保留 'abs(' 及后面的内容
          } else {
              // abs() 内部的表达式
              let innerExpression = expression.slice(start, i - 1);
              // 把 abs(...) 转换成 |...|
              result += `|${replaceAbsWithPipes(innerExpression)}|`;
          }
      } else {
          // 不是 abs，直接添加字符到结果
          result += expression[i];
          i++;
      }
  }
  
  return result;
}

// 把^(<表达式>) 转成 ^{表达式}
function replacePower(expression: string) {
  let result = '';
  let stack = [];
  let i = 0;

  while (i < expression.length) {
    if (expression.slice(i, i + 2) === '^(') {
      let start = i + 2;
      let openBrackets = 1;
      i = start;

      // 用栈处理括号匹配
      while (i < expression.length && openBrackets > 0) {
          if (expression[i] === '(') openBrackets++;
          else if (expression[i] === ')') openBrackets--;
          i++;
      }

      // 如果没有找到匹配的右括号，保留原始 ^(
      if (openBrackets > 0) {
          result += "~\\^~(" + expression.slice(start, i); // 保留 '^(' 及后面的内容
      } else {
          let innerExpression = expression.slice(start, i - 1);
          result += `^{${replacePower(innerExpression)}}`;
      }
  } else {
      // 不是 sqrt 或 ^，直接添加字符到结果
      result += expression[i];
      i++;
  }
  }
  
  return result;
}
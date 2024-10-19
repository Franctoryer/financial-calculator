export function convert2tex(formula: string): string {
  const latexMap = {
    'log': '\\ln',
    '*': ' \\times ',
    '/': ' \\div ',
    'pi': ' \\pi ',
    '(?<!a)sin': ' \\sin ',
    '(?<!a)tan': ' \\tan ',
    '(?<!a)cos': ' \\cos ',
    'asin': '\\arcsin',
    'acos': '\\arccos',
    'atan': '\\arctan',
    'sqrt': '\\surd',
    '%': '\\%',
    'permutations': 'P',
    'combinations': 'C', 
  }
  // 遍历 latexMap 的键，并替换 formula 中的对应字符
  for (const key in latexMap) {
    const regex = new RegExp(convert2Reg(key), 'g'); // 创建一个全局的正则表达式
    // @ts-ignore
    formula = formula.replace(regex, latexMap[key]); // 替换字符
  }
  formula = replaceAbsWithPipes(formula);
  formula = replacePower(formula);
  formula = replacePermutationsAndCombinations(formula);
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
              result += "abs(" + replaceAbsWithPipes(expression.slice(start, i)); // 保留 'abs(' 及后面的内容
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
          result += "~\\^~(" + replacePower(expression.slice(start, i)); // 保留 '^(' 及后面的内容
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

// 优化组合数和排列数的显示
function replacePermutationsAndCombinations(str: string) {
  // 正则表达式匹配 P(x,y) 或 C(x,y)，其中 x 和 y 可以是任意字符
  const regex = /P\(([^)]+),([^)]+)\)|C\(([^)]+),([^)]+)\)/g;
  
  // 替换函数，用于替换匹配到的字符串
  // @ts-ignore
  const replaceFunc = (match, p1, m1, c1, m2) => {
      // 根据匹配的组来决定是 P 还是 C
      const type = match.startsWith('P') ? 'P' : 'C';
      // 提取 x 和 y 的值
      const x = p1 || c1;
      const y = m1 || m2;
      // 返回替换后的字符串
      return `${type}_{${x}}^{${y}}`;
  };
  
  // 使用正则表达式和替换函数来替换字符串中的所有匹配项
  return str.replace(regex, replaceFunc);
}
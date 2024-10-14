<template>
    <div>
      <Doc :markdownContent="content"/>
    </div>
  </template>
  
  <script setup lang="ts">
    import Doc from "@/components/Doc.vue";
  
    const content = `
# 个税计算器
[[TOC]]
欢迎使用个税计算器！
个税与每个人都息息相关，是工资中相当大的一笔开支，个税的计算可以帮助您更好实现财务管理。
 
  ## 功能介绍
  该计算器可以根据提供的工资和时间数据，计算出个人五险一金与所得税的总额，以及税后工资。

  该个税计算器分为两个模块：

  - 五险一金：根据工资和**社保、公积金基数**计算每月对应的保险和公积金总额
  - 个人所得税：根据我国的税务收取规则，输入月份和税前工资、专项扣除、计算出当前年已缴税费，待缴税费，从而得到当月应缴税费。
  
  ## 相关指标介绍
  ### 净现值（Net Present Value, NPV）
  - **定义**：净现值是未来现金流的当前价值减去初始投资。
  - **计算公式**：$$ NPV = \\sum_{t=0}^{N} \\frac{C_t}{(1+r)^t} - C_0 $$
    其中，C_t 是第t期的现金流，r是折现率，C_0 是初始投资。
  - **解释**：如果NPV为正，表示投资的回报超过了资本成本，项目可行。如果NPV为负，则项目不可行。

  ### 内部收益率（Internal Rate of Return, IRR）
  - **定义**：内部收益率是使项目净现值等于零的折现率。
  - **计算方法**：求解方程 NPV = 0 的贴现率。
  - **解释**：IRR是投资的预期收益率。如果IRR高于投资者的资本成本或所需最低回报率，项目被认为是可行的。

  ### 盈利指数（Profitability Index, PI）
  - **定义**：盈利指数是未来现金流的现值与初始投资的比率。
  - **计算公式**：$$ PI = \\frac{未来现金流的现值之和}{初始投资} $$
  - **解释**：PI 大于 1 表示每投资一单位货币，可以产生超过一单位的货币的未来价值。PI小于 1 则表示项目不可行。

  ## 示例
  假设一个项目需要初始投资1000美元，未来5年内每年产生现金流500美元，折现率为10%。

  - **NPV计算**：
    $$ NPV = -1000 + \\frac{500}{(1+0.10)^1} + \\frac{500}{(1+0.10)^2} + \\frac{500}{(1+0.10)^3} + \\frac{500}{(1+0.10)^4} + \\frac{500}{(1+0.10)^5} $$
    $$ NPV \\approx -1000 + 454.55 + 412.33 + 373.44 + 337.37 + 304.13 $$
    $$ NPV \\approx 375.82 $$

  - **IRR计算**：求解方程 $$ -1000 + \\frac{500}{(1+r)^1} + \\frac{500}{(1+r)^2} + \\frac{500}{(1+r)^3} + \\frac{500}{(1+r)^4} + \\frac{500}{(1+r)^5} = 0 $$ 的r值。

  - **PI计算**：
    $$ PI = \\frac{454.55 + 412.33 + 373.44 + 337.37 + 304.13}{1000} $$
    $$ PI \\approx 1.8818 $$
  ## 注意事项
  - 确保所有现金流的正负号正确无误，通常现金流入为正，现金流出为负。
  - 在计算IRR时，可能会遇到多个解的情况，需要根据实际情况判断哪个解是合适的。
  - PI是一个相对指标，需要与1进行比较来判断项目的可行性。
  - 在高精度下，内部收益率可能会不准确

 `;
 import * as fs from 'fs';

interface DeductionItem {
  category: string;
  description: string;
  deduction: string;
}

const deductions: DeductionItem[] = [
  {
    category: "子女教育和婴幼儿",
    description: "包括学前教育、学历教育，3岁以下婴幼儿看护",
    deduction: "每个子女2000元/月"
  },
  {
    category: "继续教育",
    description: "本人在学历教育期间，400/月\n本人取得职业资格继续教育证书，3600/年",
    deduction: ""
  },
  {
    category: "首套房贷利息",
    description: "本人或配偶首套房贷款且全部由扣除，1000/月\n本人或配偶首套房贷款，且夫妻平分扣除，500/月",
    deduction: ""
  },
  {
    category: "租房租金",
    description: "直辖市、省会城市、计划单列市及国务院确定的其他城市，1500/月\n市辖区户籍人口超过100万，1100/月\n市辖区户籍人口不超过100万，800/月",
    deduction: ""
  },
  {
    category: "赡养老人",
    description: "60岁以上父母或祖辈\n独生子，3000/年\n非独生子，2个兄弟姐妹，1500/年\n非独生子，3个兄弟姐妹，1000/年\n非独生子，4个兄弟姐妹，750/年\n非独生子，5个兄弟姐妹，600/年",
    deduction: ""
  }
];

// 生成Markdown表格
function generateMarkdownTable(): string {
  let markdown = `# 扣除项\n\n`;

  // 表头
  markdown += `| 类别 | 描述 | 扣除额 |\n`;
  markdown += `| --- | --- | --- |\n`;

  // 表格内容
  deductions.forEach(item => {
    markdown += `| ${item.category} | ${item.description.replace(/\n/g, '<br>')} | ${item.deduction} |\n`;
  });

  return markdown;
}

// 保存Markdown文件
function saveMarkdownToFile(filename: string, content: string) {
  fs.writeFileSync(filename, content, 'utf8');
  console.log(`Markdown 文件已生成: ${filename}`);
}

// 生成并保存表格到Markdown文件
const markdownTable = generateMarkdownTable();
saveMarkdownToFile('deductions_table.md', markdownTable);

  
</script>

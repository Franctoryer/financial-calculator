import { objectToString } from "@/utils/objectToString";

export const translateToChinese = (obj: any): string => {
  let maxLength = 200;
  let chineseTxT =  objectToString(obj);
  const dictionary = {
    'allInterest': '总支付利息',
    'allPmt': '定期支付之和',
    '"interest"': '利率',
    '"isContinueCompound": false': '分期复利',
    '"isContinueCompound": true': '连续复利',
    '"rawData"': '现金流',
    '"cash":': '现金:',
    '"freq":': '频数:',
    '"npv":': '净现值:',
    '"irr"': '内部收益率',
    'null': 'NaN',
    '{': '(',
    '}': ')',
    '"pi":': '盈利指数:',
    '"date":': '时间戳:',
    '"formula":': '',
    '"result":': '',
    'permutations': 'P',
    'combinations': 'C',
    '"': '',
    'objectiveResult': '结果',
    'objective': '计算目标',
    'money:': '金额数:',
    'fromCurrency': '从',
    'toCurrency': '到',
    'resultMoney:': '转化金额数',
    'exchangeRate:': '汇率:'
  }

  for (const item in dictionary) {
    // @ts-ignore
    chineseTxT = chineseTxT.replace(new RegExp(item, 'g'), dictionary[item])
  }

  chineseTxT = chineseTxT.replace(/"order":\d*,/g, '')  // 把序号删了
  if (chineseTxT.length > maxLength) {
    chineseTxT = chineseTxT.slice(0, maxLength) + '……<点击查看详情>';
  }
  return chineseTxT;
} 
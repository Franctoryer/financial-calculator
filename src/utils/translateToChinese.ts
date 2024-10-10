import { objectToString } from "@/utils/objectToString";

export const translateToChinese = (obj: any): string => {
  let maxLength = 200;
  let chineseTxT =  objectToString(obj);
  const dictionary = {
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
    '}': ')'
  }

  for (const item in dictionary) {
    // @ts-ignore
    chineseTxT = chineseTxT.replace(new RegExp(item, 'g'), dictionary[item])
  }

  chineseTxT = chineseTxT.replace(/"order":\d,/g, '')
  if (chineseTxT.length > maxLength) {
    chineseTxT = chineseTxT.slice(0, maxLength) + ' ⍫';
  }
  return chineseTxT;
} 
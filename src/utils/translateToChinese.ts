import { objectToString } from "@/utils/objectToString";

export const translateToChinese = (obj: any): string => {
  let maxLength = 200;
  let chineseTxT =  objectToString(obj);
  const dictionary = {
    'RegionName': '所在地区',
    'order': '序号',
    'interestMethod': '计息方式',
    'Simple': '单利',
    'ContinuousCompound': '连续复利',
    'Compound': '分期复利',
    'allInterest': '总支付利息',
    'allPmt': '定期支付之和',
    '"interest"': '利率',
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
    'exchangeRate:': '汇率:',
    'taxable_income': '应纳税所得额',
    'all_income': '累计税前工资',
    'taxed_income': '税后工资',
    'income: ': '单月税前工资:',
    'SocialInsuranceBase: ': '社保基数:',
    'AccumulationFundBase': '住房公积金基数',
    'OldAgeInsuranceRate': '养老占比百分数',
    'MedicalInsuranceRate': '医疗占比百分数',
    'UnemploymentInsuranceRate': '失业占比百分数',
    'AccumulationFundRate': '公积金占比百分数',
    'all_fiveonetax': '累计五险一金',
    'fiveonetax': '五险一金',
    'OldAgeInsurance': '养老占比金额',
    'MedicalInsurance': '医疗占比金额',
    'UnemploymentInsurance': '失业占比金额',
    'AccumulationFund': '公积金占比金额',
    'all_sidecosts': '累计专项附加扣除',
    'sidecosts': '专项附加扣除',
    'all_othercosts': '累计其他扣除',
    'othercosts': '其他扣除',
    'all_tax_threshold': '累计减除',
    'tax_threshold': '个税起征点',
    'months': '月份',
    'display_taxRate': '税率',
    'current_tax': '当月个税',
    'tax': '累计应纳税额',
    'initialDeposit': '初始储蓄金额',
    'depositCategory': '存款种类',
    'termType': '存款期限',
    'interestRate': '年利率',
    'monthlyInterest': '月利息',
    'finalDeposit': '最终储蓄金额',
    'year': '年',
    'month': '月',
    'day': '日'
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
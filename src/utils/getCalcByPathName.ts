export const getCalcByPathName = (pathName: string): string => {
  const calcMap: { [key: string]: string }  = {
    'base': '科学计算器',
    'invest': '投资/贷款计算器',
    'circled-cashflow': '周期性现金流',
    'customed-cashflow': '不规则现金流',
    'deposit': '储蓄计算器',
    'currency': '货币汇率转化',
    'personal-tax': '个人所得税',
    'fiveone-tax': '五险一金'
  }

  return calcMap[pathName] || "未知";
}
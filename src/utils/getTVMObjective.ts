export const getTVMObjective = (symbol: string): string => {
  const objectiveMap = {
    'PV': '现值',
    'FV': '终值',
    'PMT': '每期付款/收益',
    'N': '期数',
    'I/Y': '贴现率'
  }
  // @ts-ignore
  return objectiveMap[symbol] || '未知'; 
}
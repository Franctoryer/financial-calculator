import type { CustomedCFData } from "@/types/CustomedCFData";

export const NPV = (interest: number, cashFlows: CustomedCFData[]) => {
  // 将现金流数组中的日期转换为年数
  const baseDate = cashFlows[0].date;
  const years = cashFlows.map(cash => {
    const cashDate = cash.date;
    const timeDiff = cashDate - baseDate; // 时间差值，单位是毫秒
    const yearDiff = timeDiff / (1000 * 3600 * 24 * 365.25); // 转换为年
    return yearDiff;
  });

  // 计算净现值
  const npv = cashFlows.reduce((sum, cash, index) => {
    const year = years[index];
    const presentValue = cash.cash / Math.pow(1 + interest, year);
    return sum + presentValue;
  }, 0);

  return npv;
}
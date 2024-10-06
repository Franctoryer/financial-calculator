import { exp, pow } from 'mathjs';

export function NPV(rate: number, cashflows: number[]): number {
    return cashflows.reduce((acc: number, cashflow: number, t: number) => {
        return acc + cashflow / Number(pow(1 + rate, t));
    }, 0);
}

export function continuousCompoundingNPV(rate: number, cashflows: number[]): number {
  return cashflows.reduce((acc: number, cashflow: number, t: number) => {
      // e^(rate * t) 使用 Math.exp()
      return acc + cashflow / exp(rate * t);
  }, 0);
}
// 计算连续单利情况下的 NPV

export function simpleInterestNPV(rate: number, cashflows: number[]): number {
    return cashflows.reduce((acc: number, cashflow: number, t: number) => {
        // 1 + (rate * t) 是单利公式的折现因子
        return acc + cashflow / (1 + rate * t);
    }, 0);
}

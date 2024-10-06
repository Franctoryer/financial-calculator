import { NPV } from './NPV';

// IRR 函数，通过二分法迭代计算
export function IRR(cashflows: number[], guess: number = 0.1): number {
  let lowerRate = 0;
  let upperRate = 1;
  let irr = guess;

  const tolerance = 1e-6;  // 迭代精度
  const maxIterations = 1000;  // 最大迭代次数
  let iteration = 0;

  while (iteration < maxIterations) {
      const npv = NPV(irr, cashflows);

      if (Math.abs(npv) < tolerance) {
          return irr;  // 当 NPV 足够接近 0 时，返回 IRR
      }

      if (npv > 0) {
          lowerRate = irr;  // NPV 为正，说明利率低了
      } else {
          upperRate = irr;  // NPV 为负，说明利率高了
      }

      irr = (lowerRate + upperRate) / 2;  // 取中间值作为新的 IRR 估计值
      iteration++;
  }

  throw new Error('IRR calculation did not converge');
}
// 计算现值(PV)
export function calculatePV(FV: number, PMT: number, IY: number, N: number, isDue: boolean): number {
  const r = IY / 100;
  const adjustment = isDue ? (1 + r) : 1; // 期初付款调整
  const pv = (PMT * (1 - Math.pow(1 + r, -N)) / r) * adjustment + (FV / Math.pow(1 + r, N));
  return -pv; // PV 资金流出，通常为负
}

// 计算终值(FV)
export function calculateFV(PV: number, PMT: number, IY: number, N: number, isDue: boolean): number {
  const r = IY / 100;
  const adjustment = isDue ? (1 + r) : 1; // 期初付款调整
  const fv = PV * Math.pow(1 + r, N) + PMT * ((Math.pow(1 + r, N) - 1) / r) * adjustment;
  return -fv; // FV 资金流入，通常为正
}

// 计算每期支付(PMT)
export function calculatePMT(PV: number, FV: number, IY: number, N: number, isDue: boolean): number {
  const r = IY / 100;
  const adjustment = isDue ? (1 + r) : 1; // 期初付款调整
  const pmt = (PV * r + FV * r / Math.pow(1 + r, N)) / (1 - Math.pow(1 + r, -N)) / adjustment;
  return -pmt; // PMT 通常为负（支付）
}

// 计算每期利率
export function calculateIY(PV: number, FV: number, PMT: number, N: number, isDue: boolean): number {
  // 检查PV和FV的符号是否平衡
  if ((PV > 0 && FV > 0) || (PV < 0 && FV < 0)) {
      console.warn("PV and FV must have opposite signs for correct cash flow.");
      return NaN; // 返回NaN表示资金流动不平衡
  }

  // 当 PMT 为 0 时，单独计算利率
  if (PMT === 0) {
      return (Math.pow(FV / -PV, 1 / N) - 1) * 100;
  }

  // 牛顿迭代法初始猜测
  let guess = 0.1; // 初始猜测
  let r = guess / 100;
  const tolerance = 1e-6;
  let diff = 1;
  const adjustment = isDue ? (1 + r) : 1; // 期初付款调整

  while (Math.abs(diff) > tolerance) {
      const fValue = PV * Math.pow(1 + r, N) + PMT * ((Math.pow(1 + r, N) - 1) / r) * adjustment - FV;
      const fPrime = N * PV * Math.pow(1 + r, N - 1) + PMT * (N * Math.pow(1 + r, N - 1) / r - (Math.pow(1 + r, N) - 1) / (r * r)) * adjustment;
      const newR = r - fValue / fPrime;

      diff = newR - r;
      r = newR;
  }
  return r * 100;
}

// 计算期数(N)
export function calculateN(PV: number, FV: number, PMT: number, IY: number, isDue: boolean): number {
  const r = IY / 100;
  const adjustment = isDue ? (1 + r) : 1; // 期初付款调整

  if (PMT === 0) {
      // 如果每期支付是0，直接根据现值和终值计算
      return Math.log(FV / PV) / Math.log(1 + r);
  } else {
      // 根据现值、终值和每期支付计算期数
      return Math.log((PMT * adjustment / r + FV) / (PMT * adjustment / r + PV)) / Math.log(1 + r);
  }
}
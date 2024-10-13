import { calculatePV, calculateFV, calculatePMT, calculateN, calculateIY } from "@/utils/TVM";
import { test, expect } from "vitest";


test("TVM-PV", () => {
  expect(calculatePV(0, 1000, 20, 3, true).toFixed(2)).toBe("-2527.78");
  expect(calculatePV(0, 1000, 20, 3, false).toFixed(2)).toBe("-2106.48");
  expect(calculatePV(10000, 1000, 20, 3, false).toFixed(2)).toBe("-7893.52");
  expect(calculatePV(0, -1000, 20, 3, false).toFixed(2)).toBe("2106.48");
})

test("TVM-FV", () => {
  expect(calculateFV(1000, 0, 20, 3, false).toFixed(2)).toBe("-1728.00");
  expect(calculateFV(1000, 0, 20, 3, true).toFixed(2)).toBe("-1728.00");
})

test("TVM-PMT", () => {
  expect(calculatePMT(20000, 0, 10, 12, false).toFixed(2)).toBe("-2935.27");
  expect(calculatePMT(-20000, 50000, 10, 12, false).toFixed(2)).toBe("597.10");
  expect(calculatePMT(-20000, 100000, 10, 12, false).toFixed(2)).toBe("-1741.07");
})

test("TVM-N", () => {
  expect(calculateN(10000, 0, -1000, 10, false).toFixed(2)).toBe("NaN");  // 每期还款比利息还低
  expect(calculateN(10000, 0, -2000, 10, false).toFixed(2)).toBe("7.27");  // 每期还款比利息还低
})

test("TVM-I/Y", () => {
  expect(calculateIY(-1000, 1728, 0, 3, false).toFixed(2)).toBe("20.00");
  expect(calculateIY(1000, 1728, 0, 3, false).toFixed(2)).toBe("NaN");  // 现金流不平衡
})
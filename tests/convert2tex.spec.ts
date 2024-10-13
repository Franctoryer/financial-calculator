import { convert2tex } from "@/utils/convert2tex";
import { test, expect } from "vitest"

// 测试 `^(` 的转化是否正常
test("convert2tex-power", () => {
  expect(convert2tex("2^(")).toBe("2~\\^~(")
  expect(convert2tex("2^(3)")).toBe("2^{3}")
  expect(convert2tex("2^(3^(5^(9)")).toBe("2~\\^~(3~\\^~(5^{9}")
})

// 测试 `abs(` 的转化是否正常
test("convert2tex-abs", () => {
  expect(convert2tex("abs(-221")).toBe("abs(-221")
  expect(convert2tex("abs(-221)")).toBe("|-221|")
  expect(convert2tex("abs(abs(-22)")).toBe("abs(|-22|")
  expect(convert2tex("abs(119+abs(-22)")).toBe("abs(119+|-22|")
})
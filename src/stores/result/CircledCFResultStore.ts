import { defineStore } from "pinia";

// 周期性现金流的计算结果状态变量
export const useCircledCFResultStore = defineStore('CircledCFResultStore', {
  state: () => ({
    npv: 0 as number,
    irr: 0 as number,
    pi: 0 as number
  }),
  persist: {
    storage: sessionStorage
  }
});
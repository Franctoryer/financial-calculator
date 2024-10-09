import { defineStore } from "pinia";

// 周期性现金流的计算结果状态变量
export const useCircledCFResultStore = defineStore('CircledCFResultStore', {
  state: () => ({
    npv: 0 as number | string,
    irr: 0 as number | string,
  }),
  persist: {
    storage: sessionStorage
  }
});
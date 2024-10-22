import { defineStore } from 'pinia';
import type { CCFRowDataRaw } from "@/types/CCFData";

// 周期性现金流的计算输入状态变量
export const useCircledCFInputStore = defineStore('CircledCFInputStore', {
  state: () => ({
    interest: 0.2,
    interestMethod: 'Compound',
    CCFRawData: [
      {
        order: 1,
        cash: 1000,
        freq: 1
      }
    ] as CCFRowDataRaw[],
  }),
  persist: {
    storage: sessionStorage,
  },
});
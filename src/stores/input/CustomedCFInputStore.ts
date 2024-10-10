import { defineStore } from "pinia";
import type { CustomedCFData } from "@/types/CustomedCFData";

// 自定义现金流的输入状态
export const useCustomedCFInputStore = defineStore('CustomedCFInputStore', {
  state: () => ({
    interest: 0.2,
    isContinueCompound: false,
    rawData: [{
      date: Date.now(),
      cash: 1000
    }] as CustomedCFData[],
  }),
  persist: {
    storage: sessionStorage
  }
});
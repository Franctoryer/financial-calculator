import { defineStore } from "pinia";
import type { HistoryData } from "@/types/HistoryData";

// 用于存储用户计算的历史记录
export const useHistoryStore = defineStore('historyStore', {
  state: () => ({
    historyData: [] as HistoryData[]
  }),
  actions: {
    addHistory(history: HistoryData) {
      this.historyData.unshift(history);
    },
    deleteAllHistory() {
      this.historyData = [];
    },
    deleteOneHistory(idx: number) {
      this.historyData.splice(idx, 1);
    }
  },
  persist: true
})
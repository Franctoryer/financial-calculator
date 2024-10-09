import { defineStore } from "pinia";
import type { HistoryData } from "@/types/HistoryData";

// 用于存储用户计算的历史记录
export const useHistoryStore = defineStore('historyStore', {
  state: () => ({
    historyData: [] as HistoryData[]
  }),
  getters: {
    reservedHistoryData: (state) => state.historyData.reverse()
  },
  actions: {
    addHistory(history: HistoryData) {
      this.historyData.push(history);
    },
    deleteAllHistory() {
      this.historyData = [];
    }
  },
  persist: true
})
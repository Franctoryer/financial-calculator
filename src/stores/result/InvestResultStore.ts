import { defineStore } from "pinia";

export const useInvestResultStore = defineStore("InvestResultStore", {
  state: () => ({
    objectiveResult: 0,
    allInterest: 0,
    allPmt: 0
  }),
  persist: {
    storage: sessionStorage,
  }
})
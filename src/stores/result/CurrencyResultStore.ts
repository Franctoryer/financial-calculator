import { defineStore } from "pinia";

export const useCurrencyResultStore = defineStore("CurrencyResultStore", {
  state: () => ({
    resultMoney: 0,
    exchangeRate: 1,
  }),
  persist: {
    storage: sessionStorage
  }
})
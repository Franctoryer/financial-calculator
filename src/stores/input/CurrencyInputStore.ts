import { defineStore } from "pinia";

export const useCurrencyInputStore = defineStore("CurrencyInputStore", {
  state: () => ({
    money: 1,
    fromCurrency: "CNY",
    toCurrency: "USD"
  }),
  persist: {
    storage: sessionStorage
  }
})
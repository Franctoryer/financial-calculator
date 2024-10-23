import { defineStore } from "pinia";

export const useCurrencyInputStore = defineStore("CurrencyInputStore", {
  state: () => ({
    money: 1,
    fromCurrency: "CNY" as string | null,
    toCurrency: "USD" as string | null
  }),
  persist: {
    storage: sessionStorage
  }
})
import { defineStore } from "pinia";

export const usePersonalTaxResultStore = defineStore('PersonalTaxResultStore', {
    state: () => ({
        all_income: 3000,
        all_fiveonetax: 0,
        all_sidecosts: 0,
        all_othercosts: 0,
        all_tax_threshold: 5000,
    }),
    persist: {
      storage: sessionStorage,
    },
  });
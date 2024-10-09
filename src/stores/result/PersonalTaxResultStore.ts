import { defineStore } from "pinia";

export const usePersonalTaxResultStore = defineStore('PersonalTaxResultStore', {
    state: () => ({
        all_income: 15000,
        all_fiveonetax: 0,
        all_sidecosts: 0,
        all_othercosts: 0,
    }),
    persist: {
      storage: sessionStorage,
    },
  });
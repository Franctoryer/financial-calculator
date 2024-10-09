import { defineStore } from 'pinia';

export const usePersonalTaxInputStore = defineStore('PersonalTaxInputStore', {
    state: () => ({
        months: 0,
        income: 3000,
        fiveonetax: 0,
        sidecosts: 0,
        othercosts: 0,
    }),
    persist: {
      storage: sessionStorage,
    },
  });
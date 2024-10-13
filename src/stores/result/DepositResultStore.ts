import { defineStore } from 'pinia';

export const useDepositResultStore = defineStore('DepositResultStore', {
    state: () => ({
        interestRate:0,
        interest:0,
        termMonths:0,
        monthlyInterest:0,
    }),
    persist: {
      storage: sessionStorage,
    },
  });
import { defineStore } from 'pinia';

export const useDepositInputStore = defineStore('DepositInputStore', {
    state: () => ({
        initialDeposit:0,
        depositCategory:'',
        termType:'',
        interestRate:0,
        interest:0,
        finalDeposit:0,
    }),
    persist: {
      storage: sessionStorage,
    },
  });

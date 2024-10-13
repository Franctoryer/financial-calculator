import { defineStore } from 'pinia';

export const useDepositInputStore = defineStore('DepositInputStore', {
    state: () => ({
        initialDeposit:0,
        depositCategory:'选择存款方式',
        termType:'选择存款期限',
        interestRate:0,
        interest:0,
        finalDeposit:0,
        year:0,
        month:0,
        day:0,
        termMonths:0,
        monthlyInterest:0,
    }),
    persist: {
      storage: sessionStorage,
    },
  });

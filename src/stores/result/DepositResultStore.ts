import { defineStore } from 'pinia';

export const useDepositResultStore = defineStore('DepositResultStore', {
    state: () => ({
        interestRate:0, // 年利率
        interest:0,     // 总利息
        termMonths:0, 
        monthlyInterest:0, // 每月利息
        finalDeposit:0  // 最终储蓄金额
    }),
    persist: {
      storage: sessionStorage,
    },
  });
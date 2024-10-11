import { defineStore } from 'pinia';

export const useFiveOneTaxInputStore = defineStore('FiveOneTaxInputStore', {
    state: () => ({
        SocialInsuranceBase: 3000,
        AccumulationFundBase: 3000,
        OldAgeInsuranceRate: 8,
        OldAgeInsurance: 0,
        MedicalInsuranceRate: 2,
        MedicalInsurance: 0,
        UnemploymentInsuranceRate: 0.5,
        UnemploymentInsurance: 0,
        AccumulationFundRate: 7,
        AccumulationFund: 0,
    }),
    persist: {
      storage: sessionStorage,
    },
  });
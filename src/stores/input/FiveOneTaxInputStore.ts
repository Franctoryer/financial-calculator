import { defineStore } from 'pinia';

export const useFiveOneTaxInputStore = defineStore('FiveOneTaxInputStore', {
    state: () => ({
        SocialInsuranceBase: 0,
        AccumulationFundBase: 0,
        OldAgeInsuranceRate: 0,
        OldAgeInsurance: 0,
        MedicalInsuranceRate: 0,
        MedicalInsurance: 0,
        UnemploymentInsuranceRate: 0,
        UnemploymentInsurance: 0,
        AccumulationFundRate: 0,
        AccumulationFund: 0,
    }),
    persist: {
      storage: sessionStorage,
    },
  });
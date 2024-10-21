import { defineStore } from 'pinia';

export const useFiveOneTaxInputStore = defineStore('FiveOneTaxInputStore', {
    state: () => ({
        SocialInsuranceBase: 3000,
        AccumulationFundBase: 3000,
        OldAgeInsuranceRate: 8,
        MedicalInsuranceRate: 2,
        UnemploymentInsuranceRate: 0.5,
        AccumulationFundRate: 7,
        RegionName:'请选择地区',
    }),
    persist: {
      storage: sessionStorage,
    },
  });
import { defineStore } from "pinia";

export const useFiveOneTaxResultStore = defineStore('FiveOneTaxResultStore', {
    state: () => ({
      fiveonetax: 0,
      OldAgeInsurance: 0,
      MedicalInsurance: 0,
      UnemploymentInsurance: 0,
      AccumulationFund: 0,
    }),
    persist: {
      storage: sessionStorage,
    },
  });
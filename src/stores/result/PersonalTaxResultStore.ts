import { defineStore } from "pinia";

export const usePersonalTaxResultStore = defineStore('PersonalTaxResultStore', {
    state: () => ({
        all_income: 3000,
        all_fiveonetax: 0,
        all_sidecosts: 0,
        all_othercosts: 0,
        all_tax_threshold: 5000,
        taxable_income: 0,
        taxRate: 0,
        display_taxRate: 0,
        quickDeduction: 0,
        lastweek_taxable_income: 0,
        lastweek_taxRate: 0,
        lastweek_quickDeduction: 0,
        tax: 0,
        lastweek_tax: 0,
        current_tax: 0,
        taxed_income: 0,
    }),
    persist: {
      storage: sessionStorage,
    },
  });
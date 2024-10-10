import { defineStore } from 'pinia';
import type { PTInput } from "@/types/PTData";
export const usePersonalTaxInputStore = defineStore('PersonalTaxInputStore', {
    state: () => ({
        months: 1,
        income: 3000,
        fiveonetax: 0,
        sidecosts: 0,
        othercosts: 0,
        tax_threshold: 5000,
        PTInputData: [
            {
                months: 1,
                income: 3000,
                fiveonetax: 0,
                sidecosts: 0,
                othercosts: 0,
            }
          ] as PTInput[],
    }),
    persist: {
      storage: sessionStorage,
    },
  });
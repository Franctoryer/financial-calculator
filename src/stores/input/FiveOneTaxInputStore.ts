import { defineStore } from 'pinia';

export const useFiveOneTaxInputStore = defineStore('FiveOneTaxInputStore', {
    state: () => ({
        
    }),
    persist: {
      storage: sessionStorage,
    },
  });
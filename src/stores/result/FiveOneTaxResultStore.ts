import { defineStore } from "pinia";

export const useFiveOneTaxResultStore = defineStore('FiveOneTaxResultStore', {
    state: () => ({
        fiveonetax: 0,
    }),
    persist: {
      storage: sessionStorage,
    },
  });
import { defineStore } from "pinia";

export const useResultStore = defineStore('resultStore', {
  state: () => ({
    npv: 0 as number | string,
    irr: 0 as number | string,
  }),
  persist: {
    storage: sessionStorage
  }
});
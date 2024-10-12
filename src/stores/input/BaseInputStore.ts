import { defineStore } from "pinia";

export const useBaseInputStore = defineStore('BaseInputStore', {
  state: () => ({
    formula: ''
  }),
  persist: {
    storage: sessionStorage,
  }
})
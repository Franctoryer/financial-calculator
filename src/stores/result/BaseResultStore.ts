import { defineStore } from "pinia";

export const useBaseResultStore = defineStore('BaseResultStore', {
  state: () => ({
    result: ''
  }),
  persist: {
    storage: sessionStorage,
  }
})
import { defineStore } from "pinia";

export const useBaseCalcStore = defineStore('BaseCalcStore', {
  state: () => ({
    isKey: false,
    isAngle: true,
  }),
  persist: true
})
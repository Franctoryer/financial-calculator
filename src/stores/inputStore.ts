import { defineStore } from 'pinia';
import type { CCFRowDataRaw } from "@/types/CCFData";

export const useInputStore = defineStore('inputStore', {
  state: () => ({
    CCFRawData: [
      {
        order: 1,
        cash: 1000,
        freq: 1
      }
    ] as CCFRowDataRaw[]
  }),
  persist: {
    storage: sessionStorage,
  },
});
import { defineStore } from "pinia";
import { getTVMObjective } from "@/utils/getTVMObjective";


export const useInvestInputStore = defineStore('InvestInputStore', {
  state: () => ({
    objective: 'PV',
    PV: 0 as number | null,
    FV: 0 as number | null,
    PMT: 0 as number | null,
    I_Y: 15 as number | null,
    N: 15 as number | null
  }),
  getters: {
    objectiveText: (state) => getTVMObjective(state.objective)
  },
  persist: {
    storage: sessionStorage
  }
})
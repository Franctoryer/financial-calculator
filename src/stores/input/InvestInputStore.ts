import { defineStore } from "pinia";
import { getTVMObjective } from "@/utils/getTVMObjective";


export const useInvestInputStore = defineStore('InvestInputStore', {
  state: () => ({
    objective: 'PV',
    PV: null as number | null,
    FV: null as number | null,
    PMT: null as number | null,
    I_Y: null as number | null,
    N: null as number | null
  }),
  getters: {
    objectiveText: (state) => getTVMObjective(state.objective)
  },
  persist: {
    storage: sessionStorage
  }
})
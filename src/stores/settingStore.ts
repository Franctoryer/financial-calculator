import { defineStore } from 'pinia';
import { getCurrencySymbol } from "@/utils/getCurrencyFlag";
import { getTimeUnitText } from "@/utils/getTimeUnitText";


export const useSettingStore = defineStore('settingStore', {
  state: () => ({
    timeMode: 'END',
    precision: 2,
    currencyType: 'CNY' as string | null,
    timeUnit: 'year',
    isDisplayInfo: true,
    isQkDocLkup: true,  // 快速文档查找
    isBarrierFree: false,
  }),
  getters: {
    // @ts-ignore
    currencySymbol: (state) => getCurrencySymbol(state.currencyType),
    // @ts-ignore
    timeUnitText: (state) => getTimeUnitText(state.timeUnit),
    // @ts-ignore
    isCompound: (state) => state.interestMethod === 'compound'
  },
  persist: true,
  actions: {
    storeDefault() {
      this.timeMode = 'END';
      this.precision = 2;
      this.currencyType = 'CNY';
      this.timeUnit = 'year';
      this.isDisplayInfo = true;
      this.isQkDocLkup = true;
      this.isBarrierFree = false;
    }
  }
});
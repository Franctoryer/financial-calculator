import { defineStore } from 'pinia';
import { getCurrencySymbol } from "@/utils/getCurrencyFlag";
import { getTimeUnitText } from "@/utils/getTimeUnitText";


export const useSettingStore = defineStore('settingStore', {
  state: () => ({
    interestMethod: 'compound',
    timeMode: 'END',
    precision: 2,
    currencyType: 'CNY',
    timeUnit: 'year',
    isDisplayInfo: true,
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
      this.interestMethod = 'compound';
      this.timeMode = 'END';
      this.precision = 2;
      this.currencyType = 'CNY';
      this.timeUnit = 'year';
      this.isDisplayInfo = true;
    }
  }
});
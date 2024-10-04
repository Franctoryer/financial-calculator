import { defineStore } from 'pinia';
import { getCurrencySymbol } from "@/utils/getCurrencyFlag";
import { getTimeUnitText } from "@/utils/getTimeUnitText";

export const useSettingStore = defineStore('settingStore', {
  state: () => ({
    interestMethod: 'compound',
    precision: 4,
    currencyType: 'CNY',
    timeUnit: 'year'
  }),
  getters: {
    currencySymbol: (state) => getCurrencySymbol(state.currencyType),
    timeUnitText: (state) => getTimeUnitText(state.timeUnit)
  }
});
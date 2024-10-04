import { defineStore } from 'pinia';

export const useSettingStore = defineStore('settingStore', {
  state: () => ({
    interestMethod: 'compound',
    precision: 4,
    currencyType: 'CNY',
    timeUnit: 'year'
  })
});
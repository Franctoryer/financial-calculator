import { defineStore } from "pinia";

export const useThemeStore = defineStore('ThemeStore', {
  state: () => ({
    themeClass: 'light-theme',
  }),
  persist: true
});

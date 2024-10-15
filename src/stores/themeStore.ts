import { defineStore } from "pinia";

// 持久化用户的主题喜好
export const useThemeStore = defineStore('ThemeStore', {
  state: () => ({
    isDark: false
  }),
  getters: {
    themeClass: (state) => state.isDark ? 'dark-theme' : 'light-theme',
  },
  persist: true
});

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from '@/router'               

const pinia = createPinia();
const app = createApp(App);
pinia.use(piniaPluginPersistedstate)
app
  .use(router)
  .use(pinia)
  .mount('#app')
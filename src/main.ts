import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from '@/router'
//primevue
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/saga-blue/theme.css'; 
import 'primevue/resources/primevue.min.css';           
import 'primeicons/primeicons.css';                     
import 'primeflex/primeflex.css';                  

const pinia = createPinia();
const app = createApp(App);
pinia.use(piniaPluginPersistedstate)
app
  .use(router)
  .use(pinia)
  .use(PrimeVue)
  .mount('#app')
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from '@/router'
//primevue
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/saga-blue/theme.css'; 
import 'primevue/resources/primevue.min.css';           
import 'primeicons/primeicons.css';                     
import 'primeflex/primeflex.css';                  
//mathjax     
import MathJax from 'mathjax/es5/tex-mml-chtml.js';

const pinia = createPinia();
const app = createApp(App);
app
  .use(router)
  .use(pinia)
  .use(PrimeVue)
  .mount('#app')
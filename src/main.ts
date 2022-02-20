import { createRouter, createWebHistory } from 'vue-router';
import routes from 'voie-pages';
import './assets/main.css';

const router = createRouter({
    history: createWebHistory(),
    routes
});


import { createApp } from 'vue'
import App from './App.vue'

createApp(App).use(router).mount('#app')

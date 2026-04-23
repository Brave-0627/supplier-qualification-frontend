import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SupplierView from '@/views/SupplierView.vue'
import AdminView from '@/views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/supplier', name: 'supplier', component: SupplierView },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router

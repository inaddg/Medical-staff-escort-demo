import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// main.ts

// 在 main.js 中添加（只引入 ElMessage 样式，体积更小）
import 'element-plus/es/components/message/style/css'
// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入panelhead组件
import PanelHead from '@/components/panelHead.vue'

import { useMenuStore } from './stores/menuStore'
const storageStore = localStorage.getItem('v3pz')

// 路由导航守卫
router.beforeEach((to ) => {
  const token = localStorage.getItem('pz_token')
  // 非登陆页面token不存在，跳转到登录页
  if (to.path !== '/login' && !token) {
    return '/login'
  }
  // 登录页面存在token，跳转到首页
  else if (to.path === '/login' && token) {
    return '/'
  } else {
    return true
  }
});

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 3. 挂载Pinia（替换原app.use(store)）
app.use(pinia)

//刷新后的动态路由重新添加
if (storageStore) {
  const menuStore = useMenuStore()
  menuStore.dynamicMenu(JSON.parse(storageStore).routerList)
  menuStore.routerList.forEach(item => {
    router.addRoute("main", item)
  })
}

app.mount('#app')

// 全局注册panelhead组件
app.component('PanelHead', PanelHead)

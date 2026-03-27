import { createApp } from 'vue'
//import './style.css'
import App from './App.vue'
import router from './router'
import api from './api'
import { Notify } from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)

// 挂载api,在实例上绑定属性,这样在组件中就可以通过this.$api来访问api中的方法了
app.config.globalProperties.$api = api 

// 路由守卫  
router.beforeEach((to, from) => {
  //如果未登录
  if (to.path !== 'login') {
    if (localStorage.getItem('h5_token') == null) { //判断token是否存在
      return '/login'
    }
  }
})

// 路由挂载
app.use(router)
// 注册Vant Notify组件
app.use(Notify)

app.mount('#app')


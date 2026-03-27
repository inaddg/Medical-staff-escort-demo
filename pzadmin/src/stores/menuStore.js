import { defineStore } from 'pinia'

// 定义并导出Menu Store（Pinia的核心是defineStore，第一个参数为唯一ID）
export const useMenuStore = defineStore('menu', {
  // 状态（替代Vuex的state，返回函数避免单例问题）
  state: () => ({
    isCollapse: false, // 是否折叠菜单
    selectMenu: [], // 存储已打开的菜单
    routerList: [], // 存储路由列表
    menuActive: '1-1' // 存储激活菜单
  }),

  // 持久化配置（替代vuex-persistedstate）
  persist: {
    key: 'v3pz', // 与原Vuex的key保持一致
    storage: window.localStorage, // 存储到localStorage
    paths: ['isCollapse', 'selectMenu', 'routerList', 'menuActive'] // 可选：指定要持久化的字段
  },

  // 方法（替代Vuex的mutations，支持同步/异步，可直接修改state）
  actions: {
    // 折叠菜单（对应原mutations的collapseMenu）
    collapseMenu() {
      this.isCollapse = !this.isCollapse
    },

    // 添加菜单（对应原mutations的addMenu）
    addMenu(payload) {
      // 对数据进行去重
      if (this.selectMenu.findIndex(item => item.path === payload.path) === -1) { // 等于-1 => 不存在
        this.selectMenu.push(payload)
      }
    },

    // 更新激活菜单（对应原mutations的updateMenuActive）
    updateMenuActive(value) {
      this.menuActive = value
    },

    // 关闭菜单（对应原mutations的closeMenu）
    closeMenu(item) {
      const index = this.selectMenu.findIndex(val => val.name === item.name)
      // 通过索引删除数组指定元素（arr.splice(index, 1)）
      // arr.splice(1, 0, 6, 7):从索引 1 开始，不删除元素，插入 6、7:
      // arr.splice(1, 0, 6, 7)
      // console.log(index);
      this.selectMenu.splice(index, 1)
    },

    // 动态生成路由（对应原mutations的dynamicMenu）
    dynamicMenu(payload) {
      // 通过glob导入文件 => 动态导入指定目录下的所有.vue文件
      const modules = import.meta.glob('../views/**/**/*.vue')
      function routerSet(router) {
        router.forEach(route => {
          // 如果没有子路由（说明它是一个最终页面），则拼接路由数据
          if (!route.children) {
            // meta => 路由元信息，path => 路由路径
            const url = `../views${route.meta.path}/${route.name}index.vue`
            //去 “文件通讯录” modules 里找到这个文件，把它绑定给这条路由
            route.component = modules[url]
          } else {
            // 如果这条路由有子菜单（else），就递归调用自己，去处理它的子菜单，直到所有层级的路由都绑定好页面
            routerSet(route.children)
          }
        })
      }
      //把后端传来的原始菜单数据（payload）丢给上面那个 “递归处理工具”，让它给所有路由都配上对应的页面文件。
      routerSet(payload)
      // 把处理好的路由数据，存到routerList里
      this.routerList = payload
    }
  }
})

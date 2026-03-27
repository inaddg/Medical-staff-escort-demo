<template>
  <el-menu
    :style="{ width: !isCollapse ? '230px' : '64px' }"
    active-text-color="#ffd04b"
    background-color="#545c64"
    class="aside-container"
    text-color="#fff"
    :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose"
    :default-active="active"
      >
      <p class="logo-lg">{{ isCollapse ? "DIDI" : "DIDI陪诊" }}</p>

      <!-- 通过父子组件通信把menuData数据传到子组件 -->
      <TreeMenu :index="1" :menuData="menuData" />
  </el-menu>
</template>

<script setup>
import TreeMenu from '@/components/treeMenu.vue';
// 通过vue-router获取当前路由数据
import { useRouter } from 'vue-router'
//import { ref } from 'vue'

import { computed } from "vue";
import { useMenuStore } from '@/stores/menuStore'
const menuStore = useMenuStore()
// 替换折叠状态访问：store.state.menu.isCollapse → menuStore.isCollapse
const isCollapse = computed(() => menuStore.isCollapse);

// 获取当前路由数据
const active = computed(() => menuStore.menuActive);

const router = useRouter() //调用，获取当前路由实例
//const menuData = ref(router.options.routes[0].children) //获取当前路由数据
const menuData = computed(() => menuStore.routerList);
 console.log(router);


const handleOpen = () => { }
const handleClose = () => {}
</script>

<style lang="less" scoped>
.aside-container {
  height: 100%;
  .logo-lg {
    text-align: center;
    height: 50px;
    color: #fff;
    font-size: 20px;
    line-height: 50px;
  }
}
</style>

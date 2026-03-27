<template>

  <template v-for="(item, index) in props.menuData">
        <!-- 遍历数据 -->
        <!-- 1.如果没有子菜单（也就是数据中没有children） -->
    <el-menu-item
      @click="handleClick(item, `${props.index}-${item.meta.id}`)"
      v-if="!item.children || item.children.length == 0"
      :index="`${props.index}-${item.meta.id}`"
      :key="`${props.index}-${item.meta.id}`"
      >
      <el-icon size="20">
        <!-- 动态组件 -->
         <component :is="item.meta.icon" />
      </el-icon>
      <span>{{ item.meta.name }}</span>
    </el-menu-item>

        <!-- 2.有子菜单 -->
    <el-sub-menu
      v-else
      :index="`${props.index}-${item.meta.id}`"
      :key="index + 1"
      >
      <template #title>
        <el-icon>
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta.name }}</span>
      </template>

      <!-- 有子菜单下面的 需要渲染的内容  -->
       <!-- 递归组件：保证当前组件名称==下面所要写的组件 -->
      <tree-menu
        :menuData="item.children"
        :index="`${props.index}-${item.meta.id}`"
       />
    </el-sub-menu>
  </template>

</template>

<script setup>
import { useRouter } from 'vue-router'
// 1. 移除Vuex的useStore引入
import { useMenuStore } from '@/stores/menuStore'

// 2. 替换Vuex store实例为Pinia的menuStore实例
// const store = useStore()
const menuStore = useMenuStore()
// 子组件获取数据
const props = defineProps(['menuData', 'index'])
// console.log(props);

// 点击菜单事件( active索引值 )
const router = useRouter() // 创建router路由实例
const handleClick = (item, active) => {
  // console.log(item,'item');

 // 3. 替换Vuex的commit调用为Pinia的actions方法
  // store.commit('addMenu', item.meta)
  menuStore.addMenu(item.meta)

  menuStore.updateMenuActive(active)

  router.push(item.meta.path)
}
</script>

<style lang="scss" scoped>
</style>

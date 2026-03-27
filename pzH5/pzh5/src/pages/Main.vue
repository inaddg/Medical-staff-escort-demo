<template>
  <div>

  </div>

  <router-view />
  <!-- 底部导航栏 -->
  <van-tabbar v-model="active">
    <van-tabbar-item 
      v-for="item in router.options.routes[0].children" :key="item.path" 
      :icon="item.meta.icon"
      :url="`#/${item.path}`"
      >
      {{ item.meta.name }}
    </van-tabbar-item> 
  </van-tabbar>

</template>
<script setup>
import { ref, onMounted } from 'vue';
// useRouter 用来获取路由实例，useRoute 用来获取当前路由对象
import { useRouter, useRoute } from 'vue-router';

const active = ref(0);

const router = useRouter();
const route = useRoute(); // 当前路由对象
onMounted(() => {
  const data = router.options.routes[0]
  // findIndex遍历数组，找到与当前路由路径匹配的项，并返回其索引，如果没有找到匹配项，则返回-1
  active.value = data.children.findIndex(item => '/' + item.path === route.path)
})
</script> 
<template>
  <div class="common-layout">
    <el-container>
<!-- <el-aside width="200px">Aside</el-aside> -->
      <Aside />
      <el-container>
        <!-- <el-header>Header</el-header> -->
        <el-header>
          <Header />
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup>
  import Aside from '@/components/indexAside.vue'
  import Header from '@/components/navHeader.vue'
</script>
<!-- main中样式我自己稍微修改了一下 -->
<style lang="less" scoped>
.common-layout {
  background-color: #f5f7fa;
  font-family: soft;
  height: 100vh;
  .el-container {
    height: 100%;
    .el-header {
      padding: 0;
    }
  }
}
</style>

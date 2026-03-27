<template>
  <div class="header-container">
    <div class="header-left flex-box" >
      <el-icon class="icon" size="23" @click="handleCollapse"><Fold /></el-icon>
      <ul class="flex-box">
        <li
          v-for="(item, index) in selectMenu"
          :key="item.path"
          :class="{ selected : route.path == item.path}"
          class="tab flex-box">
          <el-icon size="16"><component :is="item.icon" /></el-icon>
          <router-link class=" text flex-box" :to="{ path: item.path }">
            {{ item.name }}
          </router-link>

          <el-icon size="16" class="close" @click="closeTab(item, index)"><Close /></el-icon>
        </li>
      </ul>
    </div>
    <div class="header-right">
      <el-dropdown @command="handleClick">
        <div class="el-dropdown-link flex-box">
          <el-avatar
            :src="userInfo.avatar"
          />
          <p class="user-name">{{ userInfo.name }}</p>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="cancel">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
    </el-dropdown>
    </div>
  </div>
</template>

<script setup>
  //原：import { useStore } from 'vuex'
import router from '@/router';
import { useMenuStore } from '@/stores/menuStore'
import { computed } from "vue";
import { useRoute } from 'vue-router' //当前路由对象

const route = useRoute() // 获取当前路由对象

// 获取store实例,代替：const store = useStore()
const menuStore = useMenuStore()
 // 调用折叠菜单方法（替代this.$store.commit('collapseMenu')）
const handleCollapse = () => {
  menuStore.collapseMenu()
}

// 3. 替换状态访问：store.state.menu.selectMenu → menuStore.selectMenu
const selectMenu = computed(() => menuStore.selectMenu);
// 访问状态（替代this.$store.state.menu.isCollapse）
// console.log('菜单折叠状态：', menuStore.isCollapse)

// 获取用户信息
const userInfo = JSON.parse(localStorage.getItem('pz_userInfo'))

// 点击关闭标签页
const closeTab = (item, index) => {
  // 4. 替换commit调用为Pinia的actions方法
  // store.commit("closeMenu", item);
  menuStore.closeMenu(item);
  // 删除非当前页tag
  if (route.path !== item.path) {
    return;
  }
  const selectMenuData = selectMenu.value

  // 删除的是最后一项
  if (index === selectMenuData.length ) {
    // 如果tag只有一个元素
    if (!selectMenuData.length) {
      router.push('/')
    } else { // 删除最后一项后，跳转到前一项
      router.push({
          path: selectMenuData[index - 1].path
        })
      }
    }
    // 删除的不是最后一项 是中间位置tag
    else {
    router.push({
        path: selectMenuData[index].path
      })
    }
}

// 处理下拉菜单点击事件
const handleClick = (command) => {
  if (command === 'cancel') {
    // 退出登录 清除token和用户信息
    localStorage.removeItem('pz_token')
    localStorage.removeItem('pz_userInfo')
    localStorage.removeItem('v3pz')
    // 跳转到网站的登录地址（可以用路由跳转代替）
    window.location.href = window.location.origin
  }
}
</script>

<style lang="less" scoped>
  .flex-box{
    display: flex;
    align-items: center;
    height: 100%;
  }
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  background-color: #fff;
  padding-right: 25px;
  // 添加阴影
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
.header-left {
  height: 100%;
  .icon{
      width: 45px;
      height: 100%;
    }
    .icon:hover{
      background-color: #f5f5f5;
      cursor: pointer;;
    }
    .tab {
      height: 100%;
      padding: 0 10px;
      .text {
        margin: 0 5px;
      }
      .close {
        visibility: hidden;
      }
      // &.selected表示 “当前元素同时拥有selected类时” 的样式（这里的&是 当前写样式的这个父元素 ）
      &.selected {
        a {
          color: #409eff;
        }
        i {
          color: #409eff;
        }
        background-color: #f5f5f5;
      }
    }
    .tab:hover {
      background-color: #f5f5f5;
      .close {
        visibility: inherit; // 显示关闭按钮
        cursor: pointer;
        color: #000;
      }
    }
  }
  .header-right {
    .user-name {
      margin-left: 10px;
    }
  }
  a {
    height: 100%;
    color: #333;
    font-size: 15px;
   }
}
</style>

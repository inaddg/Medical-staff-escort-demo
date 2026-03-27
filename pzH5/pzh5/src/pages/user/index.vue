<template>
  <div class="container">
    <!-- 用户图片＋用户名 -->
    <div class="user">
      <van-image class="img" width="100" height="100" :src="userInfo.avatar" />
      <div class="text">{{ userInfo.name }}</div>
    </div>

    <!-- 我的订单 -->
    <div class="order">
      <!-- 顶部 -->
      <div class="top">
        <div class="text1">我的订单</div>
        <div class="text2">全部</div>
      </div>
      <!-- 图标1 -->
      <div class="buttom">
        <div class="item">
          <van-image
            @click="goOrder(1)"
            width="40"
            height="40"
            src="/h5_images/od_10.png"
          />
          <div>待支付</div>
        </div>
        <!-- 图标2 -->
        <div class="item" @click="goOrder(2)">
          <van-image width="40" height="40" src="/h5_images/od_20.png" />
          <div>待服务</div>
        </div>
        <!-- 图标3 -->
        <div class="item"@click="goOrder(3)">
          <van-image width="40" height="40" src="/h5_images/od_30.png" />
          <div>已完成</div>
        </div>
        <!-- 图标4 -->
        <div class="item" @click="goOrder(4)">
          <van-image width="40" height="40" src="/h5_images/od_40.png"/>
          <div>已取消</div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="foot">
        <div class="foot1">
          <div class="text1">
            <van-image width="20" height="20" src="/h5_images/ic_clients.png" />
            服务对象管理
          </div>
          <div class="text2"><van-icon name="arrow"/></div>       
        </div>
        <div class="foot2">
          <div class="text1">
            <van-image width="20" height="20" src="/h5_images/ic_share.png" />
            分享转发
          </div>
          <div class="text2"><van-icon name="arrow"/></div>  
        </div>
      </div>
    </div>

    <!-- 退出按钮 -->
    <van-button @click="show = true" type="danger" class="quit" size="large">退出登录</van-button>
      <!-- 退出弹窗 -->
      <van-dialog 
        v-model:show="show"
        title="提示"
        @cancel="show = false"
        @confirm="logout"
        show-cancel-button
      >
        <div class="quit_text">是否确认退出登录</div>
      </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const userInfo = computed(() => {
  return JSON.parse(localStorage.getItem('h5_userInfo')) || {}
});

// 跳转订单列表页
const goOrder = (active) => {
  router.push(`/order?active=${active}`)
}

// 控制退出弹窗的显示隐藏
const show = ref(false);
// 退出登录方法
const logout = () => {
  // 清除本地存储
  localStorage.removeItem('h5_token')
  localStorage.removeItem('h5_userInfo')
  // 跳转到登录页
  router.push('/login')
}
</script>

<style lang="less" scoped>
.container {
    background-color: #f0f0f0;
    height: 100vh;
    overflow: hidden;
    .user {
      width: 95%;
      height: 200px;
      background-color: #fff;
      text-align: center;
      border-radius: 10px;
      margin: 10px;
      .img {
        margin-top: 30px;
      }
      .text {
        line-height: 30px;
        font-weight: bold;
      }
    }
    .order {
      width: 90%;
      margin: 10px;
      border-radius: 5px;
      background-color: #fff;
      padding: 10px;
      .top {
        margin: 10px;
        line-height: 50px;
        display: flex;
        justify-content: space-between;
        .text1 {
          color: #333;
        }
        .text2 {
          color: #999;
        }
        border-bottom: 0.5px solid #f5f5f5;
      }
      .buttom {
        padding: 10px;
        display: flex;
        justify-content: space-around;
        .item {
          font-size: 14px;
          color: #999;
        }
      }
    }
    .foot {
      margin: 0 10px;
      padding: 10px;
      line-height: 50px;
      background-color: #fff;
      .foot1,
      .foot2 {
        display: flex;
        justify-content: space-between;
        color: #555;
        align-items: center;
      }
      .foot1 {
        border-bottom: 0.5px solid #f5f5f5;
      }
      .van-image {
        vertical-align: middle;
        margin-right: 5px;
      }
    }
    .quit {
      width: 90%;
      margin: 20px;
    }
    .quit_text {
      margin: 20px 0;
      text-align: center;
    }
  }  
</style>
<template>
  <div class="container">
    <!-- 导航栏 -->
    <div class="header">我的订单</div>
    <van-tabs v-model:active="active" @click-tab="onClickTab">
      <van-tab title="全部" name="" />
      <van-tab title="待支付" name="1" />
      <van-tab title="待服务" name="2" />
      <van-tab title="已完成" name="3" />
      <van-tab title="已取消" name="4" />
    </van-tabs>

    <!-- 订单列表 -->
    <van-loading v-if="loading" class="loading" size="24px">加载中...</van-loading>
    <van-row v-else @click="goDetail(item)" v-for="item in order" :key="item.out_trade_no">
      <!-- 左侧图片 -->
      <van-col span="5">
        <van-image 
          width="50" height="50" 
          :src="item.serviceImg" 
          radius="5" 
          />
      </van-col>
      <!-- 中间内容 -->
      <van-col span="14">
        <div class="text1">
          {{ item.service_name }}
        </div>
        <div class="text2">{{ item.hospital_name }}</div>
        <div class="text2">预约时间：{{ item.starttime }}</div>
      </van-col>
      <!-- 右侧订单状态 -->
      <van-col span="5" class="text2" :style="{color: colorMap[item.trade_state]}">
        {{ item.trade_state }}
        <counter :second="item.timer" v-if="item.trade_state === '待支付'" />
      </van-col>
    </van-row>
    <!-- 加载 -->
    <div v-if="!loading && order.length === 0" class="bottom-text">没有更多订单了</div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue'
import counter from '../../components/counter.vue'
import { useRouter } from 'vue-router'

// 订单列表
const order = ref([])
// 加载状态
const loading = ref(false)

// 订单状态对应的颜色
const colorMap = {
  '待支付': '#ffa200',
  '待服务': '#1da6fd',
  '已完成': '#21c521',
  '已取消': '#999999'
}

onMounted(() => {
  getOrderList('') // 首次进来就获取订单列表
})

// 获取当前vue实例
const { proxy } = getCurrentInstance();

// 获取订单列表
const getOrderList = async (state) => {
  loading.value = true
  try {
    const { data } = await proxy.$api.orderList({ state })
    console.log(data)
    data.data.forEach(item => { // 计算订单剩余时间
      // 剩余时间 =  2小时-（当前时间-订单创建时间 ）（单位：毫秒）
      item.timer = 7200000 - (new Date() - item.order_start_time)
    });
    order.value = data.data
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}
const onClickTab = (item) => {
  getOrderList(item.name)
}

const active = ref("")

const router = useRouter()
// 跳转到订单详情页
const goDetail = (item) => {
  // 订单号作为参数传递
  router.push(`/detail?oid=${item.out_trade_no}`) 
}
</script>

<style lang="less" scoped>
.container {
    background-color: #f0f0f0;
    height: 100vh;
  }
  .header {
    background-color: #fff;
    line-height: 40px;
    text-align: center;
  }
  .van-row {
    background-color: #fff;
    padding: 10px;
    margin: 5px;
    border-radius: 5px;
    .text1 {
      font-size: 16px;
      line-height: 25px;
      font-weight: bold;
    }
    .text2 {
      font-size: 14px;
      line-height: 20px;
      color: #999999;
    }
  }
  .bottom-text {
    line-height: 50px;
    text-align: center;
    color: #999999;
  }
  .loading {
    text-align: center;
    padding: 20px;
  }
</style>
<template>
  <div class="container">
    <div class="header">
      <van-icon @click="goBack" name="arrow-left" class="header-left" size="30" />
      订单详情
    </div>
    <statusBar :item="stateMap[detailData.trade_state]" />
    <div class="tips">
      <!-- 待支付 -->
      <div class="dzf" v-if="detailData.trade_state === '待支付'">
        <div class="text1">订单待支付</div>
        <div class="text2">
          请在 
          <counter :second="second" /> 
          内完成支付，逾期订单将自动取消
        </div>
        <div class="text3">
          <van-button @click="showCode = true" type="success">立即支付(0.5元)</van-button>
        </div>
      </div>
      <!-- 待服务 -->
      <div class="dzf" v-if="detailData.trade_state === '待服务'">
        <div class="text1">正在为您安排服务专员...</div>
        <div class="text2">请保持手机畅通，稍后会有服务专员与您联系</div>
      </div>
      <!-- 已完成 -->
      <div class="dzf" v-if="detailData.trade_state === '已完成'">
        <div class="text1">服务已完成</div>
        <div class="text2">感谢您的使用，如有售后问题请联系客服</div>
      </div>
      <!-- 已取消 -->
       <div class="dzf" v-if="detailData.trade_state === '已取消'">
        <div class="text1">订单已取消</div>
        <div class="text2">期待下次为您服务，如需帮助可咨询客服</div>
      </div>
    </div>

    <!-- 预约信息 -->
    <van-cell-group v-if="!loading" class="card">
      <div class="header-text">预约信息</div>
      <van-cell 
        v-for="(item, key) in makeInfo" 
        :key="key" 
        :title="item" 
        :value="formatData(key)" 
      />
    </van-cell-group>
    <!-- 订单信息 -->
    <van-cell-group v-if="!loading" class="card">
      <div class="header-text">订单信息</div>
      <van-cell 
        v-for="(item, key) in orderInfo" 
        :key="key" 
        :title="item" 
        :value="formatData(key)" 
      />
    </van-cell-group>

    <!-- 加载中 -->
    <van-loading v-else class="loading" size="24px">加载中...</van-loading>

    <!-- 支付二维码弹窗 -->
     <van-dialog 
      :show-confirm-button="false" 
      v-model:show="showCode" 
      >
        <van-icon name="cross" class="close" @click="closeCode" />
        <div>微信支付</div>
        <van-image width="150" height="150" :src="codeImg" />
        <div>请使用本人微信扫描二维码支付</div>
     </van-dialog>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import statusBar from '../../components/statusBar.vue'
import { ref, onMounted, getCurrentInstance, computed } from 'vue';
import counter from '../../components/counter.vue'; // 导入倒计时组件
import Qrcode from 'qrcode'; // 导入qrcode库，用于生成二维码图片

const router = useRouter();
const route = useRoute();

// 获取当前vue实例
const { proxy } = getCurrentInstance();

// 详情页数据
const detailData = ref({})
// 加载状态
const loading = ref(true)

// 计算属性 - 计算倒计时
const second = computed(() => {
  return detailData.value.order_start_time ? 7200000 - (new Date() - detailData.value.order_start_time) : 0
})

// 支付二维码相关
const showCode = ref(false) // 是否显示二维码弹窗
const codeImg = ref('') // 二维码图片地址
const closeCode = () => {// 关闭支付弹窗
  showCode.value = false
  router.push('/order') // 跳转订单列表页
}

// 订单状态
const stateMap = {
  '待支付': 10,
  '待服务': 20,
  '已完成': 30,
  '已取消': 40
}

// 获取订单详情（上半部分内容）
const makeInfo = {
  service_name: '预约服务',
  hospital_name: '就诊医院',
  starttime: '期望就诊时间',
  'client.name': '就诊人',
  'client.mobile': '就诊人电话',
  receiveAddress: '接送地址',
  demand: '其他需求'
}
// 获取订单详情（下半部分内容）
const orderInfo = {
  tel: '联系人电话',
  order_start_time: '下单时间',
  price: '应付金额',
  out_trade_no: '订单编号'
}

// 时间戳格式化函数
const formatData = (key) => {
  if (key.indexOf(".") === -1) { // 如果key中没有点，说明是一级属性
    if (key === "order_start_time") {
      return formatTimestamp(detailData.value[key]);// 对订单创建时间进行格式化
    }
    return detailData.value[key];// 直接返回一级属性的值
  }
  let arr = key.split(".").reduce((o, p) => {// 如果key中有点，说明是嵌套属性，需要通过reduce逐层访问
    return (o || {})[p];// 访问嵌套属性，如果某层属性不存在，则返回undefined，避免报错
  }, detailData.value);// 从detailData开始访问，逐层访问到最终属性
  return arr;
}
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份是从0开始的，所以需要+1
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

onMounted( async () => {
  loading.value = true
  try {
    const { data } = await proxy.$api.orderDetail({ oid: route.query.oid })
    Object.assign(detailData.value, data.data)
     // 如果订单状态为待支付，则生成支付二维码
    Qrcode.toDataURL(data.data.code_url).then((url) => {
      codeImg.value = url // 将生成的二维码图片URL赋值给codeImg
    })
  } catch (error) {
    console.error('获取订单详情失败:', error)
  } finally {
    loading.value = false
  }
})

// 返回上一页
const goBack = () => {
  router.go(-1);
}
</script>

<style scoped>
.container {
    background-color: #f0f0f0;
    height: 100vh;
  }
  .header {
    background-color: #fff;
    line-height: 40px;
    text-align: center;
    .header-left {
      float: left;
    }
  }
  .card {
    margin: 15px 0;
    padding: 10px;
    .header-text {
      padding-left: 5px;
      line-height: 30px;
      font-size: 16px;
      font-weight: bold;
      border-left: 4px solid red;
    }
  }
  .dzf {
    padding: 20px;
    .text1 {
      font-size: 20px;
      font-weight: bold;
      line-height: 30px;
      color: #666;
    }
    .text2 {
      font-size: 14px;
      color: #666;
    }
    .text3 {
      text-align: center;
      .van-button {
        margin-top: 10px;
        margin-left: 10px;
        width: 80%;
        font-weight: bold;
      }
    }
  }
  .loading {
    text-align: center;
    padding: 20px;
  }
  ::v-deep(.van-dialog__content) {
    text-align: center;
    padding: 20px;
    .close {
      position: absolute;
      left: 20px;
    }
  }
</style>
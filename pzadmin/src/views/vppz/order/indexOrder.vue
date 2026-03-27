<template>
  <PanelHead :route="route" />

  <!-- 搜索栏 -->
  <div class="form">
    <el-form inline="true" :model="searchForm">
      <el-form-item prop="out_trade_no">
        <el-input v-model="searchForm.out_trade_no" placeholder="订单号" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
  </div>

  <el-table :data="tableData.list">
    <el-table-column prop="out_trade_no" label="订单号" width="150" fixed="left"></el-table-column>
    <el-table-column prop="hospital_name" label="就诊医院"></el-table-column>
    <el-table-column prop="service_name" label="陪诊服务"></el-table-column>
    <el-table-column label="陪护师">
      <template #default="scope"> <!--scope 是插槽参数，包含当前行数据（scope.row）-->
        <el-image style="width: 40px;height: 40px;" :src="scope.row.companion.avatar" />
      </template>
    </el-table-column>
    <el-table-column label="陪护师手机号" width="120">
      <template #default="scope"> <!--scope 是插槽参数，包含当前行数据（scope.row）-->
        {{ scope.row.companion.mobile }}
      </template>
    </el-table-column>
    <el-table-column prop="price" label="总价"></el-table-column>
    <el-table-column prop="paidPrice" label="已付"></el-table-column>
    <el-table-column label="下单时间" width="120">
      <template #default="scope"> <!--dayjs处理时间戳YYYY-MM-DD HH:mm:ss-->
        {{ dayjs(scope.row.order_start_time).format('YYYY-MM-DD')}}
      </template>
    </el-table-column>
    <el-table-column label="订单状态">
      <template #default="scope">
        <el-tag :type="statusMap(scope.row.trade_state)">
          {{ scope.row.trade_state }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="service_state" label="接单状态"></el-table-column>
    <el-table-column prop="tel" label="联系人手机号" width="120"></el-table-column>
    <el-table-column prop="create_time" label="操作" width="100" fixed="right">
      <template #default="scope">
        <!-- 只有已经支付之后，待服务的订单才显示“服务完成”，其他都是置灰+暂无服务 -->
        <!-- 点击服务完成，弹出气泡弹窗 -->
         <el-popconfirm
         v-if="scope.row.trade_state === '待服务'"
          confirm-button-text="是"
          cancel-button-text="否"
          :icon="InfoFilled"
          icon-color="#626AEF"
          title="是否确认完成？"
          @confirm="confirmEvent(scope.row.out_trade_no)"
        >
          <template #reference><!--文字类型button按钮用 link -->
            <el-button type="primary" link>服务完成</el-button>
          </template>
        </el-popconfirm><!--暂无服务且置灰 -->
        <el-button v-else type="primary" link disabled>暂无服务</el-button>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页 -->
  <div class="pagenation-info">
    <el-pagination
      v-model:current-page="paginationData.pageNum"
      :page-size="paginationData.pageSize"
      :background="false"
      layout="total, prev, pager, next"
      :total="tableData.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      size="small"
      style="float: right;"
      />
  </div>
</template>

<script setup>
import { adminOrder, updateOrder } from '@/api/indexApi';
import { onMounted,ref } from 'vue';
import dayjs from 'dayjs';
import { useRoute } from 'vue-router';
import { InfoFilled } from '@element-plus/icons-vue';

const route = useRoute()

onMounted(() => {
  getListData()
})

const paginationData = ref({
  pageNum: 1,
  pageSize: 10,
})

// 搜索表单
const searchForm = ref({
  out_trade_no: '',
})
// 搜索按钮点击事件
const onSubmit = () => {
  // console.log('搜索表单：', searchForm.value);
  getListData(searchForm.value)
}

// 列表数据
const tableData = ref({
  list: [],
  total: 0
})

// 分页相关
//改变每页条数回调
const handleSizeChange = (val) => {
  paginationData.value.pageSize = val;
  getListData();
}
//改变页码回调
const handleCurrentChange = (val) => {
  paginationData.value.pageNum = val;
  getListData();
}

// 调用接口的方法
const getListData = (params = {}) => {
  adminOrder({ ...paginationData.value, ...params }).then(({ data }) => {
    //console.log('陪护师数据：', data);
    const { list, total } = data.data;
    // 格式化时间
     list.forEach(item => {
      item.create_time = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss');
    });
    tableData.value.list = list;
    tableData.value.total = total;
  })
}

// 状态
const statusMap = (key) => {
  const obj = {
     '待支付': 'warning',
     '已取消': 'info',
     '已完成': 'success',
  }
  return obj[key]
}

// 服务完成确认,扭转订单状态
const confirmEvent = (id) => {
  // console.log('服务完成确认');
  updateOrder({ id }).then(({ data }) => {
    if (data.code === 10000) {
      getListData()
    }
  })
}

</script>

<style lang="scss" scoped>
.form {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0 10px 10px;
  background-color: #fff;
}
</style>

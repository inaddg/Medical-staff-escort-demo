<template>
    <PanelHead :route="route"/>

   <div class="btns">
    <el-button :icon="Plus" type="primary" @click="open(null)" size="small">新增</el-button>
    <!-- 批量删除按钮 -->
    <el-popconfirm
      confirm-button-text="是"
      cancel-button-text="否"
      :icon="InfoFilled"
      icon-color="#626AEF"
      title="是否确认删除？"
      @confirm="confirmEvent"
    >
      <template #reference>
        <el-button :icon="Delete" type="danger" size="small">删除</el-button>
      </template>
    </el-popconfirm>
  </div>

  <!-- 陪护师列表 -->
  <el-table
  :data="tableData.list"
  style="width: 100%"
  @selection-change="handleSelectionChange"
  >
    <!-- 多选框 -->
    <el-table-column type="selection" :selectable="selectable" width="55" />

    <el-table-column prop="id" label="id" />
    <el-table-column prop="name" label="昵称" />

    <el-table-column label="头像">
      <!-- 原来是<template #default="scope">,解构一下-->
      <template #default="{ row }">
        <el-image
        :src="row.avatar"
        style="width: 50px; height: 50px"
        />
      </template>
    </el-table-column>

    <el-table-column prop="sex" label="性别">
      <template #default="{ row }">
        {{ row.sex === 1 ? '男' : '女' }}
      </template>
    </el-table-column>

    <el-table-column prop="mobile" label="手机号" />

    <el-table-column prop="active" label="状态">
      <template #default="{ row }">
        <el-tag :type="row.active ? 'success' : 'danger'">
          {{ row.active ? '正常' : '失效' }}
        </el-tag>
      </template>
    </el-table-column>

     <el-table-column label="创建时间">
      <template #default="{ row }">
         <div class="flex-box">
            <el-icon><Clock /></el-icon>
            <span style="margin-left: 10px">{{ row.create_time }}</span>
         </div>
      </template>
    </el-table-column>

    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button type="primary" @click="open(row)">编辑</el-button>
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

  <el-dialog
    v-model="dialogFormVisable"
    :before-close="beforeClose"
    title="陪护师添加"
    width="500"
  >
    <el-form
      ref="formRef"
      label-width="100px"
      label-position="left"
      :model="form"
      :rules="rules"
    >
      <!-- 隐藏的表单域 -->
      <el-form-item v-show="false" prop="id">
        <el-input v-model="form.id" />
      </el-form-item>

      <el-form-item label="昵称" prop="name">
        <el-input v-model="form.name" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="头像" prop="avatar">
        <el-button
        v-if="!form.avatar"
        type="primary"
        @click="dialogImgVisable = true"
        >
        点击上传
      </el-button>
        <el-image
        v-else
        :src="form.avatar"
        style="width: 148px; height: 148px"
        />
      </el-form-item>

      <el-form-item label="性别" prop="sex">
        <el-select v-model="form.sex" placeholder="请选择性别">
          <el-option label="男" value="1" />
          <el-option label="女" value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="form.age" :min="18" :max="50" />
      </el-form-item>

      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="form.mobile" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="是否生效" prop="active">
        <el-radio-group v-model="form.active">
          <el-radio :value="0">失效</el-radio>
          <el-radio :value="1">生效</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="confirm(formRef)">确定</el-button>
        <el-button @click="dialogFormVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="dialogImgVisable"
    :before-close="beforeClose"
    title="选择头像"
    width="680"
  >
    <div class="image-list">
      <div
      v-for="(item, index) in fileList"
      :key="item.id"
      class="img-box"
      @click="selectIndex = index"
      >
      <!-- 手写选中图片效果 -->
        <div v-if="selectIndex === index" class="select">
          <el-icon color="#fff"><Check /></el-icon>
        </div>
        <el-image
          :src="item.url"
          style="width: 148px; height: 148px"
        />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="confirmImage">确定</el-button>
        <el-button @click="dialogImgVisable = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Plus, InfoFilled, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'
import { photoList, companion, companionList, deleteCompanion } from '@/api/indexApi';
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  // 获取图片列表
  photoList().then(({ data }) => {
    fileList.value = data.data
    //console.log('图片列表：', data.data);
  })
  // 获取列表数据
  getListData()
})

// 分页数据
const paginationData = ref({
  pageNum: 1,
  pageSize: 10,
});
// 列表数据
const tableData = ref({
  list: [],
  total: 0,
});

// 调用接口的方法
const getListData = () => {
  companionList(paginationData.value).then(({ data }) => {
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

const dialogFormVisable = ref(false)
const beforeClose = () => {
  dialogFormVisable.value = false
  formRef.value.resetFields()
}

const formRef = ref()
const form = ref({
  id: '',
  mobile: '',
  active: 1,
  age: 28,
  avatar: '',
  name: '',
  sex: '',
})
const rules = ref({
  name: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  avatar: [{ required: true, message: '请选择头像' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
})

// 确认按钮回调(表单提交)
const confirm = async (formEl) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      //console.log('submit!', form.value)
      companion(form.value).then(({ data }) => {
        if (data.code === 10000) {
          ElMessage.success('操作成功')
          beforeClose()
          // 刷新列表,请求列表数据
          getListData()
        } else {
          ElMessage.error(data.message)
        }
      })
    } else {
      console.log('error submit!', fields);
      return false;
    }
  })
}

// 打开弹窗
const open = (rowData={}) => {
  dialogFormVisable.value = true
  // nextTick 保证在下次DOM更新循环结束之后执行其回调
  nextTick(() => { //点击编辑时，表单数据回显
    // 如果是编辑
    if (rowData) {
      //需要通过Object.assign进行赋值，否则表单不会更新
      Object.assign(form.value, rowData)
    }
  })
}

// 选择头像弹窗
const dialogImgVisable = ref(false)
const fileList = ref([])
// 选中头像
const selectIndex = ref(0)
const confirmImage = () => {
  form.value.avatar = fileList.value[selectIndex.value].url
  dialogImgVisable.value = false
}

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

// 多选框相关
// 存储选中的数据
const selectTableData = ref([])
const handleSelectionChange = (val) => {
  // 当我们选中当前行时，需要给当前数据重新赋值
  selectTableData.value = val.map(item => ({id: item.id})) // 只需要id，是对象的结构，所以需要加上{}，不然就是数组的结构了
  //console.log('选中的数据：', selectTableData.value)
}

// 批量删除回调
const confirmEvent = () => {
  // 没有选中数据
  if (!selectTableData.value.length) {
    return ElMessage.warning('请至少选择一条数据')
  }
  deleteCompanion({ id: selectTableData.value }).then(({
    data }) => {
      if(data.code === 10000) {
        ElMessage.success('删除成功')
        getListData()
      } else {
        ElMessage.error(data.message)
      }
  })
}
</script>

<style lang="scss" scoped>
  .btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
}
.image-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .img-box {
    position: relative;
    .select {
      position: absolute;
      left: 0px;
      top: 0px;
      width: 24px;
      height: 24px;
      background-color: #67c23a;
      z-index: 999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .el-image {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>

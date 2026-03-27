<template>
  <PanelHead :route="route"/>

   ·  <el-table :data="tableData.list" style="width: 100%">
    <el-table-column prop="id" label="id" />
    <el-table-column prop="name" label="昵称" />

    <el-table-column prop="permissions_id" label="所属组别">
      <template #default="scope">
        {{ permissionName(scope.row.permissions_id) }}
      </template>
    </el-table-column>
    <el-table-column prop="mobile" label="手机号" />

    <el-table-column prop="active" label="状态">
      <template #default="scope">
         <el-tag :type="scope.row.active ? 'success' : 'danger'">{{ scope.row.active ? '正常' : '失效'}}</el-tag>
      </template>
    </el-table-column>

    <el-table-column label="创建时间">
      <template #default="scope">
         <div class="flex-box">
            <el-icon><Clock /></el-icon>
            <span style="margin-left: 10px">{{ scope.row.created_time }}</span>
         </div>
      </template>
    </el-table-column>

    <el-table-column label="操作">
      <template #default="scope">
        <el-button type="primary" @click="open(scope.row)">编辑</el-button>
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
  <!-- 弹窗 -->
  <el-dialog
    v-model="dialogFormVisible"
    :before-close="beforeClose"
    title="添加权限"
    width="500"
  >
  <!-- 弹窗内容 -->
    <el-form
        ref="formRef"
        label-width="100px"
        label-position="left"
        :model="form"
        :rules="rules"
      >
         <!-- 表单域 (手机号不可编辑=>disabled) -->
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="菜单权限" prop="permissions_id">
          <el-select
          v-model="form.permissions_id"
          placeholder="请选择菜单权限"
          style="width: 240px"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="confirm(formRef)">确定</el-button>
        <el-button @click="dialogFormVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { authAdmin, menuSelectList, updateUser } from '@/api/indexApi';
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'

const route = useRoute()
//console.log('当前路由对象：', route);

const paginationData = ref({
  pageNum: 1,
  pageSize: 10,
});

onMounted(() => {
  getListData();
  menuSelectList().then(({ data }) => {
    options.value = data.data;
  });
});

// 获取列表数据(在onMouneted基础上改的)
const getListData = () => {
  authAdmin(paginationData.value).then(({ data }) => {
    //console.log('管理员数据：', data);
    const { list, total } = data.data;
    list.forEach(item => {
      item.created_time = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss');
    });
    tableData.value.list = list;
    tableData.value.total = total;
  });
};

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

// 弹窗显示控制
const dialogFormVisible = ref(false);
// 关闭弹窗的方法
const beforeClose = () => {
  dialogFormVisible.value = false;
};

// 表单验证
const rules = ref({
  name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
  ],
  // 下拉选择change事件触发验证
  permissions_id: [
    { required: true, message: '请选择菜单权限', trigger: 'change' },
  ],
})

// 编辑表单数据
const formRef = ref()
const form = ref({
  name: '',
  permissions_id: '',
})

// 表单提交
const confirm = async(formEl) => {
  if (!formEl) return;
  await formEl.validate(( valid, fields ) => {
    if (valid) {
      //console.log('表单数据：', form.value);
      const { name, permissions_id } = form.value;
      updateUser({ name,permissions_id }).then(({ data }) => {
        //console.log('更新管理员信息：', data);
        if(data.code === 10000) {
          dialogFormVisible.value = false;
          getListData();
        }
      });
    } else {
      console.log('error submit!', fields);
      return false;
    }
  })
}

const options = ref([])
//根据权限id匹配权限名称
const permissionName = (id) => {
  const data = options.value.find(el => el.id === id);
  return data ? data.name : '超级管理员';
};

//列表数据
const tableData = ref({
  list: [],
  total: 0,
});

const open = (rowData) => {
  //console.log(rowData);
  dialogFormVisible.value = true;
  //无需考虑新增情况，所以直接赋值（用Object.assign）
  Object.assign(form.value, { mobile: rowData.mobile, name: rowData.name, permissions_id: rowData.permissions_id });
}
</script>

<style lang="scss" scoped>
  .flex-box {
    display: flex;
    align-items: center;
  }
</style>

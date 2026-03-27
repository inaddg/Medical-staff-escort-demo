<template>
  <PanelHead :route="route"/>

  <div class="btns">
    <el-button :icon="Plus" type="primary" @click="open(null)" size="small">新增</el-button>
  </div>

  <el-table :data="tableData.list" style="width: 100%">
    <el-table-column prop="id" label="id" />
    <el-table-column prop="name" label="昵称" />
    <el-table-column prop="permissionName" label="菜单权限" width="500px"/>
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

  <el-dialog
    v-model="dialogFormVisible"
    :before-close="beforeClose"
    title="添加权限"
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

      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请填写权限名称" />
      </el-form-item>

      <el-form-item label="权限" prop="permissions">
        <!-- node-key =》 数据唯一标识符(每个数据的工号) -->
        <!-- :default-expand-all="true" =》默认展开所有节点 -->
        <el-tree
          ref="treeRef"
          style="max-width: 600px;"
          :data="permissionData"
          node-key="id"
          show-checkbox
          :default-checked-keys="defaultKeys"
          :default-expanded-keys="[2]"
        />
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
import { ref, onMounted, nextTick } from 'vue';
import { userGetMenu, userSetMenu, menuList } from '@/api/indexApi';
import { Plus } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router'

const route = useRoute()
//console.log('当前路由对象：', route);

onMounted(() => {
  userGetMenu().then(({ data }) => {
    console.log('权限数据：', data);
    permissionData.value = data.data;
  });
  getListData();
});

//列表数据
const tableData = ref({
  list: [],
  total: 0,
});

// 打开弹窗
const open = (rowData = {}) => {
  dialogFormVisible.value = true;
  // 弹窗打开form生成，是异步的,所以需要使用nextTick
  nextTick(() => { // nextTick:弹窗里的所有元素都渲染完成后，再执行后面的赋值操作
    if (rowData) {
      Object.assign(form.value, { id: rowData.id, name: rowData.name }); // 把rowData的数据赋值给form表单
      treeRef.value.setCheckedKeys(rowData.permission);
    }
  });
};

const paginationData = ref({
  pageNum: 1,
  pageSize: 10,
});

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

//请求列表数据
const getListData = () => {
  menuList(paginationData.value).then(({ data }) => {
    const { list, total } = data.data;
    tableData.value.list = list;
    tableData.value.total = total;
  });
}

const formRef = ref();

// 表单form数据
const form = ref({
  id: '',
  name: '',
  permissions: '',
});

// 树形控件数据
const permissionData = ref([]);

// 对话框显示与否
const dialogFormVisible = ref(false);

// 关闭弹窗前的回调
const beforeClose = () => {
  dialogFormVisible.value = false;
  formRef.value.resetFields(); // 重置表单
  treeRef.value.setCheckedKeys(defaultKeys); // 重置树形控件
};

// 选中权限
const defaultKeys = [4, 5];

// 获取树形控件实例
const treeRef = ref();

const rules = ref({
  name: [{
    required: true,
    message: '请输入权限名称',
    trigger: 'blur'
  }]
})
// 确认按钮回调(表单提交)
const confirm = async (formEl) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      // 获取到选择的checkbox数据
      const permissions = JSON.stringify(treeRef.value.getCheckedKeys());
      userSetMenu({
        name: form.value.name,
        permissions,
        id: form.value.id,
      }).then(({ data }) => {
        console.log('修改权限结果：', data);
        beforeClose();
        getListData();
      })
    } else {
      console.log('error submit!', fields);
      return false;
    }
  });
}
</script>

<style lang="scss" scoped>
.btns {
  padding: 10px;
  background-color: #fff;
}
</style>

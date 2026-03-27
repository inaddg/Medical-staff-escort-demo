<template>
  <h1>用户登录</h1>
  <van-form @submit="onSubmit">
     <van-cell-group inset>
       <van-field
          v-model="form.userName"
          name="用户名"
          label="用户名"
          placeholder="用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
      />
       <van-field
          v-model="form.passWord"
          type="password" 
          name="密码"
          label="密码"
          placeholder="密码"
          :rules="[{ required: true, message: '请填写密码' }]"
      />
     </van-cell-group>
     <!-- 提交按钮（按钮为回车也能提交,圆角,块级） -->
      <div class="btn">
        <van-button native-type="submit" round block type="primary">提交</van-button>
      </div>
  </van-form>
</template>

<script setup>
// 获取vue实例方法:getCurrentInstance
import { ref, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 获取vue实例，可以通过proxy访问到全局属性和方法
const { proxy } = getCurrentInstance(); 

// 表单数据
const form = ref({
  userName: '',
  passWord: ''
})
// 表单提交
const onSubmit = async () => { 
  // 调用全局属性$api中的login方法，传入表单数据
  const { data } = await proxy.$api.login(form.value)
  //console.log(res)
  if (data.code === 10000) {
    localStorage.setItem('h5_token', data.data.token) // 存储token
    // userInfo是一个对象，不能直接存储在localStorage中，需要先转换成字符串
    localStorage.setItem('h5_userInfo', JSON.stringify(data.data.userInfo)) // 存储用户信息
    router.push('/home') // 登录成功后跳转到主页面
  }
}
</script>

<style lang="less" scoped>
h1 {  // 字体居中
  text-align: center;
}
.btn {  // 按钮外层添加间距
  margin: 16px;
}
</style>
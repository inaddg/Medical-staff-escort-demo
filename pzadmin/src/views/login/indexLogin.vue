<template>
  <el-row class="login-container" justify="center" :align="'middle'">
    <el-card style="max-width: 480px">
      <template #header>
        <div class="card-header">
          <img :src="imgUrl" alt="">
        </div>
      </template>
      <div class="jump-link">
        <el-link @click="handleChange" type="primary" underline>{{formType ? '返回登录' : '注册账号'}}</el-link>
      </div>
      <el-form
        ref="loginFormRef"
        style="max-width: 600px;"
       :model="loginForm"
       class="demo-ruleForm"
       :rules="rules"
       >
        <!-- prop: 绑定表单数据对象-->
        <el-form-item prop="userName">
          <el-input v-model="loginForm.userName" placeholder="手机号" :prefix-icon="UserFilled"></el-input>
        </el-form-item>

        <el-form-item prop="passWord">
          <el-input type="password" v-model="loginForm.passWord" placeholder="密码" :prefix-icon="Lock"></el-input>
        </el-form-item>

        <el-form-item
          v-if="formType"
         prop="validCode">
          <el-input v-model="loginForm.validCode" placeholder="验证码" :prefix-icon="Lock">
            <template #append>
              <span @click="countdownChange">{{ countdown.validText }}</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="submitForm(loginFormRef)">{{formType ? '注册' : '登录'}}</el-button>
        </el-form-item>

      </el-form>
    </el-card>
  </el-row>
</template>

<script setup>
import { UserFilled, Lock} from '@element-plus/icons-vue'
import { ref, computed, toRaw } from 'vue'
import { getCode, userAuthentication, login, menuPermissions } from '@/api/indexApi'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
// 【修改点1】删除Vuex的useStore导入，新增Pinia的menuStore导入
// 原：import { useStore } from "vuex";
import { useMenuStore } from '@/stores/menuStore'

const imgUrl = new URL('../../../public/login-head.png', import.meta.url).href

// 表单数据
const loginForm = ref({
  validCode: '',
  userName: '',
  passWord: ''
})

// 切换表单（0-登录 1-注册）
const formType = ref(0)
// 点击切换登录和注册路由
  const handleChange = () => {
    formType.value = formType.value ? 0 : 1
  }

// 账号自定义校验规则
const validateUser = (rule, value, callback) => {
  //不能为空
  if (value === '') {
    callback(new Error('请输入账号'))
  } else {
    const phoneReg = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/
    phoneReg.test(value) ? callback() : callback(new Error('手机号格式错误，请输入正确的手机号'))
  }
}

// 密码自定义校验规则
const validatePass = (rule, value, callback) => {
  //不能为空
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    const passReg = /^[a-zA-Z0-9_-]{4,16}$/
    passReg.test(value) ? callback() : callback(new Error('密码格式错误, 请输入4-16位字符'))
  }
}

// 表单校验规则
const rules = ref({
  userName: [{ validator: validateUser, trigger: 'blur' }],
  passWord: [{ validator: validatePass, trigger: 'blur' }],
})

// 获取验证码之后倒计时逻辑 - 发送短信
const countdown = ref({
  validText: '获取验证码',
  time:60
})
let flag = false; // 定时器标识
const countdownChange = () => {
  if (flag) return; // 防止多次点击
  // 判断手机号是否正确
  const phoneReg = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/
  // 如果当前手机号不存在/手机号格式不正确
  if (!loginForm.value.userName || !phoneReg.test(loginForm.value.userName)) {

    return ElMessage({
      message: '请输入正确的手机号',
      type: 'warning'
    })
  }
  const time = setInterval(() => {
    if (countdown.value.time <= 0) {
      countdown.value.validText = `获取验证码`
      countdown.value.time = 60
      flag = false;
      clearInterval(time);
    } else {
      countdown.value.time -= 1;
      countdown.value.validText = `剩余${countdown.value.time}s`
    }
  }, 1000)
  flag = true;
  getCode({ tel: loginForm.value.userName }).then(({ data }) => {
    console.log(data, 'data')
    if (data.code === 10000) {
      ElMessage.success('验证码发送成功')
    }
  })
}

const router = useRouter();
const loginFormRef = ref();
// 【修改点2】删除Vuex的store实例，创建Pinia的menuStore实例
// 原：const store = useStore();
const menuStore = useMenuStore()
// 【修改点3】替换Vuex的state获取方式，直接从Pinia实例取routerList
const routerList = computed(() => menuStore.routerList)
// 提交表单
const submitForm = async (formEl) => {
  if (!formEl) return;
  // 手动触发校验表单
  await formEl.validate((valid) => {
    if (valid) {
      if (formType.value === 0) {
        // 登录逻辑
        console.log('登录成功', loginForm.value)
        login(loginForm.value).then(({ data })=>{
          if(data.code === 10000){
            ElMessage.success('登录成功！')
            // 存储token
            localStorage.setItem('pz_token', data.data.token)
            // 用户信息（转字符串）
            localStorage.setItem('pz_userInfo', JSON.stringify(data.data.userInfo))
            // 获取用户菜单权限
             menuPermissions().then(({ data: permission }) => {
              // 【修改点4】替换Vuex的commit提交，直接调用Pinia的actions方法dynamicMenu
              // 原：store.commit('dynamicMenu', permission.data)
              menuStore.dynamicMenu(permission.data)
              //console.log(toRaw(routerList.value), 'routerList')
              //console.log(router)
              //toRow => 获取响应式数据的原始数据
              toRaw(routerList.value).forEach(item => {
                router.addRoute("main", item)
              })
            }).then(() => {
              router.push('/')
            })
          }
        })
      } else {
        // 注册逻辑
        console.log('注册成功', loginForm.value)
        userAuthentication(loginForm.value).then(({ data })=>{
          if(data.code === 10000){
            ElMessage.success('注册成功，请登录！')
            formType.value = 0; // 切换到登录表单
          }
        })
      }
    } else {
      console.log('表单校验失败')
      return false;
    }
  })

}
</script>

<style lang="less" scoped>
  // 需要 :deep() 穿透作用域；
  // 选中 el-card 组件内部的 .el-card__header 类，设置 padding: 0（清除卡片头部默认的内边距）
:deep(.el-card__header) {
    padding: 0
  }
  .login-container {
    height: 100vh;
    .card-header{
      background-color: #899fe1;
      img {
        width: 430px;
      }
    }
    .jump-link {
      text-align: right;
      margin-bottom: 10px;
    }
  }
</style>

import axios from 'axios'

const http = axios.create({
  // 通用请求的地址前缀
  // baseURL: 'https://wechatopen.mynatapp.cc/v3pz',
  baseURL: 'https:/v3pz.itndedu.com/v3pz',
  timeout: 100000, // 超时时间
  headers: { "terminal": "h5" } // 终端标识，h5端固定为h5
})

// 添加请求拦截器
http.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  const token = localStorage.getItem('h5_token')
  // 不需要添加token的api
  const whiteUrl = ['/login']
  if (token && !whiteUrl.includes(config.url)) {
    config.headers['h-token'] = token
    // 临时
    // config.headers['auth'] = '13797053405'
  }
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
http.interceptors.response.use(function (response) {
  // 对响应数据做点什么

  // 对于接口返回异常的数据，给用户一点提示
  if (response.data.code === -1) {
    //ElMessage.warning(response.data.message)
  }
  if (response.data.code === -2) { // token失效
    localStorage.removeItem('h5_token')
    localStorage.removeItem('h5_userInfo')
    // window.location.origin => 获取当前根目录地址
    window.location.href = window.location.origin
  }

  return response;
}, function (error) {
  // 对响应错误做点什么
  ElMessage.error('网络异常，请检查！')
  return Promise.reject(error);
});

export default http

import request from '../utils/request'
 
// API 接口封装写法,统一管理接口请求的文件.
// 在组件中直接引入这个文件,就可以调用里面的方法进行接口请求了
export default {
  login(data) {
    return request.post('/login', data)
  },
  // 首页数据
  index() {
    return request.get('/Index/index')
  },
  // h5首页
  h5Companion() {
    return request.get('/h5/companion')
  },
  // 订单提交
  createOrder(data) {
    return request.post('/createOrder', data)
  },
  // 订单列表
  orderList(params) {
    return request.get('/order/list', { params })
  },
  // 订单详情
  orderDetail(params) {
    return request.get('/order/detail', { params })
  },
}


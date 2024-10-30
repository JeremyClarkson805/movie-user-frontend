// src/utils/request.ts

import axios from 'axios'
import { server_url } from '../config'

const request = axios.create({
  baseURL: server_url,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在这里你可以添加 token 等认证信息
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 统一的错误处理
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

export default request
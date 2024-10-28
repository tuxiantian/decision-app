import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,  // 启用凭证以携带 cookies
});
// 设置 Axios 响应拦截器
api.interceptors.response.use(
    response => response, // 对于成功响应，直接返回
    error => {
        if (error.response && error.response.status === 401) {
            // 使用 window.location.href 替代 navigate
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);
export default api;

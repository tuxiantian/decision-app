import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import api from './components/api.js'
import './LoginPage.css'

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/login', {
        username,
        password,
      });

      if (response.status === 200) {
        // 登录成功后设置用户名，并存储到 localStorage
        const loggedInUsername = response.data.username;
        localStorage.setItem('username', loggedInUsername);
        onLogin(loggedInUsername); // 触发导航栏更新
        // 检查 URL 中是否有 redirect 参数
        const params = new URLSearchParams(location.search);
        const redirectUrl = params.get('redirect');
        
        // 如果有 redirect 参数，跳转到指定页面；否则跳转到默认页面
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate('/articles'); // 默认跳转路径
        }
      }
    } catch (error) {
        console.log(error);
      // 处理登录错误
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Decision App</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;

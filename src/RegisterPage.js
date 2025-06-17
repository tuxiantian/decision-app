import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './components/api.js'
import './RegisterPage.css'
import './App.css'

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check password strength whenever password changes
    if (password) {
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const isLongEnough = password.length >= 8;

      if (isLongEnough && hasLetter && hasNumber) {
        setPasswordStrength('strong');
      } else if (isLongEnough && (hasLetter || hasNumber)) {
        setPasswordStrength('medium');
      } else {
        setPasswordStrength('weak');
      }
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);  // 清除之前的错误信息

    // 检查密码和确认密码是否一致
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // 检查密码强度
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain both letters and numbers.');
      return;
    }

    try {
      const response = await api.post('/register', {
        username,
        email,
        password,
        avatar_url: avatarUrl
      });

      if (response.status === 201) {
        setSuccess('Registration successful!');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
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
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>

          {/* 第一行：输入框 + 强度条 */}
          <div className="password-input-row">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password && (
              <div className="password-strength">
                <div className={`password-strength-bar ${passwordStrength === 'weak' ? 'password-strength-weak' :
                    passwordStrength === 'medium' ? 'password-strength-medium' :
                      'password-strength-strong'
                  }`} />
              </div>
            )}
          </div>

          {/* 第二行：提示文本（独立于 Flex 容器外） */}
          {password && (
            <p className="password-hint">
              Password must be at least 8 characters long and contain both letters and numbers.
            </p>
          )}
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Avatar URL (Optional)</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit" className='green-button'>Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;

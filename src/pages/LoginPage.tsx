import { useState } from 'react';
import { login } from '../index';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import CSS

export default function LoginPage({
  onLoginSuccess,
}: {
  onLoginSuccess: (token: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await login({ username, password });

      const token = res.data.token;
      const user = res.data.user;

      // Lưu thông tin vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.id.toString());
      localStorage.setItem('username', user.username);

      onLoginSuccess(token);

      // Điều hướng dựa trên role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (e: any) {
      console.error(e);
      const msg =
        e.response?.data?.message || e.message || 'Đăng nhập thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Hỗ trợ nhấn Enter để đăng nhập
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Đăng nhập hệ thống</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label className="login-label">Tên đăng nhập</label>
          <input
            className="login-input"
            placeholder="Nhập username..."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(''); // Xóa lỗi khi người dùng nhập lại
            }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="login-label">Mật khẩu</label>
          <input
            type="password"
            className="login-input"
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </div>
    </div>
  );
}

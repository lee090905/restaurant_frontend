import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { login } from '../index';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import CSS
export default function LoginPage({ onLoginSuccess, }) {
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
            }
            else {
                navigate('/');
            }
        }
        catch (e) {
            console.error(e);
            const msg = e.response?.data?.message || e.message || 'Đăng nhập thất bại';
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    // Hỗ trợ nhấn Enter để đăng nhập
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };
    return (_jsx("div", { className: "login-container", children: _jsxs("div", { className: "login-card", children: [_jsx("h2", { className: "login-title", children: "\u0110\u0103ng nh\u1EADp h\u1EC7 th\u1ED1ng" }), error && _jsx("div", { className: "error-message", children: error }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "login-label", children: "T\u00EAn \u0111\u0103ng nh\u1EADp" }), _jsx("input", { className: "login-input", placeholder: "Nh\u1EADp username...", value: username, onChange: (e) => {
                                setUsername(e.target.value);
                                setError(''); // Xóa lỗi khi người dùng nhập lại
                            }, onKeyDown: handleKeyDown, autoFocus: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "login-label", children: "M\u1EADt kh\u1EA9u" }), _jsx("input", { type: "password", className: "login-input", placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u...", value: password, onChange: (e) => {
                                setPassword(e.target.value);
                                setError('');
                            }, onKeyDown: handleKeyDown })] }), _jsx("button", { className: "login-btn", onClick: handleLogin, disabled: loading, children: loading ? 'Đang xử lý...' : 'Đăng nhập' })] }) }));
}

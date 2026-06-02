import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
// Component này sẽ bọc ngoài các trang cần đăng nhập mới được xem
export const PrivateRoute = ({ children }) => {
    const token = sessionStorage.getItem('token');
    // Nếu không có token trong phiên làm việc -> Đá văng về trang login
    if (!token) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    // Nếu có token -> Cho phép render trang đích (children)
    return children;
};

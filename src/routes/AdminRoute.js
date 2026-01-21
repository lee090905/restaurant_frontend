import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
export default function AdminRoute({ children }) {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    const user = JSON.parse(userRaw);
    if (user.role !== 'admin') {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return children;
}

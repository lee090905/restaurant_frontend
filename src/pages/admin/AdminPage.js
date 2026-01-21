import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './AdminPage.css'; // Import CSS
// Định nghĩa Menu một chỗ để dễ quản lý
const MENU_ITEMS = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/tables', label: 'Quản lý Bàn' },
    { path: '/admin/dishes', label: 'Quản lý Món' },
    { path: '/admin/orders', label: 'Đơn hàng' },
    { path: '/admin/shifts', label: 'Ca làm việc' },
    { path: '/admin/users', label: 'Nhân viên' },
];
export default function AdminPage() {
    const location = useLocation();
    const [cancelRequests, setCancelRequests] = useState([]);
    useEffect(() => {
        // Polling hoặc lắng nghe sự kiện localStorage để cập nhật realtime (giả lập)
        const checkRequests = () => {
            const data = localStorage.getItem('cancelRequests');
            if (data) {
                setCancelRequests(JSON.parse(data));
            }
        };
        checkRequests();
        // Bạn có thể thêm setInterval ở đây nếu muốn tự động check mỗi vài giây
        // const interval = setInterval(checkRequests, 5000);
        // return () => clearInterval(interval);
    }, []);
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };
    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin')
            return true;
        if (path !== '/admin' && location.pathname.startsWith(path))
            return true;
        return false;
    };
    // Xử lý logic Modal
    const removeRequest = (index) => {
        const next = cancelRequests.filter((_, i) => i !== index);
        localStorage.setItem('cancelRequests', JSON.stringify(next));
        setCancelRequests(next);
    };
    return (_jsxs("div", { className: "admin-layout", children: [_jsxs("aside", { className: "sidebar", children: [_jsx("div", { className: "sidebar-brand", children: "ADMIN PORTAL" }), _jsx("ul", { className: "sidebar-menu", children: MENU_ITEMS.map((item) => (_jsx("li", { className: "menu-item", children: _jsx(Link, { to: item.path, className: `menu-link ${isActive(item.path) ? 'active' : ''}`, children: item.label }) }, item.path))) })] }), _jsxs("div", { className: "main-wrapper", children: [_jsxs("header", { className: "top-header", children: [_jsxs("div", { className: "admin-user", children: [_jsx("span", { style: { fontSize: 20 }, children: "\uD83D\uDC64" }), _jsx("span", { children: localStorage.getItem('username') || 'Admin' })] }), _jsx("button", { onClick: handleLogout, className: "btn-logout", children: "\u0110\u0103ng xu\u1EA5t" })] }), _jsx("main", { className: "content-area", children: _jsx(Outlet, {}) })] }), cancelRequests.length > 0 && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-card", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { style: { margin: 0, color: '#d32f2f' }, children: "\u26A0\uFE0F Y\u00EAu c\u1EA7u h\u1EE7y m\u00F3n" }), _jsx("button", { onClick: () => {
                                        localStorage.removeItem('cancelRequests');
                                        setCancelRequests([]);
                                    }, style: {
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        textDecoration: 'underline',
                                    }, children: "\u0110\u00F3ng t\u1EA5t c\u1EA3" })] }), _jsx("div", { style: { maxHeight: '400px', overflowY: 'auto' }, children: cancelRequests.map((r, idx) => (_jsxs("div", { className: "request-item", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsxs("strong", { children: ["B\u00E0n: ", r.tableId] }), _jsx("span", { style: { fontSize: 12, color: '#888' }, children: new Date(r.createdAt).toLocaleTimeString() })] }), _jsxs("div", { style: { margin: '8px 0', fontSize: 14 }, children: ["M\u00F3n ID: ", _jsx("b", { children: r.orderItemId }), " ", _jsx("br", {}), "L\u00FD do: ", _jsx("i", { children: r.reason })] }), _jsxs("div", { className: "req-actions", children: [_jsx("button", { className: "btn-approve", onClick: () => removeRequest(idx), children: "\u0110\u1ED3ng \u00FD H\u1EE7y" }), _jsx("button", { className: "btn-reject", onClick: () => removeRequest(idx), children: "T\u1EEB ch\u1ED1i" })] })] }, idx))) })] }) }))] }));
}

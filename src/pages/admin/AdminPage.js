import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import './AdminPage.css'; // Import CSS
// Định nghĩa Menu một chỗ để dễ quản lý
const MENU_ITEMS = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/tables', label: 'Quản lý Bàn' },
    { path: '/admin/dishes', label: 'Quản lý Món' },
    { path: '/admin/orders', label: 'Đơn hàng' },
    { path: '/admin/shifts', label: 'Ca làm việc' },
    { path: '/admin/users', label: 'Nhân viên' },
    { path: '/admin/qr-config', label: 'Cấu hình QR' },
];
export default function AdminPage() {
    const location = useLocation();
    const [cancelRequests, setCancelRequests] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [prevCount, setPrevCount] = useState(0);
    const checkRequests = async () => {
        try {
            const res = await axiosClient.get('/orderitems/cancel-requests');
            const newRequests = res.data || [];
            setCancelRequests(newRequests);
            // Nếu có yêu cầu mới xuất hiện thêm thì tự động bật thông báo modal
            if (newRequests.length > prevCount) {
                setShowCancelModal(true);
            }
            setPrevCount(newRequests.length);
        }
        catch (err) {
            console.error("Lỗi lấy danh sách yêu cầu hủy món:", err);
        }
    };
    useEffect(() => {
        checkRequests();
        // Tự động kiểm tra yêu cầu mới mỗi 5 giây
        const interval = setInterval(checkRequests, 5000);
        return () => clearInterval(interval);
    }, [prevCount]);
    const handleLogout = () => {
        sessionStorage.removeItem('token');
        window.location.href = '/login';
    };
    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin')
            return true;
        if (path !== '/admin' && location.pathname.startsWith(path))
            return true;
        return false;
    };
    // Xử lý duyệt / từ chối hủy món
    const handleApprove = async (orderItemId) => {
        try {
            await axiosClient.post('/orderitems/cancel-approve', { orderItemId });
            checkRequests();
        }
        catch (err) {
            alert("Không thể phê duyệt hủy món.");
        }
    };
    const handleReject = async (orderItemId) => {
        try {
            await axiosClient.post('/orderitems/cancel-reject', { orderItemId });
            checkRequests();
        }
        catch (err) {
            alert("Không thể từ chối yêu cầu hủy món.");
        }
    };
    return (_jsxs("div", { className: "admin-layout", children: [_jsxs("aside", { className: "sidebar", children: [_jsx("div", { className: "sidebar-brand", children: "ADMIN PORTAL" }), _jsx("ul", { className: "sidebar-menu", children: MENU_ITEMS.map((item) => (_jsx("li", { className: "menu-item", children: _jsx(Link, { to: item.path, className: `menu-link ${isActive(item.path) ? 'active' : ''}`, children: item.label }) }, item.path))) })] }), _jsxs("div", { className: "main-wrapper", children: [_jsxs("header", { className: "top-header", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("style", { children: `
            @keyframes ring {
              0% { transform: rotate(0); }
              10% { transform: rotate(15deg); }
              20% { transform: rotate(-10deg); }
              30% { transform: rotate(10deg); }
              40% { transform: rotate(-5deg); }
              50% { transform: rotate(5deg); }
              60% { transform: rotate(0); }
              100% { transform: rotate(0); }
            }
          ` }), _jsxs("div", { className: "cancel-requests-trigger", onClick: () => {
                                    if (cancelRequests.length > 0) {
                                        setShowCancelModal(true);
                                    }
                                }, style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: cancelRequests.length > 0 ? 'pointer' : 'default',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    background: cancelRequests.length > 0 ? '#ffeef0' : '#f3f4f6',
                                    border: cancelRequests.length > 0 ? '1px solid #fca5a5' : '1px solid #e5e7eb',
                                    transition: 'all 0.3s ease',
                                    userSelect: 'none',
                                    boxShadow: cancelRequests.length > 0 ? '0 2px 8px rgba(239, 68, 68, 0.15)' : 'none'
                                }, children: [_jsx("span", { style: {
                                            fontSize: '16px',
                                            display: 'inline-block',
                                            animation: cancelRequests.length > 0 ? 'ring 1.5s ease infinite' : 'none',
                                            transformOrigin: 'top center'
                                        }, children: "\uD83D\uDD14" }), _jsxs("span", { style: { fontSize: '13px', fontWeight: '600', color: cancelRequests.length > 0 ? '#dc2626' : '#6b7280' }, children: ["Y\u00EAu c\u1EA7u h\u1EE7y m\u00F3n: ", cancelRequests.length] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '15px' }, children: [_jsxs("div", { className: "admin-user", children: [_jsx("span", { style: { fontSize: 20 }, children: "\uD83D\uDC64" }), _jsx("span", { children: sessionStorage.getItem('username') || 'Admin' })] }), _jsx("button", { onClick: handleLogout, className: "btn-logout", children: "\u0110\u0103ng xu\u1EA5t" })] })] }), _jsx("main", { className: "content-area", children: _jsx(Outlet, {}) })] }), showCancelModal && cancelRequests.length > 0 && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-card", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { style: { margin: 0, color: '#d32f2f' }, children: "\u26A0\uFE0F Y\u00EAu c\u1EA7u h\u1EE7y m\u00F3n" }), _jsx("button", { onClick: () => {
                                        setShowCancelModal(false);
                                    }, style: {
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        textDecoration: 'underline',
                                    }, children: "\u0110\u00F3ng" })] }), _jsx("div", { style: { maxHeight: '400px', overflowY: 'auto' }, children: cancelRequests.map((r, idx) => (_jsxs("div", { className: "request-item", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsxs("strong", { children: ["B\u00E0n: ", r.tableName] }), _jsx("span", { style: { fontSize: 12, color: '#888' }, children: new Date(r.createdAt).toLocaleTimeString() })] }), _jsxs("div", { style: { margin: '8px 0', fontSize: 14 }, children: ["M\u00F3n: ", _jsx("b", { children: r.dishName }), " (x", r.quantity, ") ", _jsx("br", {}), "L\u00FD do: ", _jsx("i", { children: r.cancelReason || 'Không có lý do' })] }), _jsxs("div", { className: "req-actions", children: [_jsx("button", { className: "btn-approve", onClick: () => handleApprove(r.orderItemId), children: "\u0110\u1ED3ng \u00FD H\u1EE7y" }), _jsx("button", { className: "btn-reject", onClick: () => handleReject(r.orderItemId), children: "T\u1EEB ch\u1ED1i" })] })] }, idx))) })] }) }))] }));
}

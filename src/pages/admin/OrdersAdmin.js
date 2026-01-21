import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getOrders, deleteTable } from '../../api/order.api';
import { getTables } from '../../api/table.api';
import { getUsers } from '../../api/user.api';
import { getCurrentShift } from '../../api/shift.api';
export default function OrdersAdmin() {
    const [orders, setOrders] = useState([]);
    const [tables, setTables] = useState([]);
    const [users, setUsers] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    // Load toàn bộ dữ liệu cần thiết
    const loadData = async () => {
        try {
            setLoading(true);
            // Gọi song song các API để lấy dữ liệu map
            const [ordersRes, tablesRes, usersRes, shiftsRes] = await Promise.all([
                getOrders(),
                getTables(),
                getUsers().catch(() => []), // Tránh lỗi nếu chưa có API user
                getCurrentShift().catch(() => []), // Tránh lỗi nếu chưa có API shift
            ]);
            // Sắp xếp đơn mới nhất lên đầu
            const sortedOrders = Array.isArray(ordersRes)
                ? ordersRes.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime())
                : [];
            setOrders(sortedOrders);
            setTables(Array.isArray(tablesRes) ? tablesRes : []);
            setUsers(Array.isArray(usersRes) ? usersRes : []);
            setShifts(Array.isArray(shiftsRes) ? shiftsRes : []);
        }
        catch (error) {
            console.error('Lỗi tải dữ liệu đơn hàng:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    // --- HELPER FUNCTIONS ---
    // 1. Lấy tên bàn từ ID
    const getTableName = (tableId) => {
        const t = tables.find((item) => item.id === tableId);
        return t ? t.name : `Bàn #${tableId}`;
    };
    // 2. Lấy tên người tạo (Order -> Workshift -> User -> Username)
    const getCreatorName = (workshiftId) => {
        if (!workshiftId)
            return 'N/A';
        // Tìm ca làm việc
        const shift = shifts.find((s) => s.id === workshiftId);
        if (!shift)
            return `Ca #${workshiftId}`;
        // Tìm user trong ca đó
        const user = users.find((u) => u.id === shift.user);
        return user ? user.username : `User #${shift.user}`;
    };
    // 3. Xóa đơn
    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này? Dữ liệu sẽ mất vĩnh viễn.'))
            return;
        try {
            await deleteTable(id); // Gọi API xóa
            loadData(); // Tải lại trang
        }
        catch (error) {
            alert('Lỗi: Không thể xóa đơn hàng');
        }
    };
    // 4. Format Tiền & Ngày
    const formatVND = (amount = 0) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
    const formatDate = (dateString) => {
        if (!dateString)
            return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
        });
    };
    // 5. Badge trạng thái
    const getStatusBadge = (status) => {
        let colorClass = 'gray';
        let label = status;
        switch (status) {
            case 'open':
                colorClass = 'blue';
                label = 'Đang mở';
                break;
            case 'paid':
                colorClass = 'green';
                label = 'Đã TT';
                break;
            case 'completed':
                colorClass = 'green';
                label = 'Hoàn thành';
                break; // Status backend mới
            case 'cancel':
                colorClass = 'red';
                label = 'Hủy';
                break;
            case 'pending':
                colorClass = 'orange';
                label = 'Chờ';
                break;
        }
        return _jsx("span", { className: `badge ${colorClass}`, children: label });
    };
    return (_jsxs("div", { className: "admin-container", children: [_jsx("style", { children: `
        .admin-container { padding: 24px; background-color: #f4f6f8; min-height: 100vh; font-family: sans-serif; }
        h2 { margin: 0 0 24px 0; color: #212b36; font-size: 24px; font-weight: 700; }
        
        .card { background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #dfe3e8; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 16px; background: #fafafa; border-bottom: 2px solid #f0f0f0; color: #637381; font-weight: 600; font-size: 13px; text-transform: uppercase; }
        td { padding: 16px; border-bottom: 1px solid #f0f0f0; color: #212b36; vertical-align: middle; font-size: 14px; }
        tr:hover td { background-color: #f9fafb; }

        .badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge.blue { background: #e6f7ff; color: #1890ff; }
        .badge.green { background: #f6ffed; color: #52c41a; }
        .badge.orange { background: #fffbe6; color: #faad14; }
        .badge.red { background: #fff1f0; color: #f5222d; }
        .badge.gray { background: #f5f5f5; color: #595959; }

        .btn-delete { color: #ff4d4f; border: none; background: none; cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-delete:hover { text-decoration: underline; }
        
        .creator-tag { display: flex; align-items: center; gap: 6px; font-weight: 500; }
        .avatar-mini { width: 24px; height: 24px; background: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; }
      ` }), _jsx("h2", { children: "Qu\u1EA3n l\u00FD \u0110\u01A1n h\u00E0ng" }), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "B\u00E0n" }), _jsx("th", { children: "Ng\u01B0\u1EDDi t\u1EA1o" }), _jsx("th", { children: "M\u1EDF l\u00FAc" }), _jsx("th", { children: "\u0110\u00F3ng l\u00FAc" }), _jsx("th", { children: "T\u1ED5ng ti\u1EC1n" }), _jsx("th", { children: "Tr\u1EA1ng th\u00E1i" }), _jsx("th", { style: { textAlign: 'right' }, children: "H\u00E0nh \u0111\u1ED9ng" })] }) }), _jsxs("tbody", { children: [orders.map((order) => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("b", { children: ["#", order.id] }) }), _jsx("td", { style: { fontWeight: 500 }, children: getTableName(order.table) }), _jsx("td", { children: _jsxs("div", { className: "creator-tag", children: [_jsx("div", { className: "avatar-mini", children: getCreatorName(order.workshift).charAt(0).toUpperCase() }), getCreatorName(order.workshift)] }) }), _jsx("td", { children: formatDate(order.openedAt) }), _jsx("td", { children: order.closedAt ? formatDate(order.closedAt) : '-' }), _jsx("td", { style: { fontWeight: 700, color: '#212b36' }, children: order.totalPrice
                                                ? formatVND(order.totalPrice)
                                                : formatVND(0) }), _jsx("td", { children: getStatusBadge(order.status) }), _jsx("td", { style: { textAlign: 'right' }, children: _jsx("button", { className: "btn-delete", onClick: () => handleDelete(order.id), children: "X\u00F3a" }) })] }, order.id))), !loading && orders.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 8, style: { textAlign: 'center', padding: 40, color: '#999' }, children: "Ch\u01B0a c\u00F3 \u0111\u01A1n h\u00E0ng n\u00E0o" }) }))] })] }) })] }));
}

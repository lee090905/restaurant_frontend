import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getCurrentShift } from '../../api/shift.api';
import { getUsers } from '../../api/user.api'; // Đảm bảo bạn đã có API này
export default function ShiftsAdmin() {
    const [shifts, setShifts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Gọi song song API lấy Ca làm việc và Danh sách nhân viên
                const [shiftsRes, usersRes] = await Promise.all([
                    getCurrentShift(),
                    getUsers().catch(() => []), // Tránh lỗi nếu chưa có API users
                ]);
                // Sắp xếp ca mới nhất lên đầu
                const sortedShifts = Array.isArray(shiftsRes)
                    ? shiftsRes.sort((a, b) => new Date(b.starttime).getTime() -
                        new Date(a.starttime).getTime())
                    : [];
                setShifts(sortedShifts);
                setUsers(Array.isArray(usersRes) ? usersRes : []);
            }
            catch (error) {
                console.error('Lỗi tải dữ liệu ca làm việc:', error);
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    // Hàm helper: Lấy tên nhân viên từ ID
    const getUsername = (userId) => {
        if (!users.length)
            return `ID: ${userId}`;
        const user = users.find((u) => u.id === userId);
        return user ? user.username : `User #${userId}`;
    };
    // Hàm helper: Format ngày giờ
    const formatTime = (dateString) => {
        if (!dateString)
            return '--:--';
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
        });
    };
    return (_jsxs("div", { className: "admin-container", children: [_jsx("style", { children: `
        .admin-container { padding: 24px; background-color: #f4f6f8; min-height: 100vh; font-family: sans-serif; }
        h2 { margin: 0 0 24px 0; color: #212b36; font-size: 24px; font-weight: 700; }
        
        .card { background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #dfe3e8; overflow: hidden; }
        
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 16px; background: #fafafa; border-bottom: 2px solid #f0f0f0; color: #637381; font-weight: 600; font-size: 13px; text-transform: uppercase; }
        td { padding: 16px; border-bottom: 1px solid #f0f0f0; color: #212b36; vertical-align: middle; font-size: 14px; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background-color: #f9fafb; }
        
        /* Badges */
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .status-open { background: #e6f7ff; color: #1890ff; }
        .status-close { background: #f5f5f5; color: #595959; border: 1px solid #d9d9d9; }

        /* User Avatar Style */
        .user-tag { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; color: #374151; }
        .avatar-circle { 
          width: 32px; height: 32px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 14px; font-weight: bold; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      ` }), _jsx("h2", { children: "Qu\u1EA3n L\u00FD Ca L\u00E0m Vi\u1EC7c" }), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { width: 80 }, children: "ID" }), _jsx("th", { children: "Ng\u01B0\u1EDDi t\u1EA1o" }), _jsx("th", { children: "B\u1EAFt \u0111\u1EA7u" }), _jsx("th", { children: "K\u1EBFt th\u00FAc" }), _jsx("th", { children: "T\u1ED5ng gi\u1EDD" }), _jsx("th", { children: "Tr\u1EA1ng th\u00E1i" })] }) }), _jsxs("tbody", { children: [shifts.map((shift) => (_jsxs("tr", { children: [_jsxs("td", { style: { color: '#999' }, children: ["#", shift.id] }), _jsx("td", { children: _jsxs("div", { className: "user-tag", children: [_jsx("div", { className: "avatar-circle", children: getUsername(shift.user).charAt(0).toUpperCase() }), getUsername(shift.user)] }) }), _jsx("td", { children: formatTime(shift.starttime) }), _jsx("td", { children: shift.endtime ? (formatTime(shift.endtime)) : (_jsx("span", { style: {
                                                    color: '#1890ff',
                                                    fontStyle: 'italic',
                                                    fontWeight: 500,
                                                }, children: "Running..." })) }), _jsx("td", { children: shift.totalhours ? (_jsxs("strong", { style: { color: '#212b36' }, children: [Number(shift.totalhours).toFixed(2), "h"] })) : ('-') }), _jsx("td", { children: _jsx("span", { className: `status-badge ${shift.status === 'open' ? 'status-open' : 'status-close'}`, children: shift.status === 'open' ? 'Đang mở' : 'Đã đóng' }) })] }, shift.id))), !loading && shifts.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, style: { textAlign: 'center', padding: 40, color: '#999' }, children: "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u ca l\u00E0m vi\u1EC7c" }) }))] })] }) })] }));
}

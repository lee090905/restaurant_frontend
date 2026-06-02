import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser, } from '../../api/user.api';
export default function UsersAdmin() {
    const [users, setUsers] = useState([]);
    const [editing, setEditing] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin');
    const userLabelMap = {
        admin: 'Quản lý',
        staff: 'Nhân viên',
    };
    const isUsernameExists = users.some((u) => u.username.trim() === username.trim());
    const disableCreate = !username || !password || isUsernameExists;
    const loadUsers = async () => {
        const res = await getUsers();
        setUsers(res);
    };
    useEffect(() => {
        loadUsers();
    }, []);
    const handleCreate = async () => {
        if (!username || !password)
            return;
        await createUser({ username, password, role });
        setUsername('');
        setPassword('');
        setRole('staff');
        loadUsers();
    };
    const onEdit = (u) => {
        setEditing(u);
        setUsername(u.username);
        setRole(u.role);
        setPassword('');
    };
    const onSave = async () => {
        if (!editing)
            return;
        await updateUser({
            id: editing.id,
            username,
            role,
            ...(password ? { password } : {}),
        });
        setEditing(null);
        setUsername('');
        setPassword('');
        setRole('staff');
        loadUsers();
    };
    const onDelete = async (id) => {
        if (!confirm('Xóa user này?'))
            return;
        await deleteUser(id);
        loadUsers();
    };
    return (_jsxs("div", { className: "admin-container", children: [_jsx("style", { children: `
        .admin-container { padding: 24px; background-color: #f4f6f8; min-height: 100vh; font-family: sans-serif; }
        h2 { margin-top: 0; color: #212b36; font-size: 24px; margin-bottom: 24px; }
        
        /* Form Card */
        .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #dfe3e8; margin-bottom: 24px; }
        .form-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        
        input, select { padding: 10px 14px; border: 1px solid #dfe3e8; border-radius: 8px; outline: none; transition: 0.2s; font-size: 14px; }
        input:focus, select:focus { border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24,144,255,0.2); }
        
        button { padding: 10px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 14px; }
        .btn-primary { background: #1890ff; color: white; }
        .btn-primary:hover { background: #096dd9; }
        .btn-primary:disabled { background: #d9d9d9; color: #8c8c8c; cursor: not-allowed; }
        .btn-danger { background: #ff4d4f; color: white; margin-left: 8px; }
        .btn-cancel { background: #f5f5f5; color: #595959; }

        /* Table */
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { text-align: left; padding: 16px; background: #fafafa; border-bottom: 2px solid #f0f0f0; color: #595959; font-weight: 600; }
        td { padding: 16px; border-bottom: 1px solid #f0f0f0; color: #262626; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        .action-btn { font-size: 13px; padding: 6px 12px; margin-right: 6px; background: #e6f7ff; color: #1890ff; }
        .action-btn:hover { background: #bae7ff; }
        .action-btn.delete { background: #fff1f0; color: #ff4d4f; }
        .action-btn.delete:hover { background: #ffccc7; }
      ` }), _jsx("h2", { children: "Qu\u1EA3n l\u00FD ng\u01B0\u1EDDi d\u00F9ng" }), _jsx("div", { className: "card", children: _jsxs("div", { className: "form-row", children: [_jsx("input", { value: username, onChange: (e) => setUsername(e.target.value), placeholder: "Username" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: editing ? 'Mật khẩu mới (nếu đổi)' : 'Mật khẩu' }), _jsxs("select", { value: role, onChange: (e) => setRole(e.target.value), children: [_jsx("option", { value: "staff", children: "Staff" }), _jsx("option", { value: "admin", children: "Admin" })] }), editing ? (_jsxs(_Fragment, { children: [_jsx("button", { className: "btn-primary", onClick: onSave, children: "L\u01B0u thay \u0111\u1ED5i" }), _jsx("button", { className: "btn-cancel", onClick: () => setEditing(null), children: "H\u1EE7y" })] })) : (_jsx("button", { className: "btn-primary", onClick: handleCreate, disabled: disableCreate, children: "+ Th\u00EAm ng\u01B0\u1EDDi d\u00F9ng" }))] }) }), _jsx("div", { className: "card", style: { padding: 0, overflow: 'hidden' }, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Username" }), _jsx("th", { children: "Vai tr\u00F2" }), _jsx("th", { style: { width: '180px' }, children: "H\u00E0nh \u0111\u1ED9ng" })] }) }), _jsxs("tbody", { children: [users.map((u) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("b", { children: u.username }) }), _jsx("td", { children: _jsx("span", { style: {
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    background: u.role === 'admin' ? '#fff0f6' : '#f6ffed',
                                                    color: u.role === 'admin' ? '#c41d7f' : '#389e0d',
                                                }, children: userLabelMap[u.role] || u.role }) }), _jsxs("td", { children: [_jsx("button", { className: "action-btn", onClick: () => onEdit(u), children: "S\u1EEDa" }), _jsx("button", { className: "action-btn delete", onClick: () => onDelete(u.id), children: "X\u00F3a" })] })] }, u.id))), users.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 3, style: {
                                            textAlign: 'center',
                                            color: '#999',
                                            padding: '30px',
                                        }, children: "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u ng\u01B0\u1EDDi d\u00F9ng" }) }))] })] }) })] }));
}

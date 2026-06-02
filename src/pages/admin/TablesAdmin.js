import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getTables, createTable, updateTable, deleteTable, } from '../../api/table.api';
export default function TablesAdmin() {
    const [tables, setTables] = useState([]);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [area, setArea] = useState('');
    const loadTables = async () => {
        const res = await getTables();
        setTables(res);
    };
    useEffect(() => {
        loadTables();
    }, []);
    const handleCreate = async () => {
        if (!name)
            return;
        await createTable({ name, area: Number(area) });
        setName('');
        setArea('');
        loadTables();
    };
    const onEdit = (t) => {
        setEditing(t);
        setName(t.name);
    };
    const onSave = async () => {
        if (!editing)
            return;
        await updateTable(editing.id, { name });
        setEditing(null);
        setName('');
        loadTables();
    };
    const onDelete = async (id) => {
        if (!confirm('Xóa bàn này?'))
            return;
        await deleteTable(id);
        loadTables();
    };
    return (_jsxs("div", { className: "admin-container", children: [_jsx("style", { children: `
        .admin-container { padding: 24px; background-color: #f4f6f8; min-height: 100vh; font-family: sans-serif; }
        h2 { margin-top: 0; color: #212b36; font-size: 24px; margin-bottom: 24px; }
        .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #dfe3e8; margin-bottom: 24px; }
        .form-row { display: flex; gap: 12px; align-items: center; }
        input { padding: 10px 14px; border: 1px solid #dfe3e8; border-radius: 8px; outline: none; font-size: 14px; }
        input:focus { border-color: #1890ff; }
        button { padding: 10px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-size: 14px; }
        .btn-primary { background: #1890ff; color: white; }
        .btn-cancel { background: #f5f5f5; color: #595959; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 16px; text-align: left; border-bottom: 1px solid #f0f0f0; }
        th { background: #fafafa; font-weight: 600; color: #595959; }
        .action-btn { padding: 6px 12px; margin-right: 6px; background: #e6f7ff; color: #1890ff; }
        .action-btn.delete { background: #fff1f0; color: #ff4d4f; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e6f7ff; color: #1890ff; }
      ` }), _jsx("h2", { children: "Qu\u1EA3n l\u00FD b\u00E0n" }), _jsx("div", { className: "card", children: editing ? (_jsxs("div", { className: "form-row", children: [_jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "T\u00EAn b\u00E0n m\u1EDBi" }), _jsx("button", { className: "btn-primary", onClick: onSave, children: "L\u01B0u s\u1EEDa \u0111\u1ED5i" }), _jsx("button", { className: "btn-cancel", onClick: () => setEditing(null), children: "H\u1EE7y" })] })) : (_jsxs("div", { className: "form-row", children: [_jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "T\u00EAn b\u00E0n" }), _jsx("input", { type: "number", value: area, onChange: (e) => setArea(e.target.value), placeholder: "Khu v\u1EF1c (S\u1ED1)" }), _jsx("button", { className: "btn-primary", onClick: handleCreate, children: "+ Th\u00EAm b\u00E0n m\u1EDBi" })] })) }), _jsx("div", { className: "card", style: { padding: 0, overflow: 'hidden' }, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "T\u00EAn b\u00E0n" }), _jsx("th", { children: "Tr\u1EA1ng th\u00E1i" }), _jsx("th", { style: { width: '180px' }, children: "H\u00E0nh \u0111\u1ED9ng" })] }) }), _jsxs("tbody", { children: [tables.map((t) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("b", { children: t.name }) }), _jsx("td", { children: _jsx("span", { className: "status-badge", children: t.status || 'Trống' }) }), _jsxs("td", { children: [_jsx("button", { className: "action-btn", onClick: () => onEdit(t), children: "S\u1EEDa" }), _jsx("button", { className: "action-btn delete", onClick: () => onDelete(t.id), children: "X\u00F3a" })] })] }, t.id))), tables.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 3, style: {
                                            textAlign: 'center',
                                            padding: '30px',
                                            color: '#999',
                                        }, children: "Ch\u01B0a c\u00F3 b\u00E0n n\u00E0o" }) }))] })] }) })] }));
}

import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getActiveDishes, createDishes, updateDishes, deleteDishes, } from '../../api/dish.api';
export default function DishesAdmin() {
    const [dishes, setDishes] = useState([]);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const categories = [
        { key: 'appetizer', label: 'Khai vị' },
        { key: 'Salad', label: 'Salad' },
        { key: 'Grilled', label: 'Món nướng' },
        { key: 'Fried', label: 'Món chiên' },
        { key: 'Stir-fried', label: 'Món xào' },
        { key: 'Steamed/Boiled', label: 'Món hấp / luộc' },
        { key: 'Hotpot', label: 'Lẩu' },
        { key: 'Seafood', label: 'Hải sản' },
        { key: 'Specials', label: 'Món đặc biệt' },
        { key: 'Drinks', label: 'Đồ uống' },
        { key: 'inactive', label: 'Ngừng bán' },
    ];
    const categoryLabelMap = {
        appetizer: 'Khai vị',
        Salad: 'Salad',
        Grilled: 'Món nướng',
        Fried: 'Món chiên',
        'Stir-fried': 'Món xào',
        'Steamed/Boiled': 'Món hấp / luộc',
        Hotpot: 'Lẩu',
        Seafood: 'Hải sản',
        Specials: 'Món đặc biệt',
        Drinks: 'Đồ uống',
        inactive: 'Ngừng bán',
    };
    const loadTables = async () => {
        const res = await getActiveDishes();
        setDishes(res);
    };
    useEffect(() => {
        loadTables();
    }, []);
    const handleCreate = async () => {
        if (!name)
            return;
        await createDishes({ name, price: Number(price), category });
        setName('');
        setPrice('');
        // Giữ nguyên logic gốc của bạn (dù chỗ này có thể bạn muốn setCategory(''))
        setCategory;
        loadTables();
    };
    const onEdit = (t) => {
        setEditing(t);
        setName(t.name);
    };
    const onSave = async () => {
        if (!editing)
            return;
        await updateDishes(editing.id, { name });
        setEditing(null);
        setName('');
        loadTables();
    };
    const onDelete = async (id) => {
        if (!confirm('Xóa món này?'))
            return;
        await deleteDishes(id);
        loadTables();
    };
    // Helper format tiền
    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(Number(amount));
    return (_jsxs("div", { className: "admin-container", children: [_jsx("style", { children: `
        .admin-container { padding: 24px; background-color: #f4f6f8; min-height: 100vh; font-family: sans-serif; }
        h2 { margin-top: 0; color: #212b36; font-size: 24px; margin-bottom: 24px; }
        .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #dfe3e8; margin-bottom: 24px; }
        .form-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
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
      ` }), _jsx("h2", { children: "Qu\u1EA3n l\u00FD m\u00F3n \u0103n" }), _jsx("div", { className: "card", children: _jsxs("div", { className: "form-row", children: [_jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "T\u00EAn m\u00F3n" }), _jsx("input", { type: "number", value: price, onChange: (e) => setPrice(e.target.value), placeholder: "Gi\u00E1 (VN\u0110)" }), _jsx("input", { list: "category-list", placeholder: "Danh m\u1EE5c", onChange: (e) => {
                                const found = categories.find((c) => c.label === e.target.value);
                                if (found)
                                    setCategory(found.key);
                            } }), _jsx("datalist", { id: "category-list", children: categories.map((c) => (_jsx("option", { value: c.label }, c.key))) }), editing ? (_jsxs(_Fragment, { children: [_jsx("button", { className: "btn-primary", onClick: onSave, children: "L\u01B0u m\u00F3n" }), _jsx("button", { className: "btn-cancel", onClick: () => setEditing(null), children: "H\u1EE7y" })] })) : (_jsx("button", { className: "btn-primary", onClick: handleCreate, children: "+ Th\u00EAm m\u00F3n m\u1EDBi" }))] }) }), _jsx("div", { className: "card", style: { padding: 0, overflow: 'hidden' }, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "T\u00EAn m\u00F3n" }), _jsx("th", { children: "Gi\u00E1" }), _jsx("th", { children: "Danh m\u1EE5c" }), _jsx("th", { children: "Tr\u1EA1ng th\u00E1i" }), _jsx("th", { style: { width: '180px' }, children: "H\u00E0nh \u0111\u1ED9ng" })] }) }), _jsxs("tbody", { children: [dishes.map((t) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("b", { children: t.name }) }), _jsx("td", { style: { color: '#cf1322', fontWeight: 500 }, children: formatVND(t.price) }), _jsx("td", { children: categoryLabelMap[t.category] || t.category }), _jsx("td", { children: _jsx("span", { style: {
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    background: t.status === 'active' ? '#fff1f0' : '#f6ffed',
                                                    color: t.status === 'active' ? '#cf1322' : '#389e0d',
                                                }, children: t.status === 'active' ? 'Ngừng bán' : 'Đang bán' }) }), _jsxs("td", { children: [_jsx("button", { className: "action-btn", onClick: () => onEdit(t), children: "S\u1EEDa" }), _jsx("button", { className: "action-btn delete", onClick: () => onDelete(t.id), children: "X\u00F3a" })] })] }, t.id))), dishes.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, style: {
                                            textAlign: 'center',
                                            padding: '30px',
                                            color: '#999',
                                        }, children: "Ch\u01B0a c\u00F3 m\u00F3n \u0103n n\u00E0o" }) }))] })] }) })] }));
}

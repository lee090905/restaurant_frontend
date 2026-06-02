import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function SplitMergeModal({ mode, currentTableId, availableTables, currentItems, onClose, onConfirmMerge, onConfirmSplit }) {
    const [selectedTargetTable, setSelectedTargetTable] = useState(null);
    const [itemsToMove, setItemsToMove] = useState({});
    const formatMoney = (amount) => amount.toLocaleString('vi-VN');
    const handleIncreaseMove = (itemId, maxQty) => {
        setItemsToMove(prev => {
            const current = prev[itemId] || 0;
            if (current >= maxQty)
                return prev;
            return { ...prev, [itemId]: current + 1 };
        });
    };
    const handleDecreaseMove = (itemId) => {
        setItemsToMove(prev => {
            const current = prev[itemId] || 0;
            if (current <= 0)
                return prev;
            return { ...prev, [itemId]: current - 1 };
        });
    };
    const handleConfirm = () => {
        if (!selectedTargetTable) {
            alert('Vui lòng chọn bàn đích!');
            return;
        }
        if (mode === 'merge') {
            if (window.confirm(`Xác nhận gộp toàn bộ bàn ${currentTableId} sang bàn ${selectedTargetTable}?`)) {
                onConfirmMerge(selectedTargetTable);
            }
        }
        else {
            const payload = Object.entries(itemsToMove)
                .filter(([_, qty]) => qty > 0)
                .map(([id, qty]) => ({ id: Number(id), quantity: qty }));
            if (payload.length === 0) {
                alert('Vui lòng chọn ít nhất 1 món để chuyển!');
                return;
            }
            if (window.confirm(`Xác nhận tách ${payload.length} món sang bàn ${selectedTargetTable}?`)) {
                onConfirmSplit(selectedTargetTable, payload);
            }
        }
    };
    return (_jsx("div", { className: "modal-overlay", style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsxs("div", { className: "modal-content", style: { background: '#fff', width: 600, borderRadius: 8, padding: 20, maxHeight: '90vh', overflowY: 'auto' }, children: [_jsx("h3", { style: { marginTop: 0 }, children: mode === 'merge' ? 'Gộp Bàn' : 'Tách Bàn / Chuyển Món' }), _jsxs("p", { children: ["B\u00E0n hi\u1EC7n t\u1EA1i: ", _jsxs("strong", { children: ["B\u00E0n ", currentTableId] })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 20 }, children: [_jsx("label", { style: { display: 'block', fontWeight: 'bold', marginBottom: 8 }, children: "Ch\u1ECDn b\u00E0n \u0111\u00EDch:" }), _jsxs("select", { className: "form-select", style: { width: '100%', padding: 8 }, value: selectedTargetTable || '', onChange: (e) => setSelectedTargetTable(Number(e.target.value)), children: [_jsx("option", { value: "", children: "-- Ch\u1ECDn b\u00E0n --" }), availableTables.filter(t => t.id !== currentTableId).map(t => (_jsxs("option", { value: t.id, children: ["B\u00E0n ", t.id, " (", t.name, ") - Tr\u1EA1ng th\u00E1i: ", t.status] }, t.id)))] })] }), mode === 'split' && (_jsxs("div", { className: "split-items-section", style: { border: '1px solid #ddd', borderRadius: 6, padding: 10, marginBottom: 20 }, children: [_jsx("h4", { style: { margin: '0 0 10px 0' }, children: "Ch\u1ECDn m\u00F3n c\u1EA7n chuy\u1EC3n:" }), currentItems.length === 0 ? (_jsx("p", { style: { color: '#888', fontStyle: 'italic' }, children: "Kh\u00F4ng c\u00F3 m\u00F3n n\u00E0o \u0111\u1EC3 chuy\u1EC3n." })) : (_jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: 14 }, children: [_jsx("thead", { children: _jsxs("tr", { style: { background: '#f5f5f5' }, children: [_jsx("th", { style: { textAlign: 'left', padding: 8 }, children: "M\u00F3n" }), _jsx("th", { style: { textAlign: 'center', padding: 8 }, children: "\u0110\u00E3 g\u1ECDi" }), _jsx("th", { style: { textAlign: 'center', padding: 8 }, children: "Chuy\u1EC3n \u0111i" })] }) }), _jsx("tbody", { children: currentItems.map(item => (_jsxs("tr", { style: { borderBottom: '1px solid #eee' }, children: [_jsx("td", { style: { padding: 8 }, children: item.name }), _jsx("td", { style: { padding: 8, textAlign: 'center' }, children: item.quantity }), _jsx("td", { style: { padding: 8, textAlign: 'center' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }, children: [_jsx("button", { className: "btn btn-outline", style: { padding: '2px 8px' }, onClick: () => handleDecreaseMove(item.dish_id), children: "-" }), _jsx("span", { children: itemsToMove[item.dish_id] || 0 }), _jsx("button", { className: "btn btn-outline", style: { padding: '2px 8px' }, onClick: () => handleIncreaseMove(item.dish_id, item.quantity), children: "+" })] }) })] }, item.dish_id))) })] }))] })), mode === 'merge' && (_jsx("div", { style: { padding: 15, background: '#e3f2fd', color: '#0d47a1', borderRadius: 6, marginBottom: 20 }, children: _jsxs("p", { style: { margin: 0 }, children: ["To\u00E0n b\u1ED9 ", _jsxs("strong", { children: [currentItems.length, " m\u00F3n"] }), " c\u1EE7a b\u00E0n n\u00E0y s\u1EBD \u0111\u01B0\u1EE3c chuy\u1EC3n sang b\u00E0n \u0111\u00EDch. B\u00E0n hi\u1EC7n t\u1EA1i s\u1EBD \u0111\u01B0\u1EE3c \u0111\u00E1nh d\u1EA5u l\u00E0 Tr\u1ED1ng."] }) })), _jsxs("div", { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' }, children: [_jsx("button", { className: "btn btn-outline", onClick: onClose, children: "H\u1EE7y" }), _jsx("button", { className: "btn btn-primary", onClick: handleConfirm, children: "X\u00E1c nh\u1EADn" })] })] }) }));
}

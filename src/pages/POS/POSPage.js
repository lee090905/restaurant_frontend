import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import ShiftPage from './ShiftPage';
import './POSPage.css';
import { getActiveDishes } from '../../index';
import axiosClient from '../../api/axiosClient';
import { TableGrid } from '../../components/TableGrid';
// Nhập các Hooks mới
import { useTablesQuery, useTableOrderQuery } from '../../api/queries/table.queries';
import { useAddItemsMutation, useCancelItemMutation, useSplitMergeMutation } from '../../api/mutations/order.mutations';
// Nhập các Component mới
import { PaymentQRCode } from '../../components/PaymentQRCode';
import { ProvisionalReceipt } from '../../components/ProvisionalReceipt';
import { SplitMergeModal } from '../../components/SplitMergeModal';
const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};
export default function POSPage() {
    const [dishes, setDishes] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    // State quản lý Bàn & Order
    const [selectedTableId, setSelectedTableId] = useState(null);
    // TanStack Queries (Polling Real-time & Caching)
    const { data: tables = [], isLoading: loadingTables } = useTablesQuery();
    const { data: orderData, isLoading: loadingOrder } = useTableOrderQuery(selectedTableId);
    const orderId = orderData?.id || null;
    const confirmedItems = orderData?.items || [];
    // TanStack Mutations (Optimistic Updates)
    const addItemsMutation = useAddItemsMutation(selectedTableId);
    const cancelItemMutation = useCancelItemMutation(selectedTableId);
    const splitMergeMutation = useSplitMergeMutation(selectedTableId);
    // States Giao diện (Modals)
    const [cancelItem, setCancelItem] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [selectedOrderItemId, setSelectedOrderItemId] = useState(null);
    const [inlineDish, setInlineDish] = useState(null);
    const [inlineQty, setInlineQty] = useState(1);
    const [inlineNote, setInlineNote] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);
    const [draftItems, setDraftItems] = useState([]);
    // State cho Tách / Gộp
    const [showSplitMerge, setShowSplitMerge] = useState(null);
    // Tham chiếu để In hóa đơn tạm tính
    const printReceiptRef = useRef(null);
    const [activeArea, setActiveArea] = useState(1);
    const [showShift, setShowShift] = useState(false);
    const calcTotal = (items) => items.reduce((s, i) => {
        if (i.status === 'cancelled')
            return s;
        return s + i.price * i.quantity;
    }, 0);
    const total = calcTotal(confirmedItems);
    const categories = Array.from(new Set(dishes.map((d) => d.category).filter(Boolean)));
    const filteredDishes = activeCategory ? dishes.filter((d) => d.category === activeCategory) : dishes;
    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            setShowShift(true);
            return;
        }
        getActiveDishes().then(setDishes);
    }, []);
    const openTable = (table) => {
        const tableId = table?.id;
        if (!tableId)
            return;
        setSelectedTableId(tableId);
        setDraftItems([]);
    };
    const addDish = (dish) => {
        setInlineDish(dish);
        setInlineQty(1);
        setInlineNote('');
    };
    const confirmAddItems = () => {
        if (!selectedTableId || draftItems.length === 0)
            return;
        const currentUserId = sessionStorage.getItem('userId');
        if (!currentUserId) {
            alert('⚠️ Bạn chưa chấm công!');
            setShowShift(true);
            return;
        }
        // Gọi Mutation (Thực hiện Optimistic Update ngay lập tức)
        addItemsMutation.mutate({ orderId, items: draftItems });
        setDraftItems([]);
    };
    const buildInvoiceItems = (items) => {
        const map = new Map();
        for (const item of items) {
            const key = `${item.dish_id}_${item.note || ''}_${item.status || 'pending'}`;
            const realId = item.id || item.order_item_id || item.orderItemId || item._id;
            if (map.has(key)) {
                const existed = map.get(key);
                existed.quantity += item.quantity;
                if (realId)
                    existed.orderItemIds.push(realId);
            }
            else {
                map.set(key, {
                    dish_id: item.dish_id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    note: item.note,
                    status: item.status || 'pending',
                    orderItemIds: realId ? [realId] : [],
                });
            }
        }
        return Array.from(map.values());
    };
    const invoiceItems = buildInvoiceItems(confirmedItems);
    const handlePay = async () => {
        if (!orderId || !selectedTableId)
            return;
        try {
            await axiosClient.post('/orders/checkout', {
                orderitem_id: null,
                order_id: orderId,
                table_id: selectedTableId,
            });
            setSelectedTableId(null);
            setDraftItems([]);
        }
        catch (error) {
            alert("Lỗi thanh toán");
        }
    };
    const handlePrintProvisional = () => {
        const content = printReceiptRef.current?.innerHTML;
        if (content) {
            const win = window.open('', '_blank');
            win?.document.write(`
        <html>
          <head>
            <title>In Tạm Tính</title>
            <style>
              body { margin: 0; padding: 0; }
              @media print {
                @page { margin: 0; }
              }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
            win?.document.close();
            win?.focus();
            win?.print();
            win?.close();
        }
    };
    const handleLogout = () => {
        sessionStorage.removeItem('authToken');
        window.location.href = '/login';
    };
    return (_jsxs("div", { className: "pos-container", children: [_jsx("div", { style: { display: 'none' }, children: _jsx(ProvisionalReceipt, { ref: printReceiptRef, tableId: selectedTableId || 'N/A', orderId: orderId, cashier: sessionStorage.getItem('username') || 'N/A', items: invoiceItems.filter(i => i.status !== 'cancelled'), total: total }) }), _jsxs("header", { className: "pos-header", children: [_jsx("div", { className: "area-tabs", children: [1, 2, 3].map((area) => (_jsxs("button", { className: `btn ${activeArea === area ? 'btn-active' : 'btn-outline'}`, onClick: () => setActiveArea(area), children: ["Khu v\u1EF1c ", area] }, area))) }), _jsxs("div", { className: "header-right", children: [_jsxs("div", { className: "user-info", children: [_jsx("span", { role: "img", "aria-label": "user", children: "\uD83D\uDC64" }), sessionStorage.getItem('username') || 'N/A'] }), _jsx("button", { className: "btn btn-outline", onClick: () => setShowShift(true), children: "Ch\u1EA5m c\u00F4ng" }), _jsx("button", { className: "btn btn-danger", onClick: handleLogout, children: "\u0110\u0103ng xu\u1EA5t" })] })] }), !selectedTableId ? (_jsx("div", { className: "table-selection-view", children: loadingTables ? (_jsx("div", { children: "\u0110ang t\u1EA3i s\u01A1 \u0111\u1ED3 b\u00E0n..." })) : (_jsx(TableGrid, { tables: tables.filter(String).filter((t) => t.area === activeArea), onSelect: openTable })) })) : (_jsxs("div", { className: "ordering-layout", children: [_jsxs("div", { className: "menu-section", children: [inlineDish && (_jsxs("div", { className: "inline-edit-card", children: [_jsx("h4", { style: { margin: '0 0 10px 0' }, children: inlineDish.name }), _jsxs("div", { className: "qty-control", children: [_jsx("button", { className: "qty-btn", onClick: () => setInlineQty((q) => Math.max(1, q - 1)), children: "-" }), _jsx("span", { className: "qty-display", children: inlineQty }), _jsx("button", { className: "qty-btn", onClick: () => setInlineQty((q) => q + 1), children: "+" })] }), _jsx("input", { type: "text", className: "form-input", placeholder: "Ghi ch\u00FA (\u00EDt \u0111\u00E1, kh\u00F4ng h\u00E0nh...)", value: inlineNote, onChange: (e) => setInlineNote(e.target.value), autoFocus: true }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 15 }, children: [_jsx("button", { className: "btn btn-primary", style: { flex: 1 }, onClick: () => {
                                                    setDraftItems((prev) => {
                                                        const existed = prev.find((i) => i.dish_id === inlineDish.id && (i.note || '') === (inlineNote || ''));
                                                        if (existed)
                                                            return prev.map((i) => i === existed ? { ...i, quantity: i.quantity + inlineQty } : i);
                                                        return [...prev, { dish_id: inlineDish.id, name: inlineDish.name, price: inlineDish.price, quantity: inlineQty, note: inlineNote }];
                                                    });
                                                    setInlineDish(null);
                                                }, children: "Th\u00EAm v\u00E0o \u0111\u01A1n" }), _jsx("button", { className: "btn btn-outline", style: { flex: 1 }, onClick: () => setInlineDish(null), children: "H\u1EE7y" })] })] })), _jsxs("div", { className: "category-bar", children: [_jsx("button", { className: `btn ${activeCategory === null ? 'btn-active' : 'btn-outline'}`, onClick: () => setActiveCategory(null), children: "T\u1EA5t c\u1EA3" }), categories.map((c) => (_jsx("button", { className: `btn ${activeCategory === c ? 'btn-active' : 'btn-outline'}`, onClick: () => setActiveCategory(c), children: c }, c)))] }), _jsx("div", { className: "dish-grid", children: filteredDishes.map((d) => (_jsxs("div", { className: "dish-card", onClick: () => addDish(d), children: [_jsx("div", { className: "dish-name", children: d.name }), _jsx("div", { className: "dish-price", children: formatMoney(d.price) })] }, d.id))) })] }), _jsxs("div", { className: "cart-sidebar", children: [_jsxs("div", { className: "cart-header", style: { display: 'flex', justifyContent: 'space-between' }, children: [_jsxs("h3", { children: ["B\u00E0n #", selectedTableId, " ", loadingOrder && _jsx("small", { children: "(\u0110ang t\u1EA3i...)" })] }), orderId && (_jsxs("div", { children: [_jsx("button", { className: "btn btn-outline", style: { padding: '4px 8px', marginRight: 4, fontSize: 12 }, onClick: () => setShowSplitMerge('split'), children: "T\u00E1ch" }), _jsx("button", { className: "btn btn-outline", style: { padding: '4px 8px', fontSize: 12 }, onClick: () => setShowSplitMerge('merge'), children: "G\u1ED9p" })] }))] }), _jsxs("div", { className: "cart-items", children: [invoiceItems.map((item, idx) => {
                                        const isCancelled = item.status === 'cancelled';
                                        return (_jsxs("div", { className: "cart-item-row", style: { background: isCancelled ? '#f5f5f5' : '#f0fdf4', opacity: isCancelled ? 0.6 : 1 }, children: [_jsxs("div", { className: "item-top", children: [_jsxs("span", { className: "item-name", style: { textDecoration: isCancelled ? 'line-through' : 'none' }, children: [isCancelled ? '❌' : '✅', " ", item.name, " ", _jsxs("small", { children: ["(x", item.quantity, ")"] })] }), _jsx("span", { className: "item-total", style: { textDecoration: isCancelled ? 'line-through' : 'none' }, children: formatMoney(item.price * item.quantity) })] }), item.note && _jsxs("div", { style: { fontSize: 12, color: '#666', marginTop: 4 }, children: ["Ghi ch\u00FA: ", item.note] }), _jsxs("div", { className: "item-actions", children: [!isCancelled && (_jsx("button", { className: "btn btn-danger", style: { padding: '4px 8px', fontSize: 12 }, onClick: () => {
                                                                setCancelItem(item);
                                                                setSelectedOrderItemId(item.orderItemIds?.[0] || null);
                                                            }, children: "H\u1EE7y" })), isCancelled && _jsx("span", { style: { fontSize: 11, color: '#d32f2f', fontWeight: 'bold' }, children: "\u0110\u00E3 h\u1EE7y" })] })] }, `conf-${idx}`));
                                    }), draftItems.map((item, idx) => (_jsxs("div", { className: "cart-item-row", style: { background: '#fff' }, children: [_jsxs("div", { className: "item-top", children: [_jsxs("span", { className: "item-name", children: ["\u23F3 ", item.name, " ", _jsxs("small", { children: ["(x", item.quantity, ")"] })] }), _jsx("span", { className: "item-total", children: formatMoney(item.price * item.quantity) })] }), _jsx("input", { type: "text", className: "input-note", placeholder: "Ghi ch\u00FA...", value: item.note || '', onChange: (e) => {
                                                    const newItems = [...draftItems];
                                                    newItems[idx].note = e.target.value;
                                                    setDraftItems(newItems);
                                                } }), _jsx("div", { className: "item-actions", children: _jsx("button", { className: "btn btn-danger", style: { padding: '4px 8px', fontSize: 12 }, onClick: () => setDraftItems((prev) => prev.filter((_, i) => i !== idx)), children: "X\u00F3a" }) })] }, `draft-${idx}`))), draftItems.length === 0 && invoiceItems.length === 0 && (_jsx("div", { style: { padding: 20, textAlign: 'center', color: '#888', fontStyle: 'italic' }, children: "Ch\u01B0a c\u00F3 m\u00F3n n\u00E0o" }))] }), _jsxs("div", { className: "cart-footer", children: [_jsx("button", { className: "btn btn-primary btn-block", onClick: confirmAddItems, disabled: draftItems.length === 0 || addItemsMutation.isLoading, children: addItemsMutation.isLoading ? 'Đang gửi...' : `Xác nhận gọi món (${draftItems.length})` }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 10 }, children: [_jsx("button", { className: "btn btn-outline btn-block", onClick: handlePrintProvisional, disabled: !orderId, style: { flex: 1, marginTop: 0 }, children: "In T\u1EA1m t\u00EDnh" }), _jsx("button", { className: "btn btn-outline btn-block", onClick: () => setShowInvoice(true), disabled: !orderId, style: { flex: 1, marginTop: 0 }, children: "Thanh to\u00E1n" })] }), _jsx("button", { className: "btn btn-outline btn-block", onClick: () => setSelectedTableId(null), style: { marginTop: 10 }, children: "\u2190 Quay l\u1EA1i s\u01A1 \u0111\u1ED3 b\u00E0n" })] })] })] })), showInvoice && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", style: { width: 800, display: 'flex', gap: 20 }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("h3", { children: "Chi ti\u1EBFt h\u00F3a \u0111\u01A1n" }), _jsxs("table", { className: "modal-invoice-table", style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "M\u00F3n" }), _jsx("th", { style: { textAlign: 'center' }, children: "SL" }), _jsx("th", { style: { textAlign: 'right' }, children: "Th\u00E0nh ti\u1EC1n" })] }) }), _jsx("tbody", { children: invoiceItems.filter(i => i.status !== 'cancelled').map((i) => (_jsxs("tr", { children: [_jsxs("td", { children: [i.name, " ", i.note && _jsxs("div", { style: { fontSize: 11, color: '#888' }, children: ["(", i.note, ")"] })] }), _jsx("td", { align: "center", children: i.quantity }), _jsx("td", { align: "right", children: Number(i.price * i.quantity).toLocaleString() })] }, i.dish_id))) })] }), _jsxs("div", { className: "invoice-total", children: ["T\u1ED5ng c\u1ED9ng: ", formatMoney(total)] })] }), _jsxs("div", { style: { width: 300, borderLeft: '1px solid #ddd', paddingLeft: 20 }, children: [_jsx(PaymentQRCode, { amount: total, orderId: orderId || 'NEW' }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 20 }, children: [_jsx("button", { className: "btn btn-success btn-block", style: { background: 'var(--success-color)', color: '#fff' }, onClick: async () => {
                                                if (!window.confirm('Xác nhận khách đã thanh toán?'))
                                                    return;
                                                await handlePay();
                                                setShowInvoice(false);
                                            }, children: "X\u00E1c nh\u1EADn Thu ti\u1EC1n" }), _jsx("button", { className: "btn btn-outline btn-block", onClick: () => setShowInvoice(false), children: "\u0110\u00F3ng" })] })] })] }) })), showSplitMerge && (_jsx(SplitMergeModal, { mode: showSplitMerge, currentTableId: selectedTableId, availableTables: tables, currentItems: invoiceItems, onClose: () => setShowSplitMerge(null), onConfirmMerge: (targetTableId) => {
                    splitMergeMutation.mutate({ mode: 'merge', targetTableId, items: invoiceItems });
                    setShowSplitMerge(null);
                    setSelectedTableId(null); // Quay lại màn chọn bàn
                }, onConfirmSplit: (targetTableId, itemsToMove) => {
                    splitMergeMutation.mutate({ mode: 'split', targetTableId, items: itemsToMove });
                    setShowSplitMerge(null);
                } })), cancelItem && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsx("h3", { children: "X\u00E1c nh\u1EADn h\u1EE7y m\u00F3n" }), _jsx("div", { className: "form-group", children: _jsx("label", { style: { fontWeight: 'bold', display: 'block', marginBottom: 5 }, children: cancelItem.name }) }), _jsx("div", { className: "form-group", children: _jsx("input", { className: "form-input", placeholder: "L\u00FD do h\u1EE7y (Kh\u00E1ch \u0111\u1ED5i \u00FD...)", value: cancelReason, onChange: (e) => setCancelReason(e.target.value) }) }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 20 }, children: [_jsx("button", { className: "btn btn-danger", style: { flex: 1 }, onClick: () => {
                                        if (!cancelReason.trim())
                                            return alert('Vui lòng nhập lý do!');
                                        cancelItemMutation.mutate({ orderItemId: selectedOrderItemId || 0, reason: cancelReason });
                                        setCancelItem(null);
                                        setCancelReason('');
                                    }, children: "G\u1EEDi y\u00EAu c\u1EA7u h\u1EE7y" }), _jsx("button", { className: "btn btn-outline", style: { flex: 1 }, onClick: () => setCancelItem(null), children: "\u0110\u00F3ng" })] })] }) })), showShift && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }, children: [_jsx("h3", { style: { margin: 0, border: 'none' }, children: "Ch\u1EA5m c\u00F4ng" }), _jsx("button", { onClick: () => { if (sessionStorage.getItem('userId')) {
                                        setShowShift(false);
                                    } }, className: "btn btn-outline", style: { border: 'none', fontSize: 20 }, children: "\u2715" })] }), _jsx(ShiftPage, {})] }) }))] }));
}

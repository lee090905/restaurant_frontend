import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import ShiftPage from './ShiftPage';
import './POSPage.css'; // 🔥 Import file CSS
import { getTables, getActiveDishes, placeOrderLocal, addOrderItem, } from '../../index';
import axiosClient from '../../api/axiosClient';
import { TableGrid } from '../../components/TableGrid';
// Helper format tiền tệ VND
const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};
export default function POSPage() {
    const [tables, setTables] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedTableId, setSelectedTableId] = useState(null);
    // Modal Cancel States
    const [cancelItem, setCancelItem] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelRequests, setCancelRequests] = useState([]);
    const [selectedOrderItemId, setSelectedOrderItemId] = useState(null);
    // Inline Add Dish States
    const [inlineDish, setInlineDish] = useState(null);
    const [inlineQty, setInlineQty] = useState(1);
    const [inlineNote, setInlineNote] = useState('');
    // Order States
    const [orderId, setOrderId] = useState(null);
    const [orderitemId, setOrderItemId] = useState(null);
    const [total, setTotal] = useState(0);
    const [showInvoice, setShowInvoice] = useState(false);
    const [draftItems, setDraftItems] = useState([]);
    const [confirmedItems, setConfirmedItems] = useState([]);
    const [activeArea, setActiveArea] = useState(1);
    const [showShift, setShowShift] = useState(false);
    const calcTotal = (items) => items.reduce((s, i) => s + i.price * i.quantity, 0);
    const categories = Array.from(new Set(dishes.map((d) => d.category).filter(Boolean)));
    const loadTables = async () => {
        const data = await getTables();
        setTables(data.map((t) => ({
            ...t,
            area: Number(t.area),
        })));
    };
    const filteredDishes = activeCategory
        ? dishes.filter((d) => d.category === activeCategory)
        : dishes;
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setShowShift(true);
            return;
        }
        loadTables();
        getActiveDishes().then(setDishes);
    }, []);
    const openCancelModal = (item) => {
        setCancelItem(item);
        if (item.orderItemIds && item.orderItemIds.length > 0) {
            const firstId = item.orderItemIds[0];
            if (!firstId) {
                alert('Lỗi dữ liệu: Món này không có ID. Kiểm tra lại API!');
                setSelectedOrderItemId(null);
            }
            else {
                setSelectedOrderItemId(firstId);
            }
        }
        else {
            setSelectedOrderItemId(null);
        }
        setCancelReason('');
    };
    const openTable = async (table) => {
        const tableId = table?.id;
        if (!tableId)
            return;
        setSelectedTableId(tableId);
        if (table.status === 'close') {
            try {
                const res = await axiosClient.get(`/orders/open-by-table/${tableId}`);
                setOrderId(res.data.id);
                const items = res.data.items || [];
                setConfirmedItems(items);
                setDraftItems([]);
                setTotal(calcTotal(items));
            }
            catch (error) {
                console.error('Lỗi khi load bàn:', error);
            }
            return;
        }
        setOrderId(null);
        setConfirmedItems([]);
        setDraftItems([]);
        setTotal(0);
    };
    const addDish = async (dish) => {
        setInlineDish(dish);
        setInlineQty(1);
        setInlineNote('');
    };
    const confirmAddItems = async () => {
        if (!selectedTableId || draftItems.length === 0)
            return;
        const currentUserId = localStorage.getItem('userId');
        if (!currentUserId) {
            alert('⚠️ Bạn chưa chấm công!');
            setShowShift(true);
            return;
        }
        let finalOrderId = orderId;
        if (!finalOrderId) {
            try {
                const res = await placeOrderLocal({
                    userId: Number(currentUserId),
                    table_id: selectedTableId,
                    items: [],
                });
                if (!res?.id)
                    return;
                finalOrderId = res.id;
                setOrderId(finalOrderId);
            }
            catch (e) {
                console.error('Lỗi tạo order', e);
                return;
            }
        }
        if (!finalOrderId)
            return;
        try {
            await Promise.all(draftItems.map((item) => addOrderItem({
                id: item.id,
                order: finalOrderId, // use ! because we checked above
                dish: item.dish_id,
                quantity: item.quantity,
                price: item.price,
                status: 'pending',
                note: item.note,
            })));
            const res = await axiosClient.get(`/orders/open-by-table/${selectedTableId}`);
            const items = res.data.items || [];
            setConfirmedItems(items);
            setTotal(calcTotal(items));
            setDraftItems([]);
        }
        catch (e) {
            console.error('Lỗi thêm món', e);
        }
    };
    const buildInvoiceItems = (items) => {
        const map = new Map();
        for (const item of items) {
            const key = `${item.dish_id}_${item.note || ''}`;
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
        await axiosClient.post('/orders/checkout', {
            orderitem_id: orderitemId,
            order_id: orderId,
            table_id: selectedTableId,
        });
        setOrderItemId(null);
        setOrderId(null);
        setConfirmedItems([]);
        setDraftItems([]);
        setTotal(0);
        setSelectedTableId(null);
        await loadTables();
    };
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    };
    return (_jsxs("div", { className: "pos-container", children: [_jsxs("header", { className: "pos-header", children: [_jsx("div", { className: "area-tabs", children: [1, 2, 3].map((area) => (_jsxs("button", { className: `btn ${activeArea === area ? 'btn-active' : 'btn-outline'}`, onClick: () => setActiveArea(area), children: ["Khu v\u1EF1c ", area] }, area))) }), _jsxs("div", { className: "header-right", children: [_jsxs("div", { className: "user-info", children: [_jsx("span", { role: "img", "aria-label": "user", children: "\uD83D\uDC64" }), localStorage.getItem('username') || 'N/A'] }), _jsx("button", { className: "btn btn-outline", onClick: () => setShowShift(true), children: "Ch\u1EA5m c\u00F4ng" }), _jsx("button", { className: "btn btn-danger", onClick: handleLogout, children: "\u0110\u0103ng xu\u1EA5t" })] })] }), !selectedTableId ? (
            // VIEW: CHỌN BÀN
            _jsx("div", { className: "table-selection-view", children: _jsx(TableGrid, { tables: tables.filter(String).filter((t) => t.area === activeArea), onSelect: openTable }) })) : (
            // VIEW: GỌI MÓN (Layout chia đôi)
            _jsxs("div", { className: "ordering-layout", children: [_jsxs("div", { className: "menu-section", children: [inlineDish && (_jsxs("div", { className: "inline-edit-card", children: [_jsx("h4", { style: { margin: '0 0 10px 0' }, children: inlineDish.name }), _jsxs("div", { className: "qty-control", children: [_jsx("button", { className: "qty-btn", onClick: () => setInlineQty((q) => Math.max(1, q - 1)), children: "-" }), _jsx("span", { className: "qty-display", children: inlineQty }), _jsx("button", { className: "qty-btn", onClick: () => setInlineQty((q) => q + 1), children: "+" })] }), _jsx("input", { type: "text", className: "form-input", placeholder: "Ghi ch\u00FA (\u00EDt \u0111\u00E1, kh\u00F4ng h\u00E0nh...)", value: inlineNote, onChange: (e) => setInlineNote(e.target.value), autoFocus: true }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 15 }, children: [_jsx("button", { className: "btn btn-primary", style: { flex: 1 }, onClick: () => {
                                                    setDraftItems((prev) => {
                                                        const existed = prev.find((i) => i.dish_id === inlineDish.id &&
                                                            (i.note || '') === (inlineNote || ''));
                                                        if (existed) {
                                                            return prev.map((i) => i === existed
                                                                ? { ...i, quantity: i.quantity + inlineQty }
                                                                : i);
                                                        }
                                                        return [
                                                            ...prev,
                                                            {
                                                                dish_id: inlineDish.id,
                                                                name: inlineDish.name,
                                                                price: inlineDish.price,
                                                                quantity: inlineQty,
                                                                note: inlineNote,
                                                            },
                                                        ];
                                                    });
                                                    setInlineDish(null);
                                                }, children: "Th\u00EAm v\u00E0o \u0111\u01A1n" }), _jsx("button", { className: "btn btn-outline", style: { flex: 1 }, onClick: () => setInlineDish(null), children: "H\u1EE7y" })] })] })), _jsxs("div", { className: "category-bar", children: [_jsx("button", { className: `btn ${activeCategory === null ? 'btn-active' : 'btn-outline'}`, onClick: () => setActiveCategory(null), children: "T\u1EA5t c\u1EA3" }), categories.map((c) => (_jsx("button", { className: `btn ${activeCategory === c ? 'btn-active' : 'btn-outline'}`, onClick: () => setActiveCategory(c), children: c }, c)))] }), _jsx("div", { className: "dish-grid", children: filteredDishes.map((d) => (_jsxs("div", { className: "dish-card", onClick: () => addDish(d), children: [_jsx("div", { className: "dish-name", children: d.name }), _jsx("div", { className: "dish-price", children: formatMoney(d.price) })] }, d.id))) })] }), _jsxs("div", { className: "cart-sidebar", children: [_jsx("div", { className: "cart-header", children: _jsxs("h3", { children: ["B\u00E0n #", selectedTableId] }) }), _jsxs("div", { className: "cart-items", children: [draftItems.map((item, idx) => (_jsxs("div", { className: "cart-item-row", style: { background: '#fff' }, children: [_jsxs("div", { className: "item-top", children: [_jsxs("span", { className: "item-name", children: [item.name, " ", _jsxs("small", { children: ["(x", item.quantity, ")"] })] }), _jsx("span", { className: "item-total", children: formatMoney(item.price * item.quantity) })] }), _jsx("input", { type: "text", className: "input-note", placeholder: "Ghi ch\u00FA...", value: item.note || '', onChange: (e) => {
                                                    const newItems = [...draftItems];
                                                    newItems[idx].note = e.target.value;
                                                    setDraftItems(newItems);
                                                } }), _jsx("div", { className: "item-actions", children: _jsx("button", { className: "btn btn-danger", style: { padding: '4px 8px', fontSize: 12 }, onClick: () => setDraftItems((prev) => prev.filter((_, i) => i !== idx)), children: "X\u00F3a" }) })] }, idx))), draftItems.length === 0 && (_jsx("div", { style: {
                                            padding: 20,
                                            textAlign: 'center',
                                            color: '#888',
                                            fontStyle: 'italic',
                                        }, children: "Ch\u01B0a ch\u1ECDn m\u00F3n n\u00E0o" }))] }), _jsxs("div", { className: "cart-footer", children: [_jsxs("button", { className: "btn btn-primary btn-block", onClick: confirmAddItems, disabled: draftItems.length === 0, children: ["X\u00E1c nh\u1EADn g\u1ECDi m\u00F3n (", draftItems.length, ")"] }), _jsx("button", { className: "btn btn-outline btn-block", onClick: () => setShowInvoice(true), disabled: !orderId, children: "Xem h\u00F3a \u0111\u01A1n / Thanh to\u00E1n" }), _jsx("button", { className: "btn btn-outline btn-block", onClick: () => setSelectedTableId(null), children: "\u2190 Quay l\u1EA1i danh s\u00E1ch b\u00E0n" })] })] })] })), showInvoice && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", style: { width: 500 }, children: [_jsx("h3", { children: "Chi ti\u1EBFt h\u00F3a \u0111\u01A1n" }), _jsxs("table", { className: "modal-invoice-table", style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "M\u00F3n" }), _jsx("th", { style: { textAlign: 'center' }, children: "SL" }), _jsx("th", { style: { textAlign: 'right' }, children: "\u0110.Gi\u00E1" }), _jsx("th", { style: { textAlign: 'right' }, children: "Th\u00E0nh ti\u1EC1n" }), _jsx("th", {})] }) }), _jsx("tbody", { children: invoiceItems.map((i) => (_jsxs("tr", { children: [_jsxs("td", { children: [i.name, i.note && (_jsxs("div", { style: {
                                                            fontSize: 11,
                                                            color: '#888',
                                                            fontStyle: 'italic',
                                                        }, children: ["(", i.note, ")"] }))] }), _jsx("td", { align: "center", children: i.quantity }), _jsx("td", { align: "right", children: Number(i.price).toLocaleString() }), _jsx("td", { align: "right", children: Number(i.price * i.quantity).toLocaleString() }), _jsx("td", { align: "right", children: _jsx("button", { className: "btn btn-danger", style: { padding: '2px 6px', fontSize: 11 }, onClick: () => openCancelModal(i), children: "H\u1EE7y" }) })] }, i.dish_id))) })] }), _jsxs("div", { className: "invoice-total", children: ["T\u1ED5ng c\u1ED9ng: ", formatMoney(total)] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("button", { className: "btn btn-success btn-block", style: { background: 'var(--success-color)', color: '#fff' }, onClick: async () => {
                                        if (!window.confirm('Xác nhận thanh toán và in hóa đơn?'))
                                            return;
                                        await handlePay();
                                        setShowInvoice(false);
                                        window.print();
                                    }, children: "Thanh to\u00E1n & In Bill" }), _jsx("button", { className: "btn btn-outline btn-block", onClick: () => setShowInvoice(false), children: "\u0110\u00F3ng" })] })] }) })), showShift && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 15,
                            }, children: [_jsx("h3", { style: { margin: 0, border: 'none' }, children: "Ch\u1EA5m c\u00F4ng" }), _jsx("button", { onClick: () => {
                                        if (localStorage.getItem('userId')) {
                                            setShowShift(false);
                                            window.location.reload();
                                        }
                                    }, className: "btn btn-outline", style: { border: 'none', fontSize: 20 }, children: "\u2715" })] }), _jsx(ShiftPage, {})] }) })), cancelItem && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsx("h3", { children: "X\u00E1c nh\u1EADn h\u1EE7y m\u00F3n" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { style: {
                                        fontWeight: 'bold',
                                        display: 'block',
                                        marginBottom: 5,
                                    }, children: cancelItem.name }), cancelItem?.orderItemIds?.length > 0 && (_jsxs("select", { className: "form-select", value: selectedOrderItemId ?? '', onChange: (e) => setSelectedOrderItemId(Number(e.target.value)), children: [_jsx("option", { value: "", children: "-- Ch\u1ECDn m\u00F3n c\u1EA7n h\u1EE7y --" }), cancelItem.orderItemIds.map((id, idx) => (_jsxs("option", { value: id, children: ["M\u00F3n #", idx + 1, " (ID: ", id, ")"] }, id)))] }))] }), _jsx("div", { className: "form-group", children: _jsx("input", { className: "form-input", placeholder: "L\u00FD do h\u1EE7y (Kh\u00E1ch \u0111\u1ED5i \u00FD, H\u1EBFt m\u00F3n...)", value: cancelReason, onChange: (e) => setCancelReason(e.target.value) }) }), _jsx("div", { style: {
                                background: '#fff3cd',
                                padding: 10,
                                borderRadius: 6,
                                marginBottom: 15,
                                fontSize: 13,
                            }, children: "\u26A0\uFE0F Y\u00EAu c\u1EA7u quy\u1EC1n qu\u1EA3n l\u00FD \u0111\u1EC3 h\u1EE7y m\u00F3n" }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 20 }, children: [_jsx("button", { className: "btn btn-danger", style: {
                                        flex: 1,
                                        opacity: 1, // Luôn sáng rõ
                                    }, disabled: false, onClick: () => {
                                        if (!selectedOrderItemId)
                                            return alert('Vui lòng chọn ID món!');
                                        if (!cancelReason.trim())
                                            return alert('Vui lòng nhập lý do!');
                                        if (!selectedOrderItemId || !cancelReason.trim())
                                            return;
                                        setCancelRequests((prev) => [
                                            ...prev,
                                            {
                                                orderItemId: selectedOrderItemId,
                                                reason: cancelReason.trim(),
                                                tableId: selectedTableId,
                                                createdAt: new Date().toISOString(),
                                            },
                                        ]);
                                        // UX: đóng modal + reset form
                                        setCancelItem(null);
                                        setCancelReason('');
                                        setSelectedOrderItemId(null);
                                    }, children: "G\u1EEDi y\u00EAu c\u1EA7u h\u1EE7y" }), _jsx("button", { className: "btn btn-outline", style: { flex: 1 }, onClick: () => setCancelItem(null), children: "\u0110\u00F3ng" })] })] }) }))] }));
}

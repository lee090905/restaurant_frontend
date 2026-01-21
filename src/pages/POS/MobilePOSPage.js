import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import './MobilePOSPage.css';
import { getTables, getActiveDishes, addOrderItem, placeOrderLocal, // Import hàm tạo order
 } from '../..';
import axiosClient from '../../api/axiosClient';
import { TableGrid } from '../../components/TableGrid';
// Helper format tiền
const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ';
export default function MobilePOSPage() {
    // --- DATA STATES ---
    const [tables, setTables] = useState([]);
    const [dishes, setDishes] = useState([]);
    // --- UI STATES ---
    const [currentView, setCurrentView] = useState('TABLES');
    const [showCart, setShowCart] = useState(false);
    const [activeArea, setActiveArea] = useState(1);
    const [activeCategory, setActiveCategory] = useState('all');
    const [cartTab, setCartTab] = useState('DRAFT'); // Tab trong giỏ hàng
    // --- ORDER STATES ---
    const [selectedTable, setSelectedTable] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [orderItemId, setOrderItemId] = useState(null); // Dùng cho checkout
    const [draftItems, setDraftItems] = useState([]); // Món đang chọn (chưa gửi)
    const [confirmedItems, setConfirmedItems] = useState([]); // Món đã gửi bếp
    // --- 1. LOAD DATA BAN ĐẦU ---
    const loadInitialData = async () => {
        try {
            const [tablesData, dishesData] = await Promise.all([
                getTables(),
                getActiveDishes(),
            ]);
            setTables(tablesData.map((t) => ({ ...t, area: Number(t.area) })));
            setDishes(dishesData);
        }
        catch (error) {
            console.error('Lỗi load data:', error);
        }
    };
    useEffect(() => {
        loadInitialData();
    }, []);
    // --- HELPER: TÍNH TOÁN ---
    const categories = useMemo(() => ['all', ...new Set(dishes.map((d) => d.category || 'Khác'))], [dishes]);
    const filteredDishes = activeCategory === 'all'
        ? dishes
        : dishes.filter((d) => (d.category || 'Khác') === activeCategory);
    const draftTotal = draftItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const confirmedTotal = confirmedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalBill = draftTotal + confirmedTotal;
    const handleSelectTable = async (table) => {
        setSelectedTable(table);
        setDraftItems([]); // Xóa giỏ tạm
        setConfirmedItems([]); // Reset món đã gọi trước khi load mới
        setCartTab('DRAFT'); // Mặc định về tab gọi món
        // Kiểm tra: Nếu bàn đang có khách (Status khác 'free') thì mới load order
        if (table.status !== 'free') {
            try {
                console.log('Đang load order cho bàn:', table.id); // 👉 DEBUG 1
                const res = await axiosClient.get(`/orders/open-by-table/${table.id}`);
                console.log('Kết quả API:', res.data); // 👉 DEBUG 2
                if (res.data) {
                    setOrderId(res.data.id);
                    // Lưu danh sách món đã gọi vào state
                    const svItems = res.data.items || [];
                    setConfirmedItems(svItems);
                }
            }
            catch (e) {
                console.error('Bàn này chưa có order hoặc lỗi API:', e);
                setOrderId(null);
            }
        }
        else {
            // Nếu bàn trống
            setOrderId(null);
        }
        setCurrentView('MENU');
    };
    // Hàm gộp các món giống nhau (Cùng ID món + Cùng ghi chú)
    const groupConfirmedItems = (items) => {
        const map = new Map();
        for (const item of items) {
            // Tạo key dựa trên ID món và Ghi chú
            const key = `${item.dish_id}_${item.note || ''}`;
            if (map.has(key)) {
                const existed = map.get(key);
                existed.quantity += item.quantity;
                existed.totalPrice += item.price * item.quantity;
            }
            else {
                map.set(key, {
                    ...item,
                    quantity: item.quantity,
                    totalPrice: item.price * item.quantity,
                });
            }
        }
        return Array.from(map.values());
    };
    const handleBackToTables = () => {
        if (draftItems.length > 0) {
            if (!window.confirm('Giỏ hàng chưa gửi sẽ bị mất. Thoát?'))
                return;
        }
        setCurrentView('TABLES');
        setSelectedTable(null);
        setDraftItems([]);
        loadInitialData(); // Reload lại trạng thái bàn (để cập nhật màu sắc nếu có thay đổi)
    };
    // --- 3. LOGIC THÊM/SỬA MÓN (LOCAL) ---
    const handleAddToDraft = (dish) => {
        setDraftItems((prev) => {
            const exist = prev.find((i) => i.dish_id === dish.id);
            if (exist) {
                return prev.map((i) => i.dish_id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [
                ...prev,
                {
                    dish_id: dish.id,
                    name: dish.name,
                    price: dish.price,
                    quantity: 1,
                    note: '',
                },
            ];
        });
    };
    const handleUpdateQty = (dishId, delta) => {
        setDraftItems((prev) => prev
            .map((item) => {
            if (item.dish_id === dishId) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        })
            .filter((i) => i.quantity > 0));
    };
    // --- 4. LOGIC GỬI BẾP (FULL API) ---
    const handlePlaceOrder = async () => {
        if (draftItems.length === 0)
            return;
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Bạn chưa đăng nhập/chấm công!');
            return;
        }
        let finalOrderId = orderId;
        // A. Nếu chưa có Order -> Tạo Order mới
        if (!finalOrderId) {
            try {
                const res = await placeOrderLocal({
                    userId: Number(userId),
                    table_id: selectedTable.id,
                    items: [],
                });
                if (!res?.id)
                    throw new Error('Không tạo được Order ID');
                finalOrderId = res.id;
                setOrderId(finalOrderId);
            }
            catch (e) {
                console.error('Lỗi tạo order:', e);
                alert('Lỗi khi mở bàn mới. Vui lòng thử lại.');
                return;
            }
        }
        // Guard check typescript
        if (!finalOrderId)
            return;
        // B. Gửi từng món xuống bếp
        try {
            await Promise.all(draftItems.map((item) => addOrderItem({
                id: item.id, // ID local (nếu có) hoặc undefined
                order: finalOrderId,
                dish: item.dish_id,
                price: item.price,
                quantity: item.quantity,
                status: 'pending',
                note: item.note,
            })));
            // C. Refresh dữ liệu sau khi gửi thành công
            alert('✅ Đã gửi bếp thành công!');
            // Load lại order từ server để cập nhật Confirmed Items chuẩn xác nhất
            const res = await axiosClient.get(`/orders/open-by-table/${selectedTable.id}`);
            setConfirmedItems(res.data.items || []);
            setDraftItems([]); // Xóa giỏ tạm
            setShowCart(false); // Đóng modal
            setCartTab('CONFIRMED'); // Chuyển sang tab đã gọi
        }
        catch (e) {
            console.error(e);
            alert('❌ Lỗi khi gửi món. Vui lòng kiểm tra lại kết nối.');
        }
    };
    // // --- 5. LOGIC THANH TOÁN ---
    // const handleCheckout = async () => {
    //   if (
    //     !window.confirm(
    //       `Xác nhận thanh toán bàn ${
    //         selectedTable?.name
    //       }? \nTổng tiền: ${formatMoney(totalBill)}`,
    //     )
    //   )
    //     return;
    //   try {
    //     await axiosClient.post('/orders/checkout', {
    //       order_id: orderId,
    //       table_id: selectedTable.id,
    //       // orderitem_id: ... (nếu API yêu cầu, lấy từ response order detail)
    //     });
    //     alert('Thanh toán thành công!');
    //     setShowCart(false);
    //     handleBackToTables(); // Quay về danh sách
    //   } catch (e) {
    //     alert('Lỗi thanh toán');
    //     console.error(e);
    //   }
    // };
    return (_jsxs("div", { className: "m-container", children: [_jsxs("div", { className: "m-header", children: [_jsx("div", { className: "m-title", children: currentView === 'TABLES'
                            ? '📱 Mobile POS'
                            : `Bàn: ${selectedTable?.name}` }), _jsx("div", { className: "m-user", children: localStorage.getItem('username') || 'Staff' })] }), currentView === 'TABLES' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "m-area-scroll", children: [1, 2, 3].map((area) => (_jsxs("div", { className: `m-chip ${activeArea === area ? 'active' : ''}`, onClick: () => setActiveArea(area), children: ["Khu v\u1EF1c ", area] }, area))) }), _jsx("div", { className: "m-content", children: _jsx(TableGrid, { tables: tables.filter((t) => t.area === activeArea), onSelect: handleSelectTable }) })] })), currentView === 'MENU' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "m-menu-header", children: [_jsx("button", { className: "btn-back", onClick: handleBackToTables, children: "\u2190" }), _jsxs("div", { style: {
                                    fontSize: 14,
                                    color: '#555',
                                    flex: 1,
                                    textAlign: 'center',
                                }, children: ["T\u1ED5ng: ", _jsx("b", { style: { color: '#2563eb' }, children: formatMoney(totalBill) })] }), _jsxs("button", { className: "btn-icon", onClick: () => setShowCart(true), children: ["\uD83D\uDED2", ' ', _jsxs("span", { style: { fontSize: 12, fontWeight: 'bold' }, children: ["(", draftItems.length + confirmedItems.length, ")"] })] })] }), _jsx("div", { className: "m-category-bar", children: categories.map((c) => (_jsx("div", { className: `cat-pill ${activeCategory === c ? 'active' : ''}`, onClick: () => setActiveCategory(c), children: c === 'all' ? 'Tất cả' : c }, c))) }), _jsx("div", { className: "m-content", style: { paddingBottom: 100 }, children: _jsx("div", { className: "m-dish-list", children: filteredDishes.map((dish) => (_jsxs("div", { className: "m-dish-card", onClick: () => handleAddToDraft(dish), children: [_jsxs("div", { className: "m-dish-info", children: [_jsx("h4", { children: dish.name }), _jsx("span", { className: "m-dish-price", children: formatMoney(dish.price) })] }), _jsx("button", { className: "btn-add", children: "+" })] }, dish.id))) }) }), draftItems.length > 0 && (_jsxs("div", { className: "m-bottom-bar", children: [_jsxs("div", { className: "cart-summary", children: [_jsxs("span", { className: "cart-count", children: [draftItems.length, " m\u00F3n m\u1EDBi ch\u01B0a g\u1EEDi"] }), _jsx("span", { className: "cart-total", children: formatMoney(draftTotal) })] }), _jsx("button", { className: "btn-view-cart", onClick: () => {
                                    setCartTab('DRAFT');
                                    setShowCart(true);
                                }, children: "Xem & G\u1EEDi" })] }))] })), showCart && (_jsx("div", { className: "m-modal-overlay", onClick: (e) => {
                    if (e.target === e.currentTarget)
                        setShowCart(false);
                }, children: _jsxs("div", { className: "m-drawer", children: [_jsxs("div", { className: "drawer-header", children: [_jsxs("div", { style: { display: 'flex', gap: 15 }, children: [_jsxs("div", { onClick: () => setCartTab('DRAFT'), style: {
                                                fontWeight: 'bold',
                                                color: cartTab === 'DRAFT' ? '#2563eb' : '#999',
                                                borderBottom: cartTab === 'DRAFT' ? '2px solid #2563eb' : 'none',
                                                paddingBottom: 4,
                                                cursor: 'pointer',
                                            }, children: ["M\u00F3n m\u1EDBi (", draftItems.length, ")"] }), _jsxs("div", { onClick: () => setCartTab('CONFIRMED'), style: {
                                                fontWeight: 'bold',
                                                color: cartTab === 'CONFIRMED' ? '#2563eb' : '#999',
                                                borderBottom: cartTab === 'CONFIRMED' ? '2px solid #2563eb' : 'none',
                                                paddingBottom: 4,
                                                cursor: 'pointer',
                                            }, children: ["\u0110\u00E3 g\u1ECDi (", confirmedItems.length, ")"] })] }), _jsx("button", { onClick: () => setShowCart(false), style: {
                                        background: 'none',
                                        border: 'none',
                                        fontSize: 24,
                                        color: '#999',
                                    }, children: "\u00D7" })] }), _jsxs("div", { className: "drawer-items", children: [cartTab === 'DRAFT' && (_jsxs(_Fragment, { children: [draftItems.length === 0 && (_jsx("div", { style: {
                                                textAlign: 'center',
                                                color: '#999',
                                                marginTop: 20,
                                            }, children: "Ch\u01B0a ch\u1ECDn m\u00F3n n\u00E0o" })), draftItems.map((item, idx) => (_jsxs("div", { className: "cart-item", children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 'bold' }, children: item.name }), _jsx("div", { style: { color: '#666', fontSize: 13 }, children: formatMoney(item.price * item.quantity) }), _jsx("input", { placeholder: "Ghi ch\u00FA...", style: {
                                                                border: 'none',
                                                                borderBottom: '1px dashed #ccc',
                                                                width: '90%',
                                                                fontSize: 12,
                                                                marginTop: 4,
                                                                outline: 'none',
                                                            }, value: item.note || '', onChange: (e) => {
                                                                const newItems = [...draftItems];
                                                                newItems[idx].note = e.target.value;
                                                                setDraftItems(newItems);
                                                            } })] }), _jsxs("div", { className: "qty-control", children: [_jsx("button", { className: "btn-qty", onClick: () => handleUpdateQty(item.dish_id, -1), children: "-" }), _jsx("span", { style: {
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 20,
                                                                textAlign: 'center',
                                                            }, children: item.quantity }), _jsx("button", { className: "btn-qty", onClick: () => handleUpdateQty(item.dish_id, 1), children: "+" })] })] }, idx))), draftItems.length > 0 && (_jsx("div", { style: { marginTop: 20 }, children: _jsxs("button", { className: "btn-confirm", onClick: handlePlaceOrder, children: ["G\u1EEDi B\u1EBFp \u2022 ", formatMoney(draftTotal)] }) }))] })), cartTab === 'CONFIRMED' && (_jsxs(_Fragment, { children: [confirmedItems.length === 0 ? (_jsx("div", { style: {
                                                textAlign: 'center',
                                                color: '#999',
                                                marginTop: 20,
                                            }, children: "Ch\u01B0a c\u00F3 m\u00F3n n\u00E0o \u0111\u01B0\u1EE3c g\u1ECDi xu\u1ED1ng b\u1EBFp." })) : (
                                        // 👉 Dùng hàm groupConfirmedItems trước khi map
                                        groupConfirmedItems(confirmedItems).map((item, idx) => (_jsxs("div", { className: "cart-item", style: {
                                                opacity: 0.8,
                                                background: '#fafafa',
                                                borderLeft: '3px solid #22c55e',
                                            }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 'bold', fontSize: 15 }, children: item.name }), _jsxs("div", { style: {
                                                                color: '#666',
                                                                fontSize: 13,
                                                                marginTop: 2,
                                                            }, children: [formatMoney(item.price), " x ", item.quantity] }), item.note && (_jsxs("div", { style: {
                                                                fontSize: 12,
                                                                color: '#d97706',
                                                                background: '#fffbeb',
                                                                display: 'inline-block',
                                                                padding: '2px 6px',
                                                                borderRadius: 4,
                                                                marginTop: 4,
                                                            }, children: ["\uD83D\uDCDD ", item.note] }))] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsx("div", { style: { fontWeight: 'bold', color: '#333' }, children: formatMoney(item.totalPrice) }), _jsx("div", { style: {
                                                                fontSize: 11,
                                                                color: '#22c55e',
                                                                fontWeight: 'bold',
                                                                marginTop: 4,
                                                            }, children: "\u0110\u00C3 G\u1EECI" })] })] }, idx)))), _jsxs("div", { style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: 15,
                                                alignItems: 'center',
                                            }, children: [_jsx("span", { style: { color: '#666' }, children: "T\u1ED5ng t\u1EA1m t\u00EDnh:" }), _jsx("span", { style: {
                                                        color: '#2563eb',
                                                        fontSize: 20,
                                                        fontWeight: 'bold',
                                                    }, children: formatMoney(confirmedItems.reduce((s, i) => s + i.price * i.quantity, 0)) })] })] }))] })] }) }))] }));
}

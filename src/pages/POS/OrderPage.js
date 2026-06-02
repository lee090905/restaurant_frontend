import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { DishList } from '../../components/DishList';
import { OrderList } from '../../components/Orderlist';
import './OrderPage.css'; // Nên tạo file css riêng
export default function OrderPage() {
    const [orderItems, setOrderItems] = useState([]);
    // 1. Logic thêm món (từ Menu)
    const handleAddDish = (dish) => {
        setOrderItems((prev) => {
            const existingItem = prev.find((i) => i.id === dish.id);
            if (existingItem) {
                // Nếu đã có -> Tăng số lượng
                return prev.map((i) => i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            // Nếu chưa có -> Thêm mới
            return [...prev, { ...dish, quantity: 1, note: '' }];
        });
    };
    // 2. Logic Tăng số lượng (từ Giỏ hàng)
    const handleIncrease = (id) => {
        setOrderItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)));
    };
    // 3. Logic Giảm số lượng
    const handleDecrease = (id) => {
        setOrderItems((prev) => {
            return prev
                .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
                .filter((i) => i.quantity > 0); // Tự động xóa nếu SL về 0
        });
    };
    // 4. Logic Xóa hẳn món
    const handleRemove = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa món này?')) {
            setOrderItems((prev) => prev.filter((i) => i.id !== id));
        }
    };
    // 5. Logic Hủy toàn bộ đơn (Reset)
    const handleClearOrder = () => {
        if (orderItems.length > 0 &&
            window.confirm('Hủy toàn bộ đơn hàng hiện tại?')) {
            setOrderItems([]);
        }
    };
    // 6. Tính tổng tiền (Sử dụng useMemo để tối ưu hiệu năng)
    const totalAmount = useMemo(() => {
        return orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [orderItems]);
    const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
    return (_jsxs("div", { className: "order-page-container", children: [_jsxs("div", { className: "menu-section", children: [_jsx("div", { className: "section-header", children: _jsx("h3", { children: "Th\u1EF1c \u0111\u01A1n" }) }), _jsx("div", { className: "dish-list-wrapper", children: _jsx(DishList, { onAdd: handleAddDish }) })] }), _jsxs("div", { className: "cart-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "\u0110\u01A1n h\u00E0ng hi\u1EC7n t\u1EA1i" }), orderItems.length > 0 && (_jsx("button", { className: "btn-clear", onClick: handleClearOrder, children: "L\u00E0m m\u1EDBi" }))] }), _jsx("div", { className: "order-list-wrapper", children: orderItems.length === 0 ? (_jsx("div", { className: "empty-cart", children: "Ch\u01B0a c\u00F3 m\u00F3n n\u00E0o \u0111\u01B0\u1EE3c ch\u1ECDn" })) : (_jsx(OrderList, { items: orderItems, onIncrease: handleIncrease, onDecrease: handleDecrease, onRemove: handleRemove })) }), _jsxs("div", { className: "cart-footer", children: [_jsxs("div", { className: "total-row", children: [_jsx("span", { children: "T\u1ED5ng c\u1ED9ng:" }), _jsx("span", { className: "total-price", children: formatMoney(totalAmount) })] }), _jsxs("button", { className: "btn-checkout", disabled: orderItems.length === 0, onClick: () => alert(`Gửi đơn hàng: ${formatMoney(totalAmount)}`), children: ["X\u00E1c nh\u1EADn g\u1ECDi m\u00F3n (", orderItems.length, ")"] })] })] })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getActiveDishes } from '../api/dish.api';
import './MenuModal.css';
const categoryMap = {
    appetizer: 'Khai vị',
    Salad: 'Salad',
    Grilled: 'Món nướng',
    Fried: 'Món chiên',
    'Stir-fried': 'Món xào',
    'Steamed/Boiled': 'Hấp / Luộc',
    Hotpot: 'Lẩu',
    Seafood: 'Hải sản',
    Specials: 'Món đặc biệt',
    Drinks: 'Đồ uống',
};
const categoryIcons = {
    appetizer: '🥗',
    Salad: '🥬',
    Grilled: '🔥',
    Fried: '🍗',
    'Stir-fried': '🍳',
    'Steamed/Boiled': '♨️',
    Hotpot: '🍲',
    Seafood: '🦐',
    Specials: '⭐',
    Drinks: '🥤',
};
const formatVND = (amount) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
}).format(amount);
export function MenuModal({ onClose }) {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    useEffect(() => {
        getActiveDishes()
            .then((data) => {
            // Chỉ hiển thị các món đang active
            setDishes(data.filter((d) => d.active));
        })
            .catch((err) => console.error('Lỗi tải thực đơn:', err))
            .finally(() => setLoading(false));
    }, []);
    // Lấy danh sách category từ dữ liệu thực tế
    const categories = Array.from(new Set(dishes.map((d) => d.category).filter(Boolean)));
    const filteredDishes = activeCategory
        ? dishes.filter((d) => d.category === activeCategory)
        : dishes;
    // Nhóm theo category để hiển thị đẹp khi không lọc
    const groupedDishes = categories.reduce((acc, cat) => {
        acc[cat] = dishes.filter((d) => d.category === cat);
        return acc;
    }, {});
    // Đóng modal khi click overlay
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget)
            onClose();
    };
    return (_jsx("div", { className: "menu-modal-overlay", onClick: handleOverlayClick, children: _jsxs("div", { className: "menu-modal-content", children: [_jsxs("div", { className: "menu-modal-header", children: [_jsxs("div", { children: [_jsx("h2", { className: "menu-modal-title", children: "\uD83D\uDCD6 Th\u1EF1c \u0111\u01A1n Nh\u00E0 h\u00E0ng" }), _jsx("p", { className: "menu-modal-subtitle", children: "Kh\u00E1m ph\u00E1 c\u00E1c m\u00F3n \u0103n h\u1EA5p d\u1EABn c\u1EE7a ch\u00FAng t\u00F4i" })] }), _jsx("button", { className: "menu-modal-close", onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "menu-category-bar", children: [_jsx("button", { className: `menu-cat-btn ${activeCategory === null ? 'active' : ''}`, onClick: () => setActiveCategory(null), children: "\uD83C\uDF7D\uFE0F T\u1EA5t c\u1EA3" }), categories.map((cat) => (_jsxs("button", { className: `menu-cat-btn ${activeCategory === cat ? 'active' : ''}`, onClick: () => setActiveCategory(cat), children: [categoryIcons[cat] || '🍴', " ", categoryMap[cat] || cat] }, cat)))] }), _jsx("div", { className: "menu-modal-body", children: loading ? (_jsxs("div", { className: "menu-loading", children: [_jsx("div", { className: "menu-spinner" }), _jsx("span", { children: "\u0110ang t\u1EA3i th\u1EF1c \u0111\u01A1n..." })] })) : dishes.length === 0 ? (_jsx("div", { className: "menu-empty", children: "Ch\u01B0a c\u00F3 m\u00F3n \u0103n n\u00E0o trong th\u1EF1c \u0111\u01A1n" })) : activeCategory ? (
                    /* Hiển thị danh sách khi đã chọn 1 category */
                    _jsx("div", { className: "menu-dish-grid", children: filteredDishes.map((dish) => (_jsxs("div", { className: "menu-dish-card", children: [_jsx("div", { className: "menu-dish-icon", children: categoryIcons[dish.category] || '🍴' }), _jsxs("div", { className: "menu-dish-info", children: [_jsx("span", { className: "menu-dish-name", children: dish.name }), _jsx("span", { className: "menu-dish-cat", children: categoryMap[dish.category] || dish.category })] }), _jsx("span", { className: "menu-dish-price", children: formatVND(dish.price) })] }, dish.id))) })) : (
                    /* Hiển thị nhóm theo category khi chọn "Tất cả" */
                    _jsx("div", { className: "menu-groups", children: categories.map((cat) => (_jsxs("div", { className: "menu-group", children: [_jsxs("h3", { className: "menu-group-title", children: [categoryIcons[cat] || '🍴', " ", categoryMap[cat] || cat, _jsxs("span", { className: "menu-group-count", children: [groupedDishes[cat].length, " m\u00F3n"] })] }), _jsx("div", { className: "menu-dish-grid", children: groupedDishes[cat].map((dish) => (_jsxs("div", { className: "menu-dish-card", children: [_jsx("div", { className: "menu-dish-icon", children: categoryIcons[dish.category] || '🍴' }), _jsx("div", { className: "menu-dish-info", children: _jsx("span", { className: "menu-dish-name", children: dish.name }) }), _jsx("span", { className: "menu-dish-price", children: formatVND(dish.price) })] }, dish.id))) })] }, cat))) })) }), _jsxs("div", { className: "menu-modal-footer", children: [_jsxs("span", { className: "menu-total-info", children: ["T\u1ED5ng c\u1ED9ng ", _jsx("b", { children: dishes.length }), " m\u00F3n"] }), _jsx("button", { className: "menu-close-btn", onClick: onClose, children: "\u0110\u00F3ng" })] })] }) }));
}

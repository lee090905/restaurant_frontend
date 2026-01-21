import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function OrderList({ items, onIncrease, onDecrease, onRemove, }) {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return (_jsxs("div", { children: [items.length === 0 && _jsx("div", { children: "Ch\u01B0a c\u00F3 m\u00F3n" }), items.map((i) => (_jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [_jsx("span", { style: { flex: 1 }, children: i.name }), _jsx("button", { onClick: () => onDecrease(i.id), children: "-" }), _jsx("span", { children: i.quantity }), _jsx("button", { onClick: () => onIncrease(i.id), children: "+" }), _jsx("span", { children: i.price * i.quantity }), _jsx("button", { onClick: () => onRemove(i.id), children: "\u2715" })] }, i.id))), _jsx("hr", {}), _jsxs("strong", { children: ["T\u1ED5ng ti\u1EC1n: ", total] })] }));
}

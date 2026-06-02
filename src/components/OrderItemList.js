import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export function OrderItemList({ items }) {
    return (_jsx("div", { children: items.map((i) => (_jsxs("div", { children: [i.name, " \u00D7 ", i.quantity, " = ", i.price * i.quantity] }, i.id))) }));
}

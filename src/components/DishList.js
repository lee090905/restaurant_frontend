import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getActiveDishes } from '../index';
export function DishList({ onAdd }) {
    const [dishes, setDishes] = useState([]);
    useEffect(() => {
        getActiveDishes().then(setDishes);
    }, []);
    return (_jsx("div", { children: dishes.map((d) => (_jsxs("div", { onClick: () => onAdd(d), style: {
                padding: '12px 16px',
                marginBottom: 8,
                background: '#f1f3f5',
                borderRadius: 8,
                cursor: 'pointer',
                userSelect: 'none',
            }, children: [_jsx("b", { children: d.name }), " \u2013 ", d.price] }, d.id))) }));
}

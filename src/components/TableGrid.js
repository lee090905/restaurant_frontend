import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function TableGrid({ tables, onSelect, }) {
    return (_jsx("div", { style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 20,
            padding: 24,
        }, children: tables.map((t) => {
            const isOpen = t.status === 'open';
            return (_jsxs("div", { onClick: () => onSelect(t), style: {
                    height: 120,
                    borderRadius: 16,
                    background: isOpen ? '#e6f4ea' : '#fff1f0',
                    color: isOpen ? '#1e7f43' : '#c62828',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }, children: [_jsx("div", { children: t.name }), _jsx("small", { style: { marginTop: 6, fontSize: 13, opacity: 0.8 }, children: t.status })] }, t.id));
        }) }));
}

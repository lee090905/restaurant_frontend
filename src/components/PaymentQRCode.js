import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
export function PaymentQRCode({ amount, orderId }) {
    // Lấy QR từ Backend
    const { data, isLoading, error } = useQuery({
        queryKey: ['payment-qr', orderId, amount],
        queryFn: async () => {
            const res = await axiosClient.post('/payments/generate-qr', { orderId, amount });
            return res.data; // Giả định trả về { qrUrl, bankInfo: { name, accountNo, accountName } }
        },
        enabled: !!orderId && amount > 0,
    });
    if (isLoading)
        return _jsx("div", { style: { textAlign: 'center', padding: '20px' }, children: "\u0110ang t\u1EA1o m\u00E3 QR..." });
    if (error)
        return _jsx("div", { style: { textAlign: 'center', padding: '20px', color: 'red' }, children: "L\u1ED7i khi t\u1EA1o m\u00E3 QR" });
    const qrUrl = data?.qrUrl || '';
    const bankInfo = data?.bankInfo || { name: 'VietinBank', accountNo: '113366668888', accountName: 'NHA HANG ABC' };
    return (_jsxs("div", { style: { textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '8px' }, children: [_jsx("h4", { style: { marginBottom: '16px', color: '#333' }, children: "Qu\u00E9t m\u00E3 \u0111\u1EC3 thanh to\u00E1n" }), _jsx("div", { style: { padding: '16px', background: '#f8f9fa', display: 'inline-block', borderRadius: '12px' }, children: _jsx("img", { src: qrUrl, alt: "M\u00E3 QR Thanh to\u00E1n VietQR", style: { width: '220px', height: '220px', objectFit: 'contain' } }) }), _jsxs("div", { style: { marginTop: '16px', fontSize: '14px', color: '#555' }, children: [_jsxs("p", { style: { margin: '4px 0' }, children: ["Ng\u00E2n h\u00E0ng: ", _jsx("strong", { children: bankInfo.name })] }), _jsxs("p", { style: { margin: '4px 0' }, children: ["STK: ", _jsx("strong", { children: bankInfo.accountNo })] }), _jsxs("p", { style: { margin: '4px 0' }, children: ["Ch\u1EE7 TK: ", _jsx("strong", { children: bankInfo.accountName })] }), _jsxs("p", { style: { margin: '4px 0', fontSize: '18px', color: '#d32f2f', fontWeight: 'bold' }, children: ["S\u1ED1 ti\u1EC1n: ", amount.toLocaleString('vi-VN'), " VND"] }), _jsxs("p", { style: { margin: '4px 0' }, children: ["N\u1ED9i dung: ", _jsxs("strong", { children: ["Thanh to\u00E1n \u0111\u01A1n ", orderId] })] })] })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
const POPULAR_BANKS = [
    { name: 'Vietcombank', bin: '970436' },
    { name: 'VietinBank', bin: '970415' },
    { name: 'Techcombank', bin: '970407' },
    { name: 'BIDV', bin: '970418' },
    { name: 'Agribank', bin: '970405' },
    { name: 'MBBank', bin: '970422' },
    { name: 'ACB', bin: '970416' },
    { name: 'TPBank', bin: '970423' },
    { name: 'VPBank', bin: '970432' },
    { name: 'Sacombank', bin: '970403' },
    { name: 'VIB', bin: '970441' },
    { name: 'SHB', bin: '970443' },
    { name: 'HDBank', bin: '970437' },
    { name: 'MSB', bin: '970426' },
    { name: 'LPBank (LienVietPostBank)', bin: '970449' },
    { name: 'OCB', bin: '970448' },
];
const TEMPLATES = [
    { name: 'Compact (Mã QR + Thông tin ngắn gọn)', value: 'compact2' },
    { name: 'Standard (Đầy đủ thông tin)', value: 'compact' },
    { name: 'QR Only (Chỉ hiển thị mã QR)', value: 'qr_only' },
    { name: 'Print (Tối ưu hóa để in)', value: 'print' },
];
export default function QrConfigPage() {
    const [bankBin, setBankBin] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNo, setAccountNo] = useState('');
    const [accountName, setAccountName] = useState('');
    const [qrTemplate, setQrTemplate] = useState('compact2');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    // Lấy cài đặt hiện tại
    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await axiosClient.get('/payments/settings');
                const data = res.data;
                setBankBin(data.bankBin || '');
                setBankName(data.bankName || '');
                setAccountNo(data.accountNo || '');
                setAccountName(data.accountName || '');
                setQrTemplate(data.qrTemplate || 'compact2');
            }
            catch (err) {
                console.error('Lỗi khi tải cài đặt QR:', err);
                setMessage({ text: 'Không thể tải cấu hình thanh toán.', type: 'error' });
            }
            finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);
    // Tự động cập nhật BIN khi chọn ngân hàng từ danh sách
    const handleBankSelect = (e) => {
        const selectedName = e.target.value;
        setBankName(selectedName);
        const bank = POPULAR_BANKS.find(b => b.name === selectedName);
        if (bank) {
            setBankBin(bank.bin);
        }
    };
    // Lưu cài đặt
    const handleSave = async (e) => {
        e.preventDefault();
        if (!bankBin || !bankName || !accountNo || !accountName || !qrTemplate) {
            setMessage({ text: 'Vui lòng điền đầy đủ tất cả các trường thông tin.', type: 'error' });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await axiosClient.put('/payments/settings', {
                bankBin,
                bankName,
                accountNo,
                accountName: accountName.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), // Chuyển sang in hoa không dấu
                qrTemplate,
            });
            setMessage({ text: 'Cập nhật cấu hình thanh toán QR thành công!', type: 'success' });
        }
        catch (err) {
            setMessage({ text: err.message || 'Lỗi khi cập nhật cài đặt QR.', type: 'error' });
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "qr-config-loading", children: [_jsx("div", { className: "spinner" }), _jsx("p", { children: "\u0110ang t\u1EA3i c\u1EA5u h\u00ECnh thanh to\u00E1n..." })] }));
    }
    // Preview QR URL (giả định hóa đơn mẫu trị giá 250,000 VND và đơn hàng ID: TEST123)
    const previewQrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNo}-${qrTemplate}.png?amount=250000&addInfo=Thanh%20toan%20don%20TEST123&accountName=${encodeURIComponent(accountName)}`;
    return (_jsxs("div", { className: "qr-config-container", children: [_jsx("style", { children: `
        .qr-config-container {
          padding: 30px;
          background-color: #f7f9fc;
          min-height: calc(100vh - 70px);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .qr-config-header {
          margin-bottom: 28px;
        }
        .qr-config-header h2 {
          font-size: 26px;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 6px 0;
        }
        .qr-config-header p {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }
        .qr-config-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 28px;
        }
        @media (max-width: 1024px) {
          .qr-config-layout {
            grid-template-columns: 1fr;
          }
        }
        .qr-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
          padding: 24px;
        }
        .qr-card-title {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 20px;
          border-bottom: 1px solid #edf2f7;
          padding-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 8px;
        }
        .form-control {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          background-color: #f8fafc;
          color: #2d3748;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .form-control:focus {
          border-color: #4f46e5;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .btn-submit {
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 14px 24px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
          width: 100%;
          margin-top: 10px;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
        }
        .btn-submit:active {
          transform: translateY(1px);
        }
        .btn-submit:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
          box-shadow: none;
        }
        .alert-box {
          padding: 14px 18px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 20px;
          font-weight: 500;
          animation: slideDown 0.3s ease;
        }
        .alert-success {
          background-color: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .alert-error {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }
        .preview-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1.5px dashed #cbd5e1;
        }
        .preview-qr-img {
          width: 220px;
          height: 220px;
          object-fit: contain;
          background: white;
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 16px;
        }
        .preview-info {
          text-align: center;
          font-size: 13px;
          color: #64748b;
          width: 100%;
        }
        .preview-info-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .preview-info-row:last-child {
          border: none;
        }
        .preview-info-label {
          font-weight: 500;
          color: #94a3b8;
        }
        .preview-info-value {
          font-weight: 600;
          color: #334155;
        }
        .qr-config-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #718096;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #cbd5e1;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }), _jsxs("div", { className: "qr-config-header", children: [_jsx("h2", { children: "C\u1EA5u h\u00ECnh m\u00E3 QR thanh to\u00E1n" }), _jsx("p", { children: "Thi\u1EBFt l\u1EADp th\u00F4ng tin t\u00E0i kho\u1EA3n ng\u00E2n h\u00E0ng c\u1EE7a nh\u00E0 h\u00E0ng \u0111\u1EC3 t\u1EA1o m\u00E3 QR thanh to\u00E1n \u0111\u1ED9ng cho c\u00E1c \u0111\u01A1n h\u00E0ng." })] }), message && (_jsx("div", { className: `alert-box alert-${message.type}`, children: message.text })), _jsxs("div", { className: "qr-config-layout", children: [_jsxs("div", { className: "qr-card", children: [_jsxs("div", { className: "qr-card-title", children: [_jsx("span", { children: "\u2699\uFE0F" }), " C\u1EA5u h\u00ECnh t\u00E0i kho\u1EA3n nh\u1EADn ti\u1EC1n"] }), _jsxs("form", { onSubmit: handleSave, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Ng\u00E2n h\u00E0ng nh\u1EADn ti\u1EC1n" }), _jsxs("select", { className: "form-control", value: bankName, onChange: handleBankSelect, children: [_jsx("option", { value: "", children: "-- Ch\u1ECDn ng\u00E2n h\u00E0ng --" }), POPULAR_BANKS.map((b) => (_jsx("option", { value: b.name, children: b.name }, b.name)))] })] }), _jsxs("div", { className: "form-row-2", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "M\u00E3 BIN Ng\u00E2n h\u00E0ng (6 ch\u1EEF s\u1ED1)" }), _jsx("input", { type: "text", className: "form-control", value: bankBin, readOnly: true, placeholder: "T\u1EF1 \u0111\u1ED9ng \u0111i\u1EC1n", style: { backgroundColor: '#e2e8f0', color: '#4a5568', cursor: 'not-allowed' }, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "S\u1ED1 t\u00E0i kho\u1EA3n" }), _jsx("input", { type: "text", className: "form-control", value: accountNo, onChange: (e) => setAccountNo(e.target.value.replace(/\s/g, '')), placeholder: "Nh\u1EADp s\u1ED1 t\u00E0i kho\u1EA3n", required: true })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "T\u00EAn ch\u1EE7 t\u00E0i kho\u1EA3n (Vi\u1EBFt hoa kh\u00F4ng d\u1EA5u)" }), _jsx("input", { type: "text", className: "form-control", value: accountName, onChange: (e) => setAccountName(e.target.value.toUpperCase()), placeholder: "V\u00ED d\u1EE5: NHA HANG ABC", required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "M\u1EABu hi\u1EC3n th\u1ECB VietQR" }), _jsx("select", { className: "form-control", value: qrTemplate, onChange: (e) => setQrTemplate(e.target.value), children: TEMPLATES.map((t) => (_jsx("option", { value: t.value, children: t.name }, t.value))) })] }), _jsx("button", { type: "submit", className: "btn-submit", disabled: saving, children: saving ? 'Đang lưu cài đặt...' : '💾 Lưu cấu hình' })] })] }), _jsxs("div", { className: "qr-card", children: [_jsxs("div", { className: "qr-card-title", children: [_jsx("span", { children: "\uD83D\uDC41\uFE0F" }), " Xem tr\u01B0\u1EDBc th\u1EF1c t\u1EBF (H\u00F3a \u0111\u01A1n m\u1EABu)"] }), _jsxs("div", { className: "preview-section", children: [bankBin && accountNo ? (_jsx("img", { src: previewQrUrl, alt: "VietQR Preview", className: "preview-qr-img", onError: (e) => {
                                            e.target.src = 'https://placehold.co/200x200?text=Loi+ma+QR';
                                        } })) : (_jsx("div", { style: { width: 220, height: 220, background: '#e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 16 }, children: "Vui l\u00F2ng \u0111i\u1EC1n th\u00F4ng tin t\u00E0i kho\u1EA3n" })), _jsxs("div", { className: "preview-info", children: [_jsxs("div", { className: "preview-info-row", children: [_jsx("span", { className: "preview-info-label", children: "Ng\u00E2n h\u00E0ng:" }), _jsx("span", { className: "preview-info-value", children: bankName || '(Chưa cấu hình)' })] }), _jsxs("div", { className: "preview-info-row", children: [_jsx("span", { className: "preview-info-label", children: "S\u1ED1 t\u00E0i kho\u1EA3n:" }), _jsx("span", { className: "preview-info-value", children: accountNo || '(Chưa cấu hình)' })] }), _jsxs("div", { className: "preview-info-row", children: [_jsx("span", { className: "preview-info-label", children: "T\u00EAn t\u00E0i kho\u1EA3n:" }), _jsx("span", { className: "preview-info-value", children: accountName || '(Chưa cấu hình)' })] }), _jsxs("div", { className: "preview-info-row", children: [_jsx("span", { className: "preview-info-label", children: "S\u1ED1 ti\u1EC1n m\u1EABu:" }), _jsx("span", { className: "preview-info-value", style: { color: '#d32f2f' }, children: "250,000 VND" })] }), _jsxs("div", { className: "preview-info-row", children: [_jsx("span", { className: "preview-info-label", children: "N\u1ED9i dung m\u1EABu:" }), _jsx("span", { className: "preview-info-value", children: "Thanh toan don TEST123" })] })] })] })] })] })] }));
}

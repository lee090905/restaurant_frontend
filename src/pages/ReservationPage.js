import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createReservation, } from '../api/reservation.api';
import './ReservationPage.css';
// Regex số điện thoại Việt Nam (đầu 03, 05, 07, 08, 09)
const VN_PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
export default function ReservationPage() {
    // --- STATE ---
    const [form, setForm] = useState({
        customer_name: '',
        phone: '',
        table_id: 0, // undefined để placeholder hiện lên
        time_from: '',
        guest_count: 2,
        note: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    // --- HANDLERS ---
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };
    const validate = () => {
        const newErrors = {};
        let isValid = true;
        if (!form.customer_name.trim()) {
            newErrors.customer_name = 'Vui lòng nhập tên quý khách';
            isValid = false;
        }
        if (!form.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
            isValid = false;
        }
        else if (!VN_PHONE_REGEX.test(form.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ (VN)';
            isValid = false;
        }
        if (!form.time_from) {
            newErrors.time_from = 'Vui lòng chọn thời gian đến';
            isValid = false;
        }
        else {
            const selectedTime = new Date(form.time_from).getTime();
            const now = new Date().getTime();
            if (selectedTime < now) {
                newErrors.time_from = 'Thời gian phải ở tương lai';
                isValid = false;
            }
        }
        if (form.guest_count < 1) {
            newErrors.guest_count = 'Số khách tối thiểu là 1';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };
    const handleSubmit = async () => {
        if (!validate())
            return;
        setIsSubmitting(true);
        try {
            await createReservation({
                ...form,
                table_id: form.table_id || 0, // Xử lý nếu backend cần số 0 thay vì null
            });
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        catch (error) {
            console.error(error);
            alert('❌ Lỗi: ' +
                (error.response?.data?.message || 'Không thể đặt bàn lúc này'));
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleReset = () => {
        setForm({
            customer_name: '',
            phone: '',
            table_id: 0,
            time_from: '',
            guest_count: 2,
            note: '',
        });
        setIsSuccess(false);
    };
    // --- RENDER SUCCESS ---
    if (isSuccess) {
        return (_jsx("div", { className: "res-wrapper", children: _jsx("div", { className: "res-card", children: _jsxs("div", { className: "success-view", children: [_jsx("span", { className: "success-icon", children: "\uD83C\uDF89" }), _jsx("h2", { children: "\u0110\u1EB7t b\u00E0n th\u00E0nh c\u00F4ng!" }), _jsxs("p", { style: { color: '#6b7280', margin: '10px 0' }, children: ["C\u1EA3m \u01A1n ", _jsx("b", { children: form.customer_name }), ". Ch\u00FAng t\u00F4i \u0111\u00E3 ghi nh\u1EADn l\u1ECBch h\u1EB9n v\u00E0o l\u00FAc ", _jsx("b", { children: new Date(form.time_from).toLocaleString('vi-VN') }), "."] }), _jsxs("p", { style: { color: '#6b7280' }, children: ["Nh\u00E0 h\u00E0ng s\u1EBD li\u00EAn h\u1EC7 qua s\u1ED1 ", _jsx("b", { children: form.phone }), " \u0111\u1EC3 x\u00E1c nh\u1EADn s\u1EDBm nh\u1EA5t."] }), _jsx("button", { className: "btn-reset", onClick: handleReset, children: "\u0110\u1EB7t th\u00EAm b\u00E0n kh\u00E1c" })] }) }) }));
    }
    // --- RENDER FORM ---
    return (_jsx("div", { className: "res-wrapper", children: _jsxs("div", { className: "res-card", children: [_jsxs("div", { className: "res-header", children: [_jsx("h2", { children: "\uD83C\uDF7D\uFE0F \u0110\u1EB7t B\u00E0n Tr\u1EF1c Tuy\u1EBFn" }), _jsx("p", { children: "Vui l\u00F2ng \u0111i\u1EC1n th\u00F4ng tin \u0111\u1EC3 ch\u00FAng t\u00F4i ph\u1EE5c v\u1EE5 chu \u0111\u00E1o nh\u1EA5t" })] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: ["T\u00EAn qu\u00FD kh\u00E1ch ", _jsx("span", { children: "*" })] }), _jsx("input", { className: `form-control ${errors.customer_name ? 'error' : ''}`, placeholder: "VD: Nguy\u1EC5n V\u0103n A", value: form.customer_name, onChange: (e) => handleChange('customer_name', e.target.value) }), _jsx("span", { className: "error-text", children: errors.customer_name })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: ["S\u1ED1 \u0111i\u1EC7n tho\u1EA1i ", _jsx("span", { children: "*" })] }), _jsx("input", { type: "tel", className: `form-control ${errors.phone ? 'error' : ''}`, placeholder: "VD: 0912...", value: form.phone, onChange: (e) => {
                                        // Chỉ cho nhập số
                                        const val = e.target.value;
                                        if (!isNaN(Number(val)))
                                            handleChange('phone', val);
                                    } }), _jsx("span", { className: "error-text", children: errors.phone })] })] }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: ["Th\u1EDDi gian \u0111\u1EBFn ", _jsx("span", { children: "*" })] }), _jsx("input", { type: "datetime-local", className: `form-control ${errors.time_from ? 'error' : ''}`, value: form.time_from, onChange: (e) => handleChange('time_from', e.target.value) }), _jsx("span", { className: "error-text", children: errors.time_from })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "S\u1ED1 l\u01B0\u1EE3ng kh\u00E1ch" }), _jsx("input", { type: "number", min: 1, className: `form-control ${errors.guest_count ? 'error' : ''}`, value: form.guest_count, onChange: (e) => handleChange('guest_count', Number(e.target.value)) }), _jsx("span", { className: "error-text", children: errors.guest_count })] })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 20 }, children: [_jsx("label", { className: "form-label", children: "Ch\u1ECDn b\u00E0n (Kh\u00F4ng b\u1EAFt bu\u1ED9c)" }), _jsx("input", { type: "number", className: "form-control", placeholder: "Nh\u1EADp s\u1ED1 b\u00E0n mong mu\u1ED1n (n\u1EBFu bi\u1EBFt)", value: form.table_id || '', onChange: (e) => handleChange('table_id', Number(e.target.value)) })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 20 }, children: [_jsx("label", { className: "form-label", children: "Ghi ch\u00FA th\u00EAm" }), _jsx("textarea", { className: "form-control", placeholder: "V\u00ED d\u1EE5: C\u1EA7n gh\u1EBF tr\u1EBB em, d\u1ECB \u1EE9ng h\u1EA3i s\u1EA3n, t\u1ED5 ch\u1EE9c sinh nh\u1EADt...", value: form.note, onChange: (e) => handleChange('note', e.target.value) })] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { className: "btn btn-outline", onClick: () => alert('Chức năng hiển thị Menu Modal sẽ được tích hợp tại đây!'), children: "\uD83D\uDCD6 Xem Menu" }), _jsx("button", { className: "btn btn-primary", onClick: handleSubmit, disabled: isSubmitting, children: isSubmitting ? 'Đang xử lý...' : 'Xác nhận Đặt bàn' })] })] }) }));
}

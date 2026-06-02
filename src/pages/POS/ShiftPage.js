import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { handleShift } from '../../api/shift.api';
import './ShiftPage.css'; // Import file CSS
export default function ShiftPage() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({
        type: null,
        text: '',
    });
    const submit = async () => {
        if (!username.trim()) {
            setFeedback({ type: 'error', text: 'Vui lòng nhập tên nhân viên!' });
            return;
        }
        setLoading(true);
        setFeedback({ type: null, text: '' });
        try {
            const res = await handleShift(username.trim());
            const action = res?.action || res?.data?.action;
            if (!action) {
                throw new Error('Không tìm thấy thông tin nhân viên hoặc phản hồi sai định dạng');
            }
            if (action === 'open') {
                setFeedback({
                    type: 'success',
                    text: `Xin chào ${username}! Đã mở ca làm việc ✅`,
                });
                // Có thể clear input sau khi thành công nếu muốn
                // setUsername('');
            }
            else if (action === 'close') {
                setFeedback({
                    type: 'success',
                    text: `Tạm biệt ${username}. Đã chốt ca thành công 🔒`,
                });
            }
            else {
                setFeedback({
                    type: 'success',
                    text: 'Thao tác chấm công thành công.',
                });
            }
        }
        catch (err) {
            console.error(err);
            let errorMsg = 'Lỗi kết nối mạng';
            if (err.response) {
                if (err.response.status === 404) {
                    errorMsg = 'Không tìm thấy nhân viên này!';
                }
                else if (err.response.data?.message) {
                    errorMsg = err.response.data.message;
                }
                else {
                    errorMsg = 'Có lỗi xảy ra từ máy chủ';
                }
            }
            else if (err.message) {
                errorMsg = err.message;
            }
            setFeedback({ type: 'error', text: `❌ ${errorMsg}` });
        }
        finally {
            setLoading(false);
        }
    };
    // Xử lý khi nhấn Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            submit();
        }
    };
    return (_jsxs("div", { className: "shift-container", children: [_jsxs("div", { children: [_jsx("label", { className: "shift-label", children: "T\u00EAn \u0111\u0103ng nh\u1EADp / M\u00E3 nh\u00E2n vi\u00EAn" }), _jsx("input", { className: "shift-input", value: username, onChange: (e) => {
                            setUsername(e.target.value);
                            if (feedback.type)
                                setFeedback({ type: null, text: '' }); // Xóa lỗi khi gõ lại
                        }, onKeyDown: handleKeyDown, placeholder: "Nh\u1EADp t\u00EAn c\u1EE7a b\u1EA1n...", autoFocus: true, disabled: loading })] }), _jsx("button", { className: "shift-btn", onClick: submit, disabled: loading || !username.trim(), children: loading ? 'Đang xử lý...' : 'Xác nhận Chấm công' }), feedback.type && (_jsx("div", { className: `shift-message ${feedback.type}`, children: feedback.text }))] }));
}

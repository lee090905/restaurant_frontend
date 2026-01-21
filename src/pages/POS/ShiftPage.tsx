import { useState } from 'react';
import { handleShift } from '../../api/shift.api';
import './ShiftPage.css'; // Import file CSS

export default function ShiftPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({
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
      const res: any = await handleShift(username.trim());
      const action = res?.action || res?.data?.action;

      if (!action) {
        throw new Error(
          'Không tìm thấy thông tin nhân viên hoặc phản hồi sai định dạng',
        );
      }

      if (action === 'open') {
        setFeedback({
          type: 'success',
          text: `Xin chào ${username}! Đã mở ca làm việc ✅`,
        });
        // Có thể clear input sau khi thành công nếu muốn
        // setUsername('');
      } else if (action === 'close') {
        setFeedback({
          type: 'success',
          text: `Tạm biệt ${username}. Đã chốt ca thành công 🔒`,
        });
      } else {
        setFeedback({
          type: 'success',
          text: 'Thao tác chấm công thành công.',
        });
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Lỗi kết nối mạng';

      if (err.response) {
        if (err.response.status === 404) {
          errorMsg = 'Không tìm thấy nhân viên này!';
        } else if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        } else {
          errorMsg = 'Có lỗi xảy ra từ máy chủ';
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setFeedback({ type: 'error', text: `❌ ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi nhấn Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit();
    }
  };

  return (
    <div className="shift-container">
      <div>
        <label className="shift-label">Tên đăng nhập / Mã nhân viên</label>
        <input
          className="shift-input"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (feedback.type) setFeedback({ type: null, text: '' }); // Xóa lỗi khi gõ lại
          }}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tên của bạn..."
          autoFocus
          disabled={loading}
        />
      </div>

      <button
        className="shift-btn"
        onClick={submit}
        disabled={loading || !username.trim()}
      >
        {loading ? 'Đang xử lý...' : 'Xác nhận Chấm công'}
      </button>

      {/* Khu vực hiển thị thông báo */}
      {feedback.type && (
        <div className={`shift-message ${feedback.type}`}>{feedback.text}</div>
      )}
    </div>
  );
}

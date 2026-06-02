import { useState, useEffect } from 'react';
import {
  createReservation,
  CreateReservationDTO,
} from '../api/reservation.api';
import { getTables, TableDTO } from '../api/table.api';
import { MenuModal } from '../components/MenuModal';
import './ReservationPage.css';

// Regex số điện thoại Việt Nam (đầu 03, 05, 07, 08, 09)
const VN_PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

interface FormErrors {
  customer_name?: string;
  phone?: string;
  time_from?: string;
  guest_count?: string;
}

export default function ReservationPage() {
  // --- STATE ---
  const [form, setForm] = useState<CreateReservationDTO>({
    customer_name: '',
    phone: '',
    table_id: 0,
    time_from: '',
    guest_count: 2,
    note: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Danh sách bàn từ API
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);

  // State cho Menu Modal
  const [showMenu, setShowMenu] = useState(false);

  // --- LOAD TABLES ---
  useEffect(() => {
    getTables()
      .then((data) => setTables(data))
      .catch((err) => console.error('Lỗi tải danh sách bàn:', err))
      .finally(() => setLoadingTables(false));
  }, []);

  // --- HANDLERS ---
  const handleChange = (field: keyof CreateReservationDTO, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!form.customer_name.trim()) {
      newErrors.customer_name = 'Vui lòng nhập tên quý khách';
      isValid = false;
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!VN_PHONE_REGEX.test(form.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VN)';
      isValid = false;
    }

    if (!form.time_from) {
      newErrors.time_from = 'Vui lòng chọn thời gian đến';
      isValid = false;
    } else {
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
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await createReservation({
        ...form,
        table_id: form.table_id || 0,
      });
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error(error);
      alert(
        '❌ Lỗi: ' +
          (error.response?.data?.message || 'Không thể đặt bàn lúc này'),
      );
    } finally {
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
    return (
      <div className="res-wrapper">
        <div className="res-card">
          <div className="success-view">
            <span className="success-icon">🎉</span>
            <h2>Đặt bàn thành công!</h2>
            <p style={{ color: '#6b7280', margin: '10px 0' }}>
              Cảm ơn <b>{form.customer_name}</b>. Chúng tôi đã ghi nhận lịch hẹn
              vào lúc <b>{new Date(form.time_from).toLocaleString('vi-VN')}</b>.
            </p>
            <p style={{ color: '#6b7280' }}>
              Nhà hàng sẽ liên hệ qua số <b>{form.phone}</b> để xác nhận sớm
              nhất.
            </p>
            <button className="btn-reset" onClick={handleReset}>
              Đặt thêm bàn khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER FORM ---
  return (
    <div className="res-wrapper">
      <div className="res-card">
        <div className="res-header">
          <h2>🍽️ Đặt Bàn Trực Tuyến</h2>
          <p>Vui lòng điền thông tin để chúng tôi phục vụ chu đáo nhất</p>
        </div>

        {/* Hàng 1: Tên & SĐT */}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Tên quý khách <span>*</span>
            </label>
            <input
              className={`form-control ${errors.customer_name ? 'error' : ''}`}
              placeholder="VD: Nguyễn Văn A"
              value={form.customer_name}
              onChange={(e) => handleChange('customer_name', e.target.value)}
            />
            <span className="error-text">{errors.customer_name}</span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Số điện thoại <span>*</span>
            </label>
            <input
              type="tel"
              className={`form-control ${errors.phone ? 'error' : ''}`}
              placeholder="VD: 0912..."
              value={form.phone}
              onChange={(e) => {
                // Chỉ cho nhập số
                const val = e.target.value;
                if (!isNaN(Number(val))) handleChange('phone', val);
              }}
            />
            <span className="error-text">{errors.phone}</span>
          </div>
        </div>

        {/* Hàng 2: Thời gian & Số khách */}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Thời gian đến <span>*</span>
            </label>
            <input
              type="datetime-local"
              className={`form-control ${errors.time_from ? 'error' : ''}`}
              value={form.time_from}
              onChange={(e) => handleChange('time_from', e.target.value)}
            />
            <span className="error-text">{errors.time_from}</span>
          </div>

          <div className="form-group">
            <label className="form-label">Số lượng khách</label>
            <input
              type="number"
              min={1}
              className={`form-control ${errors.guest_count ? 'error' : ''}`}
              value={form.guest_count}
              onChange={(e) =>
                handleChange('guest_count', Number(e.target.value))
              }
            />
            <span className="error-text">{errors.guest_count}</span>
          </div>
        </div>

        {/* Hàng 3: Chọn bàn (Dropdown) & Ghi chú */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Chọn bàn (Không bắt buộc)</label>
          <select
            className="form-control form-select"
            value={form.table_id}
            onChange={(e) => handleChange('table_id', Number(e.target.value))}
            disabled={loadingTables}
          >
            <option value={0}>
              {loadingTables
                ? '⏳ Đang tải danh sách bàn...'
                : '— Để nhà hàng sắp xếp —'}
            </option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — Khu vực {t.area}{' '}
                {t.status === 'open' ? '(🟢 Trống)' : '(🔴 Đang sử dụng)'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Ghi chú thêm</label>
          <textarea
            className="form-control"
            placeholder="Ví dụ: Cần ghế trẻ em, dị ứng hải sản, tổ chức sinh nhật..."
            value={form.note}
            onChange={(e) => handleChange('note', e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button
            className="btn btn-outline"
            onClick={() => setShowMenu(true)}
          >
            📖 Xem Menu
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Đặt bàn'}
          </button>
        </div>
      </div>

      {/* Menu Modal */}
      {showMenu && <MenuModal onClose={() => setShowMenu(false)} />}
    </div>
  );
}

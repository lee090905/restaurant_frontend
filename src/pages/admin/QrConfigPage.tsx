import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

interface PaymentSetting {
  bankBin: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  qrTemplate: string;
}

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
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Lấy cài đặt hiện tại
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await axiosClient.get('/payments/settings');
        const data: PaymentSetting = res.data;
        setBankBin(data.bankBin || '');
        setBankName(data.bankName || '');
        setAccountNo(data.accountNo || '');
        setAccountName(data.accountName || '');
        setQrTemplate(data.qrTemplate || 'compact2');
      } catch (err: any) {
        console.error('Lỗi khi tải cài đặt QR:', err);
        setMessage({ text: 'Không thể tải cấu hình thanh toán.', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Tự động cập nhật BIN khi chọn ngân hàng từ danh sách
  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setBankName(selectedName);
    const bank = POPULAR_BANKS.find(b => b.name === selectedName);
    if (bank) {
      setBankBin(bank.bin);
    }
  };

  // Lưu cài đặt
  const handleSave = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setMessage({ text: err.message || 'Lỗi khi cập nhật cài đặt QR.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="qr-config-loading">
        <div className="spinner"></div>
        <p>Đang tải cấu hình thanh toán...</p>
      </div>
    );
  }

  // Preview QR URL (giả định hóa đơn mẫu trị giá 250,000 VND và đơn hàng ID: TEST123)
  const previewQrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNo}-${qrTemplate}.png?amount=250000&addInfo=Thanh%20toan%20don%20TEST123&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="qr-config-container">
      <style>{`
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
      `}</style>

      <div className="qr-config-header">
        <h2>Cấu hình mã QR thanh toán</h2>
        <p>Thiết lập thông tin tài khoản ngân hàng của nhà hàng để tạo mã QR thanh toán động cho các đơn hàng.</p>
      </div>

      {message && (
        <div className={`alert-box alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="qr-config-layout">
        {/* Form thiết lập */}
        <div className="qr-card">
          <div className="qr-card-title">
            <span>⚙️</span> Cấu hình tài khoản nhận tiền
          </div>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Ngân hàng nhận tiền</label>
              <select 
                className="form-control" 
                value={bankName} 
                onChange={handleBankSelect}
              >
                <option value="">-- Chọn ngân hàng --</option>
                {POPULAR_BANKS.map((b) => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Mã BIN Ngân hàng (6 chữ số)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={bankBin} 
                  readOnly
                  placeholder="Tự động điền" 
                  style={{ backgroundColor: '#e2e8f0', color: '#4a5568', cursor: 'not-allowed' }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Số tài khoản</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={accountNo} 
                  onChange={(e) => setAccountNo(e.target.value.replace(/\s/g, ''))}
                  placeholder="Nhập số tài khoản" 
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tên chủ tài khoản (Viết hoa không dấu)</label>
              <input 
                type="text" 
                className="form-control" 
                value={accountName} 
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                placeholder="Ví dụ: NHA HANG ABC" 
                required
              />
            </div>

            <div className="form-group">
              <label>Mẫu hiển thị VietQR</label>
              <select 
                className="form-control" 
                value={qrTemplate} 
                onChange={(e) => setQrTemplate(e.target.value)}
              >
                {TEMPLATES.map((t) => (
                  <option key={t.value} value={t.value}>{t.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? 'Đang lưu cài đặt...' : '💾 Lưu cấu hình'}
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="qr-card">
          <div className="qr-card-title">
            <span>👁️</span> Xem trước thực tế (Hóa đơn mẫu)
          </div>
          <div className="preview-section">
            {bankBin && accountNo ? (
              <img 
                src={previewQrUrl} 
                alt="VietQR Preview" 
                className="preview-qr-img" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Loi+ma+QR';
                }}
              />
            ) : (
              <div style={{ width: 220, height: 220, background: '#e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                Vui lòng điền thông tin tài khoản
              </div>
            )}

            <div className="preview-info">
              <div className="preview-info-row">
                <span className="preview-info-label">Ngân hàng:</span>
                <span className="preview-info-value">{bankName || '(Chưa cấu hình)'}</span>
              </div>
              <div className="preview-info-row">
                <span className="preview-info-label">Số tài khoản:</span>
                <span className="preview-info-value">{accountNo || '(Chưa cấu hình)'}</span>
              </div>
              <div className="preview-info-row">
                <span className="preview-info-label">Tên tài khoản:</span>
                <span className="preview-info-value">{accountName || '(Chưa cấu hình)'}</span>
              </div>
              <div className="preview-info-row">
                <span className="preview-info-label">Số tiền mẫu:</span>
                <span className="preview-info-value" style={{ color: '#d32f2f' }}>250,000 VND</span>
              </div>
              <div className="preview-info-row">
                <span className="preview-info-label">Nội dung mẫu:</span>
                <span className="preview-info-value">Thanh toan don TEST123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

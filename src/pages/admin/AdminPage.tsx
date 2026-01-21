import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './AdminPage.css'; // Import CSS

// Định nghĩa Menu một chỗ để dễ quản lý
const MENU_ITEMS = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/tables', label: 'Quản lý Bàn' },
  { path: '/admin/dishes', label: 'Quản lý Món' },
  { path: '/admin/orders', label: 'Đơn hàng' },
  { path: '/admin/shifts', label: 'Ca làm việc' },
  { path: '/admin/users', label: 'Nhân viên' },
];

export default function AdminPage() {
  const location = useLocation();
  const [cancelRequests, setCancelRequests] = useState<any[]>([]);

  useEffect(() => {
    // Polling hoặc lắng nghe sự kiện localStorage để cập nhật realtime (giả lập)
    const checkRequests = () => {
      const data = localStorage.getItem('cancelRequests');
      if (data) {
        setCancelRequests(JSON.parse(data));
      }
    };

    checkRequests();
    // Bạn có thể thêm setInterval ở đây nếu muốn tự động check mỗi vài giây
    // const interval = setInterval(checkRequests, 5000);
    // return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Xử lý logic Modal
  const removeRequest = (index: number) => {
    const next = cancelRequests.filter((_, i) => i !== index);
    localStorage.setItem('cancelRequests', JSON.stringify(next));
    setCancelRequests(next);
  };

  return (
    <div className="admin-layout">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="sidebar-brand">ADMIN PORTAL</div>
        <ul className="sidebar-menu">
          {MENU_ITEMS.map((item) => (
            <li key={item.path} className="menu-item">
              <Link
                to={item.path}
                className={`menu-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* --- MAIN WRAPPER --- */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="admin-user">
            <span style={{ fontSize: 20 }}>👤</span>
            <span>{localStorage.getItem('username') || 'Admin'}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Đăng xuất
          </button>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>

      {/* --- MODAL NOTIFICATION (Cancel Requests) --- */}
      {cancelRequests.length > 0 && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#d32f2f' }}>
                ⚠️ Yêu cầu hủy món
              </h3>
              <button
                onClick={() => {
                  localStorage.removeItem('cancelRequests');
                  setCancelRequests([]);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  textDecoration: 'underline',
                }}
              >
                Đóng tất cả
              </button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {cancelRequests.map((r, idx) => (
                <div key={idx} className="request-item">
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <strong>Bàn: {r.tableId}</strong>
                    <span style={{ fontSize: 12, color: '#888' }}>
                      {new Date(r.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ margin: '8px 0', fontSize: 14 }}>
                    Món ID: <b>{r.orderItemId}</b> <br />
                    Lý do: <i>{r.reason}</i>
                  </div>

                  <div className="req-actions">
                    <button
                      className="btn-approve"
                      onClick={() => removeRequest(idx)}
                    >
                      Đồng ý Hủy
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => removeRequest(idx)}
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

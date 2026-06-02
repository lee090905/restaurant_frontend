import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import './AdminPage.css'; // Import CSS

// Định nghĩa Menu một chỗ để dễ quản lý
const MENU_ITEMS = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/tables', label: 'Quản lý Bàn' },
  { path: '/admin/dishes', label: 'Quản lý Món' },
  { path: '/admin/orders', label: 'Đơn hàng' },
  { path: '/admin/shifts', label: 'Ca làm việc' },
  { path: '/admin/users', label: 'Nhân viên' },
  { path: '/admin/qr-config', label: 'Cấu hình QR' },
];

export default function AdminPage() {
  const location = useLocation();
  const [cancelRequests, setCancelRequests] = useState<any[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  const checkRequests = async () => {
    try {
      const res = await axiosClient.get('/orderitems/cancel-requests');
      const newRequests = res.data || [];
      setCancelRequests(newRequests);
      
      // Nếu có yêu cầu mới xuất hiện thêm thì tự động bật thông báo modal
      if (newRequests.length > prevCount) {
        setShowCancelModal(true);
      }
      setPrevCount(newRequests.length);
    } catch (err) {
      console.error("Lỗi lấy danh sách yêu cầu hủy món:", err);
    }
  };

  useEffect(() => {
    checkRequests();
    // Tự động kiểm tra yêu cầu mới mỗi 5 giây
    const interval = setInterval(checkRequests, 5000);
    return () => clearInterval(interval);
  }, [prevCount]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Xử lý duyệt / từ chối hủy món
  const handleApprove = async (orderItemId: number) => {
    try {
      await axiosClient.post('/orderitems/cancel-approve', { orderItemId });
      checkRequests();
    } catch (err) {
      alert("Không thể phê duyệt hủy món.");
    }
  };

  const handleReject = async (orderItemId: number) => {
    try {
      await axiosClient.post('/orderitems/cancel-reject', { orderItemId });
      checkRequests();
    } catch (err) {
      alert("Không thể từ chối yêu cầu hủy món.");
    }
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
        <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <style>{`
            @keyframes ring {
              0% { transform: rotate(0); }
              10% { transform: rotate(15deg); }
              20% { transform: rotate(-10deg); }
              30% { transform: rotate(10deg); }
              40% { transform: rotate(-5deg); }
              50% { transform: rotate(5deg); }
              60% { transform: rotate(0); }
              100% { transform: rotate(0); }
            }
          `}</style>

          {/* Mục hiển thị trên thanh taskbar (header) */}
          <div 
            className="cancel-requests-trigger" 
            onClick={() => {
              if (cancelRequests.length > 0) {
                setShowCancelModal(true);
              }
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: cancelRequests.length > 0 ? 'pointer' : 'default',
              padding: '8px 16px',
              borderRadius: '20px',
              background: cancelRequests.length > 0 ? '#ffeef0' : '#f3f4f6',
              border: cancelRequests.length > 0 ? '1px solid #fca5a5' : '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              userSelect: 'none',
              boxShadow: cancelRequests.length > 0 ? '0 2px 8px rgba(239, 68, 68, 0.15)' : 'none'
            }}
          >
            <span style={{ 
              fontSize: '16px', 
              display: 'inline-block',
              animation: cancelRequests.length > 0 ? 'ring 1.5s ease infinite' : 'none',
              transformOrigin: 'top center'
            }}>🔔</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: cancelRequests.length > 0 ? '#dc2626' : '#6b7280' }}>
              Yêu cầu hủy món: {cancelRequests.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="admin-user">
              <span style={{ fontSize: 20 }}>👤</span>
              <span>{sessionStorage.getItem('username') || 'Admin'}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>

      {/* --- MODAL NOTIFICATION (Cancel Requests) --- */}
      {showCancelModal && cancelRequests.length > 0 && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#d32f2f' }}>
                ⚠️ Yêu cầu hủy món
              </h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  textDecoration: 'underline',
                }}
              >
                Đóng
              </button>
            </div>

             <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {cancelRequests.map((r, idx) => (
                <div key={idx} className="request-item">
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <strong>Bàn: {r.tableName}</strong>
                    <span style={{ fontSize: 12, color: '#888' }}>
                      {new Date(r.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ margin: '8px 0', fontSize: 14 }}>
                    Món: <b>{r.dishName}</b> (x{r.quantity}) <br />
                    Lý do: <i>{r.cancelReason || 'Không có lý do'}</i>
                  </div>

                  <div className="req-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(r.orderItemId)}
                    >
                      Đồng ý Hủy
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(r.orderItemId)}
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

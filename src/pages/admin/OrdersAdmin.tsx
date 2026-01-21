import { useEffect, useState } from 'react';
import { getOrders, deleteTable } from '../../api/order.api';
import { getTables } from '../../api/table.api';
import { getUsers } from '../../api/user.api';
import { getCurrentShift } from '../../api/shift.api';

// Interface mở rộng để hứng dữ liệu tính toán
interface OrderExtended {
  id: number;
  table: number;
  workshift?: number;
  openedAt: Date;
  closedAt?: Date;
  status: string;
  note?: string;
  totalPrice?: number; // Sẽ tính toán hoặc lấy từ backend sau này
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<OrderExtended[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load toàn bộ dữ liệu cần thiết
  const loadData = async () => {
    try {
      setLoading(true);
      // Gọi song song các API để lấy dữ liệu map
      const [ordersRes, tablesRes, usersRes, shiftsRes] = await Promise.all([
        getOrders(),
        getTables(),
        getUsers().catch(() => []), // Tránh lỗi nếu chưa có API user
        getCurrentShift().catch(() => []), // Tránh lỗi nếu chưa có API shift
      ]);

      // Sắp xếp đơn mới nhất lên đầu
      const sortedOrders = Array.isArray(ordersRes)
        ? ordersRes.sort(
            (a, b) =>
              new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime(),
          )
        : [];

      setOrders(sortedOrders);
      setTables(Array.isArray(tablesRes) ? tablesRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setShifts(Array.isArray(shiftsRes) ? shiftsRes : []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- HELPER FUNCTIONS ---

  // 1. Lấy tên bàn từ ID
  const getTableName = (tableId: number) => {
    const t = tables.find((item) => item.id === tableId);
    return t ? t.name : `Bàn #${tableId}`;
  };

  // 2. Lấy tên người tạo (Order -> Workshift -> User -> Username)
  const getCreatorName = (workshiftId?: number) => {
    if (!workshiftId) return 'N/A';

    // Tìm ca làm việc
    const shift = shifts.find((s) => s.id === workshiftId);
    if (!shift) return `Ca #${workshiftId}`;

    // Tìm user trong ca đó
    const user = users.find((u) => u.id === shift.user);
    return user ? user.username : `User #${shift.user}`;
  };

  // 3. Xóa đơn
  const handleDelete = async (id: number) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa đơn hàng này? Dữ liệu sẽ mất vĩnh viễn.',
      )
    )
      return;
    try {
      await deleteTable(id); // Gọi API xóa
      loadData(); // Tải lại trang
    } catch (error) {
      alert('Lỗi: Không thể xóa đơn hàng');
    }
  };

  // 4. Format Tiền & Ngày
  const formatVND = (amount: number = 0) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const formatDate = (dateString: Date | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  // 5. Badge trạng thái
  const getStatusBadge = (status: string) => {
    let colorClass = 'gray';
    let label = status;

    switch (status) {
      case 'open':
        colorClass = 'blue';
        label = 'Đang mở';
        break;
      case 'paid':
        colorClass = 'green';
        label = 'Đã TT';
        break;
      case 'completed':
        colorClass = 'green';
        label = 'Hoàn thành';
        break; // Status backend mới
      case 'cancel':
        colorClass = 'red';
        label = 'Hủy';
        break;
      case 'pending':
        colorClass = 'orange';
        label = 'Chờ';
        break;
    }
    return <span className={`badge ${colorClass}`}>{label}</span>;
  };

  return (
    <div className="admin-container">
      <style>{`
        .admin-container { padding: 24px; background-color: #f4f6f8; min-height: 100vh; font-family: sans-serif; }
        h2 { margin: 0 0 24px 0; color: #212b36; font-size: 24px; font-weight: 700; }
        
        .card { background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #dfe3e8; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 16px; background: #fafafa; border-bottom: 2px solid #f0f0f0; color: #637381; font-weight: 600; font-size: 13px; text-transform: uppercase; }
        td { padding: 16px; border-bottom: 1px solid #f0f0f0; color: #212b36; vertical-align: middle; font-size: 14px; }
        tr:hover td { background-color: #f9fafb; }

        .badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge.blue { background: #e6f7ff; color: #1890ff; }
        .badge.green { background: #f6ffed; color: #52c41a; }
        .badge.orange { background: #fffbe6; color: #faad14; }
        .badge.red { background: #fff1f0; color: #f5222d; }
        .badge.gray { background: #f5f5f5; color: #595959; }

        .btn-delete { color: #ff4d4f; border: none; background: none; cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-delete:hover { text-decoration: underline; }
        
        .creator-tag { display: flex; align-items: center; gap: 6px; font-weight: 500; }
        .avatar-mini { width: 24px; height: 24px; background: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; }
      `}</style>

      <h2>Quản lý Đơn hàng</h2>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Bàn</th>
              <th>Người tạo</th>
              <th>Mở lúc</th>
              <th>Đóng lúc</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <b>#{order.id}</b>
                </td>

                {/* Cột Bàn */}
                <td style={{ fontWeight: 500 }}>{getTableName(order.table)}</td>

                {/* Cột Người tạo */}
                <td>
                  <div className="creator-tag">
                    <div className="avatar-mini">
                      {getCreatorName(order.workshift).charAt(0).toUpperCase()}
                    </div>
                    {getCreatorName(order.workshift)}
                  </div>
                </td>

                {/* Thời gian */}
                <td>{formatDate(order.openedAt)}</td>
                <td>{order.closedAt ? formatDate(order.closedAt) : '-'}</td>

                {/* Tổng tiền (Hiện tại API chưa trả về, để tạm 0đ hoặc logic giả định) */}
                <td style={{ fontWeight: 700, color: '#212b36' }}>
                  {order.totalPrice
                    ? formatVND(order.totalPrice)
                    : formatVND(0)}
                </td>

                {/* Trạng thái */}
                <td>{getStatusBadge(order.status)}</td>

                {/* Hành động */}
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(order.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}

            {!loading && orders.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: 'center', padding: 40, color: '#999' }}
                >
                  Chưa có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

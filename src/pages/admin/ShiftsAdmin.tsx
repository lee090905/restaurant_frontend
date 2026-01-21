import { useEffect, useState } from 'react';
import { getCurrentShift } from '../../api/shift.api';
import { getUsers } from '../../api/user.api'; // Đảm bảo bạn đã có API này

export default function ShiftsAdmin() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Gọi song song API lấy Ca làm việc và Danh sách nhân viên
        const [shiftsRes, usersRes] = await Promise.all([
          getCurrentShift(),
          getUsers().catch(() => []), // Tránh lỗi nếu chưa có API users
        ]);

        // Sắp xếp ca mới nhất lên đầu
        const sortedShifts = Array.isArray(shiftsRes)
          ? shiftsRes.sort(
              (a: any, b: any) =>
                new Date(b.starttime).getTime() -
                new Date(a.starttime).getTime(),
            )
          : [];

        setShifts(sortedShifts);
        setUsers(Array.isArray(usersRes) ? usersRes : []);
      } catch (error) {
        console.error('Lỗi tải dữ liệu ca làm việc:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Hàm helper: Lấy tên nhân viên từ ID
  const getUsername = (userId: number) => {
    if (!users.length) return `ID: ${userId}`;
    const user = users.find((u: any) => u.id === userId);
    return user ? user.username : `User #${userId}`;
  };

  // Hàm helper: Format ngày giờ
  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
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
        tr:last-child td { border-bottom: none; }
        tr:hover td { background-color: #f9fafb; }
        
        /* Badges */
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .status-open { background: #e6f7ff; color: #1890ff; }
        .status-close { background: #f5f5f5; color: #595959; border: 1px solid #d9d9d9; }

        /* User Avatar Style */
        .user-tag { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; color: #374151; }
        .avatar-circle { 
          width: 32px; height: 32px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 14px; font-weight: bold; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>

      <h2>Quản Lý Ca Làm Việc</h2>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Người tạo</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Tổng giờ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.id}>
                <td style={{ color: '#999' }}>#{shift.id}</td>
                <td>
                  <div className="user-tag">
                    <div className="avatar-circle">
                      {getUsername(shift.user).charAt(0).toUpperCase()}
                    </div>
                    {getUsername(shift.user)}
                  </div>
                </td>
                <td>{formatTime(shift.starttime)}</td>
                <td>
                  {shift.endtime ? (
                    formatTime(shift.endtime)
                  ) : (
                    <span
                      style={{
                        color: '#1890ff',
                        fontStyle: 'italic',
                        fontWeight: 500,
                      }}
                    >
                      Running...
                    </span>
                  )}
                </td>
                <td>
                  {shift.totalhours ? (
                    <strong style={{ color: '#212b36' }}>
                      {Number(shift.totalhours).toFixed(2)}h
                    </strong>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      shift.status === 'open' ? 'status-open' : 'status-close'
                    }`}
                  >
                    {shift.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && shifts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: 'center', padding: 40, color: '#999' }}
                >
                  Chưa có dữ liệu ca làm việc
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

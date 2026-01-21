import { useEffect, useState } from 'react';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../api/user.api';

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');

  const userLabelMap: Record<string, string> = {
    admin: 'Quản lý',
    staff: 'Nhân viên',
  };

  const isUsernameExists = users.some(
    (u) => u.username.trim() === username.trim(),
  );

  const disableCreate = !username || !password || isUsernameExists;

  const loadUsers = async () => {
    const res = await getUsers();
    setUsers(res);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async () => {
    if (!username || !password) return;
    await createUser({ username, password, role });
    setUsername('');
    setPassword('');
    setRole('staff');
    loadUsers();
  };

  const onEdit = (u: any) => {
    setEditing(u);
    setUsername(u.username);
    setRole(u.role);
    setPassword('');
  };

  const onSave = async () => {
    if (!editing) return;
    await updateUser({
      id: editing.id,
      username,
      role,
      ...(password ? { password } : {}),
    });
    setEditing(null);
    setUsername('');
    setPassword('');
    setRole('staff');
    loadUsers();
  };

  const onDelete = async (id: number) => {
    if (!confirm('Xóa user này?')) return;
    await deleteUser(id);
    loadUsers();
  };

  return (
    <div className="admin-container">
      <style>{`
        .admin-container { padding: 24px; background-color: #f4f6f8; min-height: 100vh; font-family: sans-serif; }
        h2 { margin-top: 0; color: #212b36; font-size: 24px; margin-bottom: 24px; }
        
        /* Form Card */
        .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #dfe3e8; margin-bottom: 24px; }
        .form-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        
        input, select { padding: 10px 14px; border: 1px solid #dfe3e8; border-radius: 8px; outline: none; transition: 0.2s; font-size: 14px; }
        input:focus, select:focus { border-color: #1890ff; box-shadow: 0 0 0 2px rgba(24,144,255,0.2); }
        
        button { padding: 10px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 14px; }
        .btn-primary { background: #1890ff; color: white; }
        .btn-primary:hover { background: #096dd9; }
        .btn-primary:disabled { background: #d9d9d9; color: #8c8c8c; cursor: not-allowed; }
        .btn-danger { background: #ff4d4f; color: white; margin-left: 8px; }
        .btn-cancel { background: #f5f5f5; color: #595959; }

        /* Table */
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { text-align: left; padding: 16px; background: #fafafa; border-bottom: 2px solid #f0f0f0; color: #595959; font-weight: 600; }
        td { padding: 16px; border-bottom: 1px solid #f0f0f0; color: #262626; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        .action-btn { font-size: 13px; padding: 6px 12px; margin-right: 6px; background: #e6f7ff; color: #1890ff; }
        .action-btn:hover { background: #bae7ff; }
        .action-btn.delete { background: #fff1f0; color: #ff4d4f; }
        .action-btn.delete:hover { background: #ffccc7; }
      `}</style>

      <h2>Quản lý người dùng</h2>

      {/* FORM CARD */}
      <div className="card">
        <div className="form-row">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={editing ? 'Mật khẩu mới (nếu đổi)' : 'Mật khẩu'}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          {editing ? (
            <>
              <button className="btn-primary" onClick={onSave}>
                Lưu thay đổi
              </button>
              <button className="btn-cancel" onClick={() => setEditing(null)}>
                Hủy
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              onClick={handleCreate}
              disabled={disableCreate}
            >
              + Thêm người dùng
            </button>
          )}
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Vai trò</th>
              <th style={{ width: '180px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <b>{u.username}</b>
                </td>
                <td>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: u.role === 'admin' ? '#fff0f6' : '#f6ffed',
                      color: u.role === 'admin' ? '#c41d7f' : '#389e0d',
                    }}
                  >
                    {userLabelMap[u.role] || u.role}
                  </span>
                </td>
                <td>
                  <button className="action-btn" onClick={() => onEdit(u)}>
                    Sửa
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => onDelete(u.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    textAlign: 'center',
                    color: '#999',
                    padding: '30px',
                  }}
                >
                  Chưa có dữ liệu người dùng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

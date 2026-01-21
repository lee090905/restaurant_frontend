import { useEffect, useState } from 'react';
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} from '../../api/table.api';

export default function TablesAdmin() {
  const [tables, setTables] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [area, setArea] = useState('');

  const loadTables = async () => {
    const res = await getTables();
    setTables(res);
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleCreate = async () => {
    if (!name) return;
    await createTable({ name, area: Number(area) });
    setName('');
    setArea('');
    loadTables();
  };

  const onEdit = (t: any) => {
    setEditing(t);
    setName(t.name);
  };

  const onSave = async () => {
    if (!editing) return;
    await updateTable(editing.id, { name });
    setEditing(null);
    setName('');
    loadTables();
  };

  const onDelete = async (id: number) => {
    if (!confirm('Xóa bàn này?')) return;
    await deleteTable(id);
    loadTables();
  };

  return (
    <div className="admin-container">
      <style>{`
        .admin-container { padding: 24px; background-color: #f4f6f8; min-height: 100vh; font-family: sans-serif; }
        h2 { margin-top: 0; color: #212b36; font-size: 24px; margin-bottom: 24px; }
        .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #dfe3e8; margin-bottom: 24px; }
        .form-row { display: flex; gap: 12px; align-items: center; }
        input { padding: 10px 14px; border: 1px solid #dfe3e8; border-radius: 8px; outline: none; font-size: 14px; }
        input:focus { border-color: #1890ff; }
        button { padding: 10px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-size: 14px; }
        .btn-primary { background: #1890ff; color: white; }
        .btn-cancel { background: #f5f5f5; color: #595959; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 16px; text-align: left; border-bottom: 1px solid #f0f0f0; }
        th { background: #fafafa; font-weight: 600; color: #595959; }
        .action-btn { padding: 6px 12px; margin-right: 6px; background: #e6f7ff; color: #1890ff; }
        .action-btn.delete { background: #fff1f0; color: #ff4d4f; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e6f7ff; color: #1890ff; }
      `}</style>

      <h2>Quản lý bàn</h2>

      {/* FORM */}
      <div className="card">
        {editing ? (
          <div className="form-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên bàn mới"
            />
            <button className="btn-primary" onClick={onSave}>
              Lưu sửa đổi
            </button>
            <button className="btn-cancel" onClick={() => setEditing(null)}>
              Hủy
            </button>
          </div>
        ) : (
          <div className="form-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên bàn"
            />
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Khu vực (Số)"
            />
            <button className="btn-primary" onClick={handleCreate}>
              + Thêm bàn mới
            </button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Tên bàn</th>
              <th>Trạng thái</th>
              <th style={{ width: '180px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t.id}>
                <td>
                  <b>{t.name}</b>
                </td>
                <td>
                  <span className="status-badge">{t.status || 'Trống'}</span>
                </td>
                <td>
                  <button className="action-btn" onClick={() => onEdit(t)}>
                    Sửa
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => onDelete(t.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {tables.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    textAlign: 'center',
                    padding: '30px',
                    color: '#999',
                  }}
                >
                  Chưa có bàn nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

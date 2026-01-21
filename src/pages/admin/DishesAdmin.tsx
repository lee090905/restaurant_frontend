import { useEffect, useState } from 'react';
import {
  getActiveDishes,
  createDishes,
  updateDishes,
  deleteDishes,
} from '../../api/dish.api';

export default function DishesAdmin() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    { key: 'appetizer', label: 'Khai vị' },
    { key: 'Salad', label: 'Salad' },
    { key: 'Grilled', label: 'Món nướng' },
    { key: 'Fried', label: 'Món chiên' },
    { key: 'Stir-fried', label: 'Món xào' },
    { key: 'Steamed/Boiled', label: 'Món hấp / luộc' },
    { key: 'Hotpot', label: 'Lẩu' },
    { key: 'Seafood', label: 'Hải sản' },
    { key: 'Specials', label: 'Món đặc biệt' },
    { key: 'Drinks', label: 'Đồ uống' },
    { key: 'inactive', label: 'Ngừng bán' },
  ];

  const categoryLabelMap: Record<string, string> = {
    appetizer: 'Khai vị',
    Salad: 'Salad',
    Grilled: 'Món nướng',
    Fried: 'Món chiên',
    'Stir-fried': 'Món xào',
    'Steamed/Boiled': 'Món hấp / luộc',
    Hotpot: 'Lẩu',
    Seafood: 'Hải sản',
    Specials: 'Món đặc biệt',
    Drinks: 'Đồ uống',
    inactive: 'Ngừng bán',
  };

  const loadTables = async () => {
    const res = await getActiveDishes();
    setDishes(res);
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleCreate = async () => {
    if (!name) return;
    await createDishes({ name, price: Number(price), category });
    setName('');
    setPrice('');
    // Giữ nguyên logic gốc của bạn (dù chỗ này có thể bạn muốn setCategory(''))
    setCategory;
    loadTables();
  };

  const onEdit = (t: any) => {
    setEditing(t);
    setName(t.name);
  };

  const onSave = async () => {
    if (!editing) return;
    await updateDishes(editing.id, { name });
    setEditing(null);
    setName('');
    loadTables();
  };

  const onDelete = async (id: number) => {
    if (!confirm('Xóa món này?')) return;
    await deleteDishes(id);
    loadTables();
  };

  // Helper format tiền
  const formatVND = (amount: any) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(amount));

  return (
    <div className="admin-container">
      <style>{`
        .admin-container { padding: 24px; background-color: #f4f6f8; min-height: 100vh; font-family: sans-serif; }
        h2 { margin-top: 0; color: #212b36; font-size: 24px; margin-bottom: 24px; }
        .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #dfe3e8; margin-bottom: 24px; }
        .form-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
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
      `}</style>

      <h2>Quản lý món ăn</h2>

      {/* FORM */}
      <div className="card">
        <div className="form-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên món"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Giá (VNĐ)"
          />

          <input
            list="category-list"
            placeholder="Danh mục"
            onChange={(e) => {
              const found = categories.find((c) => c.label === e.target.value);
              if (found) setCategory(found.key);
            }}
          />
          <datalist id="category-list">
            {categories.map((c) => (
              <option key={c.key} value={c.label} />
            ))}
          </datalist>

          {editing ? (
            <>
              <button className="btn-primary" onClick={onSave}>
                Lưu món
              </button>
              <button className="btn-cancel" onClick={() => setEditing(null)}>
                Hủy
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={handleCreate}>
              + Thêm món mới
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Tên món</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th style={{ width: '180px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((t) => (
              <tr key={t.id}>
                <td>
                  <b>{t.name}</b>
                </td>
                <td style={{ color: '#cf1322', fontWeight: 500 }}>
                  {formatVND(t.price)}
                </td>
                <td>{categoryLabelMap[t.category] || t.category}</td>
                <td>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: t.status === 'active' ? '#fff1f0' : '#f6ffed',
                      color: t.status === 'active' ? '#cf1322' : '#389e0d',
                    }}
                  >
                    {t.status === 'active' ? 'Ngừng bán' : 'Đang bán'}
                  </span>
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
            {dishes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: 'center',
                    padding: '30px',
                    color: '#999',
                  }}
                >
                  Chưa có món ăn nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

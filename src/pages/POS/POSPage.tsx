import { useEffect, useState } from 'react';
import ShiftPage from './ShiftPage';
import './POSPage.css'; // 🔥 Import file CSS
import {
  getTables,
  getActiveDishes,
  placeOrderLocal,
  addOrderItem,
} from '../../index';
import axiosClient from '../../api/axiosClient';
import { TableGrid } from '../../components/TableGrid';

// Helper format tiền tệ VND
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export default function POSPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  // Modal Cancel States
  const [cancelItem, setCancelItem] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelRequests, setCancelRequests] = useState<any[]>([]);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number | null>(
    null,
  );

  // Inline Add Dish States
  const [inlineDish, setInlineDish] = useState<any | null>(null);
  const [inlineQty, setInlineQty] = useState(1);
  const [inlineNote, setInlineNote] = useState('');

  // Order States
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderitemId, setOrderItemId] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);
  const [draftItems, setDraftItems] = useState<any[]>([]);
  const [confirmedItems, setConfirmedItems] = useState<any[]>([]);

  const [activeArea, setActiveArea] = useState<number>(1);
  const [showShift, setShowShift] = useState(false);

  const calcTotal = (items: any[]) =>
    items.reduce((s, i) => s + i.price * i.quantity, 0);

  const categories = Array.from(
    new Set(dishes.map((d) => d.category).filter(Boolean)),
  );

  const loadTables = async () => {
    const data = await getTables();
    setTables(
      data.map((t: any) => ({
        ...t,
        area: Number(t.area),
      })),
    );
  };

  const filteredDishes = activeCategory
    ? dishes.filter((d) => d.category === activeCategory)
    : dishes;

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setShowShift(true);
      return;
    }
    loadTables();
    getActiveDishes().then(setDishes);
  }, []);

  const openCancelModal = (item: any) => {
    setCancelItem(item);
    if (item.orderItemIds && item.orderItemIds.length > 0) {
      const firstId = item.orderItemIds[0];
      if (!firstId) {
        alert('Lỗi dữ liệu: Món này không có ID. Kiểm tra lại API!');
        setSelectedOrderItemId(null);
      } else {
        setSelectedOrderItemId(firstId);
      }
    } else {
      setSelectedOrderItemId(null);
    }
    setCancelReason('');
  };

  const openTable = async (table: any) => {
    const tableId = table?.id;
    if (!tableId) return;
    setSelectedTableId(tableId);

    if (table.status === 'close') {
      try {
        const res = await axiosClient.get(`/orders/open-by-table/${tableId}`);
        setOrderId(res.data.id);
        const items = res.data.items || [];
        setConfirmedItems(items);
        setDraftItems([]);
        setTotal(calcTotal(items));
      } catch (error) {
        console.error('Lỗi khi load bàn:', error);
      }
      return;
    }

    setOrderId(null);
    setConfirmedItems([]);
    setDraftItems([]);
    setTotal(0);
  };

  const addDish = async (dish: any) => {
    setInlineDish(dish);
    setInlineQty(1);
    setInlineNote('');
  };

  const confirmAddItems = async () => {
    if (!selectedTableId || draftItems.length === 0) return;
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      alert('⚠️ Bạn chưa chấm công!');
      setShowShift(true);
      return;
    }

    let finalOrderId = orderId;
    if (!finalOrderId) {
      try {
        const res = await placeOrderLocal({
          userId: Number(currentUserId),
          table_id: selectedTableId,
          items: [],
        });
        if (!res?.id) return;
        finalOrderId = res.id;
        setOrderId(finalOrderId);
      } catch (e) {
        console.error('Lỗi tạo order', e);
        return;
      }
    }

    if (!finalOrderId) return;

    try {
      await Promise.all(
        draftItems.map((item) =>
          addOrderItem({
            id: item.id,
            order: finalOrderId!, // use ! because we checked above
            dish: item.dish_id,
            quantity: item.quantity,
            price: item.price,
            status: 'pending',
            note: item.note,
          }),
        ),
      );

      const res = await axiosClient.get(
        `/orders/open-by-table/${selectedTableId}`,
      );
      const items = res.data.items || [];
      setConfirmedItems(items);
      setTotal(calcTotal(items));
      setDraftItems([]);
    } catch (e) {
      console.error('Lỗi thêm món', e);
    }
  };

  const buildInvoiceItems = (items: any[]) => {
    const map = new Map<string, any>();
    for (const item of items) {
      const key = `${item.dish_id}_${item.note || ''}`;
      const realId =
        item.id || item.order_item_id || item.orderItemId || item._id;

      if (map.has(key)) {
        const existed = map.get(key);
        existed.quantity += item.quantity;
        if (realId) existed.orderItemIds.push(realId);
      } else {
        map.set(key, {
          dish_id: item.dish_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          note: item.note,
          orderItemIds: realId ? [realId] : [],
        });
      }
    }
    return Array.from(map.values());
  };

  const invoiceItems = buildInvoiceItems(confirmedItems);

  const handlePay = async () => {
    if (!orderId || !selectedTableId) return;
    await axiosClient.post('/orders/checkout', {
      orderitem_id: orderitemId,
      order_id: orderId,
      table_id: selectedTableId,
    });
    setOrderItemId(null);
    setOrderId(null);
    setConfirmedItems([]);
    setDraftItems([]);
    setTotal(0);
    setSelectedTableId(null);
    await loadTables();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="pos-container">
      {/* --- HEADER --- */}
      <header className="pos-header">
        <div className="area-tabs">
          {[1, 2, 3].map((area) => (
            <button
              key={area}
              className={`btn ${
                activeArea === area ? 'btn-active' : 'btn-outline'
              }`}
              onClick={() => setActiveArea(area)}
            >
              Khu vực {area}
            </button>
          ))}
        </div>

        <div className="header-right">
          <div className="user-info">
            <span role="img" aria-label="user">
              👤
            </span>
            {localStorage.getItem('username') || 'N/A'}
          </div>
          <button
            className="btn btn-outline"
            onClick={() => setShowShift(true)}
          >
            Chấm công
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* --- BODY --- */}
      {!selectedTableId ? (
        // VIEW: CHỌN BÀN
        <div className="table-selection-view">
          <TableGrid
            tables={tables.filter(String).filter((t) => t.area === activeArea)}
            onSelect={openTable}
          />
        </div>
      ) : (
        // VIEW: GỌI MÓN (Layout chia đôi)
        <div className="ordering-layout">
          {/* CỘT TRÁI: MENU */}
          <div className="menu-section">
            {/* Inline Editor */}
            {inlineDish && (
              <div className="inline-edit-card">
                <h4 style={{ margin: '0 0 10px 0' }}>{inlineDish.name}</h4>
                <div className="qty-control">
                  <button
                    className="qty-btn"
                    onClick={() => setInlineQty((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className="qty-display">{inlineQty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setInlineQty((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ghi chú (ít đá, không hành...)"
                  value={inlineNote}
                  onChange={(e) => setInlineNote(e.target.value)}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setDraftItems((prev) => {
                        const existed = prev.find(
                          (i) =>
                            i.dish_id === inlineDish.id &&
                            (i.note || '') === (inlineNote || ''),
                        );
                        if (existed) {
                          return prev.map((i) =>
                            i === existed
                              ? { ...i, quantity: i.quantity + inlineQty }
                              : i,
                          );
                        }
                        return [
                          ...prev,
                          {
                            dish_id: inlineDish.id,
                            name: inlineDish.name,
                            price: inlineDish.price,
                            quantity: inlineQty,
                            note: inlineNote,
                          },
                        ];
                      });
                      setInlineDish(null);
                    }}
                  >
                    Thêm vào đơn
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => setInlineDish(null)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Filter Categories */}
            <div className="category-bar">
              <button
                className={`btn ${
                  activeCategory === null ? 'btn-active' : 'btn-outline'
                }`}
                onClick={() => setActiveCategory(null)}
              >
                Tất cả
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  className={`btn ${
                    activeCategory === c ? 'btn-active' : 'btn-outline'
                  }`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Dishes Grid */}
            <div className="dish-grid">
              {filteredDishes.map((d) => (
                <div
                  key={d.id}
                  className="dish-card"
                  onClick={() => addDish(d)}
                >
                  <div className="dish-name">{d.name}</div>
                  <div className="dish-price">{formatMoney(d.price)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: GIỎ HÀNG */}
          <div className="cart-sidebar">
            <div className="cart-header">
              <h3>Bàn #{selectedTableId}</h3>
            </div>

            <div className="cart-items">
              {draftItems.map((item, idx) => (
                <div
                  key={idx}
                  className="cart-item-row"
                  style={{ background: '#fff' }}
                >
                  <div className="item-top">
                    <span className="item-name">
                      {item.name} <small>(x{item.quantity})</small>
                    </span>
                    <span className="item-total">
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>
                  <input
                    type="text"
                    className="input-note"
                    placeholder="Ghi chú..."
                    value={item.note || ''}
                    onChange={(e) => {
                      const newItems = [...draftItems];
                      newItems[idx].note = e.target.value;
                      setDraftItems(newItems);
                    }}
                  />
                  <div className="item-actions">
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      onClick={() =>
                        setDraftItems((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}

              {/* Nếu không có món nào */}
              {draftItems.length === 0 && (
                <div
                  style={{
                    padding: 20,
                    textAlign: 'center',
                    color: '#888',
                    fontStyle: 'italic',
                  }}
                >
                  Chưa chọn món nào
                </div>
              )}
            </div>

            <div className="cart-footer">
              <button
                className="btn btn-primary btn-block"
                onClick={confirmAddItems}
                disabled={draftItems.length === 0}
              >
                Xác nhận gọi món ({draftItems.length})
              </button>
              <button
                className="btn btn-outline btn-block"
                onClick={() => setShowInvoice(true)}
                disabled={!orderId}
              >
                Xem hóa đơn / Thanh toán
              </button>
              <button
                className="btn btn-outline btn-block"
                onClick={() => setSelectedTableId(null)}
              >
                ← Quay lại danh sách bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL HÓA ĐƠN --- */}
      {showInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: 500 }}>
            <h3>Chi tiết hóa đơn</h3>
            <table
              className="modal-invoice-table"
              style={{ width: '100%', borderCollapse: 'collapse' }}
            >
              <thead>
                <tr>
                  <th>Món</th>
                  <th style={{ textAlign: 'center' }}>SL</th>
                  <th style={{ textAlign: 'right' }}>Đ.Giá</th>
                  <th style={{ textAlign: 'right' }}>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((i) => (
                  <tr key={i.dish_id}>
                    <td>
                      {i.name}
                      {i.note && (
                        <div
                          style={{
                            fontSize: 11,
                            color: '#888',
                            fontStyle: 'italic',
                          }}
                        >
                          ({i.note})
                        </div>
                      )}
                    </td>
                    <td align="center">{i.quantity}</td>
                    <td align="right">{Number(i.price).toLocaleString()}</td>
                    <td align="right">
                      {Number(i.price * i.quantity).toLocaleString()}
                    </td>
                    <td align="right">
                      <button
                        className="btn btn-danger"
                        style={{ padding: '2px 6px', fontSize: 11 }}
                        onClick={() => openCancelModal(i)}
                      >
                        Hủy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-total">Tổng cộng: {formatMoney(total)}</div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-success btn-block"
                style={{ background: 'var(--success-color)', color: '#fff' }}
                onClick={async () => {
                  if (!window.confirm('Xác nhận thanh toán và in hóa đơn?'))
                    return;
                  await handlePay();
                  setShowInvoice(false);
                  window.print();
                }}
              >
                Thanh toán & In Bill
              </button>
              <button
                className="btn btn-outline btn-block"
                onClick={() => setShowInvoice(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CHẤM CÔNG --- */}
      {showShift && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <h3 style={{ margin: 0, border: 'none' }}>Chấm công</h3>
              <button
                onClick={() => {
                  if (localStorage.getItem('userId')) {
                    setShowShift(false);
                    window.location.reload();
                  }
                }}
                className="btn btn-outline"
                style={{ border: 'none', fontSize: 20 }}
              >
                ✕
              </button>
            </div>
            <ShiftPage />
          </div>
        </div>
      )}

      {/* --- MODAL HỦY MÓN --- */}
      {cancelItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận hủy món</h3>

            <div className="form-group">
              <label
                style={{
                  fontWeight: 'bold',
                  display: 'block',
                  marginBottom: 5,
                }}
              >
                {cancelItem.name}
              </label>
              {cancelItem?.orderItemIds?.length > 0 && (
                <select
                  className="form-select"
                  value={selectedOrderItemId ?? ''}
                  onChange={(e) =>
                    setSelectedOrderItemId(Number(e.target.value))
                  }
                >
                  <option value="">-- Chọn món cần hủy --</option>
                  {cancelItem.orderItemIds.map((id: number, idx: number) => (
                    <option key={id} value={id}>
                      Món #{idx + 1} (ID: {id})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <input
                className="form-input"
                placeholder="Lý do hủy (Khách đổi ý, Hết món...)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div
              style={{
                background: '#fff3cd',
                padding: 10,
                borderRadius: 6,
                marginBottom: 15,
                fontSize: 13,
              }}
            >
              ⚠️ Yêu cầu quyền quản lý để hủy món
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                className="btn btn-danger"
                style={{
                  flex: 1,
                  opacity: 1, // Luôn sáng rõ
                }}
                disabled={false}
                onClick={() => {
                  if (!selectedOrderItemId)
                    return alert('Vui lòng chọn ID món!');
                  if (!cancelReason.trim())
                    return alert('Vui lòng nhập lý do!');
                  if (!selectedOrderItemId || !cancelReason.trim()) return;

                  setCancelRequests((prev) => [
                    ...prev,
                    {
                      orderItemId: selectedOrderItemId,
                      reason: cancelReason.trim(),
                      tableId: selectedTableId,
                      createdAt: new Date().toISOString(),
                    },
                  ]);

                  // UX: đóng modal + reset form
                  setCancelItem(null);
                  setCancelReason('');
                  setSelectedOrderItemId(null);
                }}
              >
                Gửi yêu cầu hủy
              </button>

              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setCancelItem(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

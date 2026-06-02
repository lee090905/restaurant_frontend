import { useEffect, useState, useRef } from 'react';
import ShiftPage from './ShiftPage';
import './POSPage.css';
import { getActiveDishes } from '../../index';
import axiosClient from '../../api/axiosClient';
import { TableGrid } from '../../components/TableGrid';

// Nhập các Hooks mới
import { useTablesQuery, useTableOrderQuery } from '../../api/queries/table.queries';
import { useAddItemsMutation, useCancelItemMutation, useSplitMergeMutation } from '../../api/mutations/order.mutations';

// Nhập các Component mới
import { PaymentQRCode } from '../../components/PaymentQRCode';
import { ProvisionalReceipt } from '../../components/ProvisionalReceipt';
import { SplitMergeModal } from '../../components/SplitMergeModal';

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export default function POSPage() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // State quản lý Bàn & Order
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  
  // TanStack Queries (Polling Real-time & Caching)
  const { data: tables = [], isLoading: loadingTables } = useTablesQuery();
  const { data: orderData, isLoading: loadingOrder } = useTableOrderQuery(selectedTableId);
  
  const orderId = orderData?.id || null;
  const confirmedItems = orderData?.items || [];
  
  // TanStack Mutations (Optimistic Updates)
  const addItemsMutation = useAddItemsMutation(selectedTableId);
  const cancelItemMutation = useCancelItemMutation(selectedTableId);
  const splitMergeMutation = useSplitMergeMutation(selectedTableId);

  // States Giao diện (Modals)
  const [cancelItem, setCancelItem] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number | null>(null);

  const [inlineDish, setInlineDish] = useState<any | null>(null);
  const [inlineQty, setInlineQty] = useState(1);
  const [inlineNote, setInlineNote] = useState('');

  const [showInvoice, setShowInvoice] = useState(false);
  const [draftItems, setDraftItems] = useState<any[]>([]);
  
  // State cho Tách / Gộp
  const [showSplitMerge, setShowSplitMerge] = useState<'split' | 'merge' | null>(null);

  // Tham chiếu để In hóa đơn tạm tính
  const printReceiptRef = useRef<HTMLDivElement>(null);

  const [activeArea, setActiveArea] = useState<number>(1);
  const [showShift, setShowShift] = useState(false);

  const calcTotal = (items: any[]) => items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = calcTotal(confirmedItems);

  const categories = Array.from(new Set(dishes.map((d) => d.category).filter(Boolean)));

  const filteredDishes = activeCategory ? dishes.filter((d) => d.category === activeCategory) : dishes;

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      setShowShift(true);
      return;
    }
    getActiveDishes().then(setDishes);
  }, []);

  const openTable = (table: any) => {
    const tableId = table?.id;
    if (!tableId) return;
    setSelectedTableId(tableId);
    setDraftItems([]);
  };

  const addDish = (dish: any) => {
    setInlineDish(dish);
    setInlineQty(1);
    setInlineNote('');
  };

  const confirmAddItems = () => {
    if (!selectedTableId || draftItems.length === 0) return;
    const currentUserId = sessionStorage.getItem('userId');
    if (!currentUserId) {
      alert('⚠️ Bạn chưa chấm công!');
      setShowShift(true);
      return;
    }

    // Gọi Mutation (Thực hiện Optimistic Update ngay lập tức)
    addItemsMutation.mutate({ orderId, items: draftItems });
    setDraftItems([]);
  };

  const buildInvoiceItems = (items: any[]) => {
    const map = new Map<string, any>();
    for (const item of items) {
      const key = `${item.dish_id}_${item.note || ''}_${item.status || 'pending'}`;
      const realId = item.id || item.order_item_id || item.orderItemId || item._id;

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
          status: item.status || 'pending',
          orderItemIds: realId ? [realId] : [],
        });
      }
    }
    return Array.from(map.values());
  };

  const invoiceItems = buildInvoiceItems(confirmedItems);

  const handlePay = async () => {
    if (!orderId || !selectedTableId) return;
    try {
      await axiosClient.post('/orders/checkout', {
        orderitem_id: null,
        order_id: orderId,
        table_id: selectedTableId,
      });
      setSelectedTableId(null);
      setDraftItems([]);
    } catch (error) {
      alert("Lỗi thanh toán");
    }
  };

  const handlePrintProvisional = () => {
    const content = printReceiptRef.current?.innerHTML;
    if (content) {
      const win = window.open('', '_blank');
      win?.document.write(`
        <html>
          <head>
            <title>In Tạm Tính</title>
            <style>
              body { margin: 0; padding: 0; }
              @media print {
                @page { margin: 0; }
              }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      win?.document.close();
      win?.focus();
      win?.print();
      win?.close();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="pos-container">
      {/* Ẩn phiếu in khỏi giao diện */}
      <div style={{ display: 'none' }}>
        <ProvisionalReceipt 
          ref={printReceiptRef}
          tableId={selectedTableId || 'N/A'}
          orderId={orderId}
          cashier={sessionStorage.getItem('username') || 'N/A'}
          items={invoiceItems}
          total={total}
        />
      </div>

      <header className="pos-header">
        <div className="area-tabs">
          {[1, 2, 3].map((area) => (
            <button
              key={area}
              className={`btn ${activeArea === area ? 'btn-active' : 'btn-outline'}`}
              onClick={() => setActiveArea(area)}
            >
              Khu vực {area}
            </button>
          ))}
        </div>

        <div className="header-right">
          <div className="user-info">
            <span role="img" aria-label="user">👤</span>
            {sessionStorage.getItem('username') || 'N/A'}
          </div>
          <button className="btn btn-outline" onClick={() => setShowShift(true)}>Chấm công</button>
          <button className="btn btn-danger" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </header>

      {!selectedTableId ? (
        <div className="table-selection-view">
          {loadingTables ? (
            <div>Đang tải sơ đồ bàn...</div>
          ) : (
            <TableGrid tables={tables.filter(String).filter((t: any) => t.area === activeArea)} onSelect={openTable} />
          )}
        </div>
      ) : (
        <div className="ordering-layout">
          <div className="menu-section">
            {inlineDish && (
              <div className="inline-edit-card">
                <h4 style={{ margin: '0 0 10px 0' }}>{inlineDish.name}</h4>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setInlineQty((q) => Math.max(1, q - 1))}>-</button>
                  <span className="qty-display">{inlineQty}</span>
                  <button className="qty-btn" onClick={() => setInlineQty((q) => q + 1)}>+</button>
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
                        const existed = prev.find((i) => i.dish_id === inlineDish.id && (i.note || '') === (inlineNote || ''));
                        if (existed) return prev.map((i) => i === existed ? { ...i, quantity: i.quantity + inlineQty } : i);
                        return [...prev, { dish_id: inlineDish.id, name: inlineDish.name, price: inlineDish.price, quantity: inlineQty, note: inlineNote }];
                      });
                      setInlineDish(null);
                    }}
                  >Thêm vào đơn</button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setInlineDish(null)}>Hủy</button>
                </div>
              </div>
            )}

            <div className="category-bar">
              <button className={`btn ${activeCategory === null ? 'btn-active' : 'btn-outline'}`} onClick={() => setActiveCategory(null)}>Tất cả</button>
              {categories.map((c) => (
                <button key={c} className={`btn ${activeCategory === c ? 'btn-active' : 'btn-outline'}`} onClick={() => setActiveCategory(c)}>{c}</button>
              ))}
            </div>

            <div className="dish-grid">
              {filteredDishes.map((d) => (
                <div key={d.id} className="dish-card" onClick={() => addDish(d)}>
                  <div className="dish-name">{d.name}</div>
                  <div className="dish-price">{formatMoney(d.price)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-sidebar">
            <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>Bàn #{selectedTableId} {loadingOrder && <small>(Đang tải...)</small>}</h3>
              {orderId && (
                <div>
                  <button className="btn btn-outline" style={{ padding: '4px 8px', marginRight: 4, fontSize: 12 }} onClick={() => setShowSplitMerge('split')}>Tách</button>
                  <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setShowSplitMerge('merge')}>Gộp</button>
                </div>
              )}
            </div>

            <div className="cart-items">
              {/* Hiển thị các món đã xác nhận */}
              {invoiceItems.map((item, idx) => {
                const isCancelled = item.status === 'cancelled';
                return (
                  <div key={`conf-${idx}`} className="cart-item-row" style={{ background: isCancelled ? '#f5f5f5' : '#f0fdf4', opacity: isCancelled ? 0.6 : 1 }}>
                    <div className="item-top">
                      <span className="item-name" style={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                        {isCancelled ? '❌' : '✅'} {item.name} <small>(x{item.quantity})</small>
                      </span>
                      <span className="item-total" style={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                    {item.note && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Ghi chú: {item.note}</div>}
                    <div className="item-actions">
                      {!isCancelled && (
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => {
                           setCancelItem(item);
                           setSelectedOrderItemId(item.orderItemIds?.[0] || null);
                        }}>Hủy</button>
                      )}
                      {isCancelled && <span style={{ fontSize: 11, color: '#d32f2f', fontWeight: 'bold' }}>Đã hủy</span>}
                    </div>
                  </div>
                );
              })}

              {/* Hiển thị món đang nháp */}
              {draftItems.map((item, idx) => (
                <div key={`draft-${idx}`} className="cart-item-row" style={{ background: '#fff' }}>
                  <div className="item-top">
                    <span className="item-name">⏳ {item.name} <small>(x{item.quantity})</small></span>
                    <span className="item-total">{formatMoney(item.price * item.quantity)}</span>
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
                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setDraftItems((prev) => prev.filter((_, i) => i !== idx))}>Xóa</button>
                  </div>
                </div>
              ))}

              {draftItems.length === 0 && invoiceItems.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: '#888', fontStyle: 'italic' }}>Chưa có món nào</div>
              )}
            </div>

            <div className="cart-footer">
              <button className="btn btn-primary btn-block" onClick={confirmAddItems} disabled={draftItems.length === 0 || addItemsMutation.isLoading}>
                {addItemsMutation.isLoading ? 'Đang gửi...' : `Xác nhận gọi món (${draftItems.length})`}
              </button>
              
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                 <button className="btn btn-outline btn-block" onClick={handlePrintProvisional} disabled={!orderId} style={{ flex: 1, marginTop: 0 }}>
                  In Tạm tính
                 </button>
                 <button className="btn btn-outline btn-block" onClick={() => setShowInvoice(true)} disabled={!orderId} style={{ flex: 1, marginTop: 0 }}>
                  Thanh toán
                 </button>
              </div>

              <button className="btn btn-outline btn-block" onClick={() => setSelectedTableId(null)} style={{ marginTop: 10 }}>← Quay lại sơ đồ bàn</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thanh toán (kèm QR) */}
      {showInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: 800, display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <h3>Chi tiết hóa đơn</h3>
              <table className="modal-invoice-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Món</th>
                    <th style={{ textAlign: 'center' }}>SL</th>
                    <th style={{ textAlign: 'right' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((i) => (
                    <tr key={i.dish_id}>
                      <td>{i.name} {i.note && <div style={{ fontSize: 11, color: '#888' }}>({i.note})</div>}</td>
                      <td align="center">{i.quantity}</td>
                      <td align="right">{Number(i.price * i.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="invoice-total">Tổng cộng: {formatMoney(total)}</div>
            </div>

            <div style={{ width: 300, borderLeft: '1px solid #ddd', paddingLeft: 20 }}>
              <PaymentQRCode amount={total} orderId={orderId || 'NEW'} />
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  className="btn btn-success btn-block"
                  style={{ background: 'var(--success-color)', color: '#fff' }}
                  onClick={async () => {
                    if (!window.confirm('Xác nhận khách đã thanh toán?')) return;
                    await handlePay();
                    setShowInvoice(false);
                  }}
                >
                  Xác nhận Thu tiền
                </button>
                <button className="btn btn-outline btn-block" onClick={() => setShowInvoice(false)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tách/Gộp */}
      {showSplitMerge && (
        <SplitMergeModal
          mode={showSplitMerge}
          currentTableId={selectedTableId!}
          availableTables={tables}
          currentItems={invoiceItems}
          onClose={() => setShowSplitMerge(null)}
          onConfirmMerge={(targetTableId) => {
             splitMergeMutation.mutate({ mode: 'merge', targetTableId, items: invoiceItems });
             setShowSplitMerge(null);
             setSelectedTableId(null); // Quay lại màn chọn bàn
          }}
          onConfirmSplit={(targetTableId, itemsToMove) => {
             splitMergeMutation.mutate({ mode: 'split', targetTableId, items: itemsToMove });
             setShowSplitMerge(null);
          }}
        />
      )}

      {/* Modal Hủy món (giữ nguyên logic cũ nhưng wrap lại dùng mutation) */}
      {cancelItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận hủy món</h3>
            <div className="form-group">
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>{cancelItem.name}</label>
            </div>
            <div className="form-group">
              <input
                className="form-input"
                placeholder="Lý do hủy (Khách đổi ý...)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  if (!cancelReason.trim()) return alert('Vui lòng nhập lý do!');
                  cancelItemMutation.mutate({ orderItemId: selectedOrderItemId || 0, reason: cancelReason });
                  setCancelItem(null);
                  setCancelReason('');
                }}
              >Gửi yêu cầu hủy</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setCancelItem(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {showShift && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h3 style={{ margin: 0, border: 'none' }}>Chấm công</h3>
              <button onClick={() => { if (sessionStorage.getItem('userId')) { setShowShift(false); } }} className="btn btn-outline" style={{ border: 'none', fontSize: 20 }}>✕</button>
            </div>
            <ShiftPage />
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import './MobilePOSPage.css';
import {
  getTables,
  getActiveDishes,
  addOrderItem,
  placeOrderLocal, // Import hàm tạo order
} from '../..';
import axiosClient from '../../api/axiosClient';
import { TableGrid } from '../../components/TableGrid';

// Helper format tiền
const formatMoney = (val: number) =>
  new Intl.NumberFormat('vi-VN').format(val) + 'đ';

export default function MobilePOSPage() {
  // --- DATA STATES ---
  const [tables, setTables] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);

  // --- UI STATES ---
  const [currentView, setCurrentView] = useState<'TABLES' | 'MENU'>('TABLES');
  const [showCart, setShowCart] = useState(false);
  const [activeArea, setActiveArea] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cartTab, setCartTab] = useState<'DRAFT' | 'CONFIRMED'>('DRAFT'); // Tab trong giỏ hàng

  // --- ORDER STATES ---
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderItemId, setOrderItemId] = useState<number | null>(null); // Dùng cho checkout

  const [draftItems, setDraftItems] = useState<any[]>([]); // Món đang chọn (chưa gửi)
  const [confirmedItems, setConfirmedItems] = useState<any[]>([]); // Món đã gửi bếp

  // --- 1. LOAD DATA BAN ĐẦU ---
  const loadInitialData = async () => {
    try {
      const [tablesData, dishesData] = await Promise.all([
        getTables(),
        getActiveDishes(),
      ]);
      setTables(tablesData.map((t: any) => ({ ...t, area: Number(t.area) })));
      setDishes(dishesData);
    } catch (error) {
      console.error('Lỗi load data:', error);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // --- HELPER: TÍNH TOÁN ---
  const categories = useMemo(
    () => ['all', ...new Set(dishes.map((d) => d.category || 'Khác'))],
    [dishes],
  );

  const filteredDishes =
    activeCategory === 'all'
      ? dishes
      : dishes.filter((d) => (d.category || 'Khác') === activeCategory);

  const draftTotal = draftItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const confirmedTotal = confirmedItems.reduce(
    (sum, item) => {
      if (item.status === 'cancelled') return sum;
      return sum + item.price * item.quantity;
    },
    0,
  );

  const totalBill = draftTotal + confirmedTotal;

  const handleSelectTable = async (table: any) => {
    setSelectedTable(table);
    setDraftItems([]); // Xóa giỏ tạm
    setConfirmedItems([]); // Reset món đã gọi trước khi load mới
    setCartTab('DRAFT'); // Mặc định về tab gọi món

    // Kiểm tra: Nếu bàn đang có khách (Status khác 'free') thì mới load order
    if (table.status !== 'free') {
      try {
        console.log('Đang load order cho bàn:', table.id); // 👉 DEBUG 1

        const res = await axiosClient.get(`/orders/open-by-table/${table.id}`);

        console.log('Kết quả API:', res.data); // 👉 DEBUG 2

        if (res.data) {
          setOrderId(res.data.id);
          // Lưu danh sách món đã gọi vào state
          const svItems = res.data.items || [];
          setConfirmedItems(svItems);
        }
      } catch (e) {
        console.error('Bàn này chưa có order hoặc lỗi API:', e);
        setOrderId(null);
      }
    } else {
      // Nếu bàn trống
      setOrderId(null);
    }

    setCurrentView('MENU');
  };

  // Hàm gộp các món giống nhau (Cùng ID món + Cùng ghi chú)
  const groupConfirmedItems = (items: any[]) => {
    const map = new Map<string, any>();

    for (const item of items) {
      if (item.status === 'cancelled') continue;
      // Tạo key dựa trên ID món và Ghi chú
      const key = `${item.dish_id}_${item.note || ''}`;

      if (map.has(key)) {
        const existed = map.get(key);
        existed.quantity += item.quantity;
        existed.totalPrice += item.price * item.quantity;
      } else {
        map.set(key, {
          ...item,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
        });
      }
    }
    return Array.from(map.values());
  };

  const handleBackToTables = () => {
    if (draftItems.length > 0) {
      if (!window.confirm('Giỏ hàng chưa gửi sẽ bị mất. Thoát?')) return;
    }
    setCurrentView('TABLES');
    setSelectedTable(null);
    setDraftItems([]);
    loadInitialData(); // Reload lại trạng thái bàn (để cập nhật màu sắc nếu có thay đổi)
  };

  // --- 3. LOGIC THÊM/SỬA MÓN (LOCAL) ---
  const handleAddToDraft = (dish: any) => {
    setDraftItems((prev) => {
      const exist = prev.find((i) => i.dish_id === dish.id);
      if (exist) {
        return prev.map((i) =>
          i.dish_id === dish.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          dish_id: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          note: '',
        },
      ];
    });
  };

  const handleUpdateQty = (dishId: number, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((item) => {
          if (item.dish_id === dishId) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          return item;
        })
        .filter((i) => i.quantity > 0),
    );
  };

  // --- 4. LOGIC GỬI BẾP (FULL API) ---
  const handlePlaceOrder = async () => {
    if (draftItems.length === 0) return;
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      alert('Bạn chưa đăng nhập/chấm công!');
      return;
    }

    let finalOrderId = orderId;

    // A. Nếu chưa có Order -> Tạo Order mới
    if (!finalOrderId) {
      try {
        const res = await placeOrderLocal({
          userId: Number(userId),
          table_id: selectedTable.id,
          items: [],
        });

        if (!res?.id) throw new Error('Không tạo được Order ID');
        finalOrderId = res.id;
        setOrderId(finalOrderId);
      } catch (e) {
        console.error('Lỗi tạo order:', e);
        alert('Lỗi khi mở bàn mới. Vui lòng thử lại.');
        return;
      }
    }

    // Guard check typescript
    if (!finalOrderId) return;

    // B. Gửi từng món xuống bếp
    try {
      await Promise.all(
        draftItems.map((item) =>
          addOrderItem({
            id: item.id, // ID local (nếu có) hoặc undefined
            order: finalOrderId!,
            dish: item.dish_id,
            price: item.price,
            quantity: item.quantity,
            status: 'pending',
            note: item.note,
          }),
        ),
      );

      // C. Refresh dữ liệu sau khi gửi thành công
      alert('✅ Đã gửi bếp thành công!');

      // Load lại order từ server để cập nhật Confirmed Items chuẩn xác nhất
      const res = await axiosClient.get(
        `/orders/open-by-table/${selectedTable.id}`,
      );
      setConfirmedItems(res.data.items || []);

      setDraftItems([]); // Xóa giỏ tạm
      setShowCart(false); // Đóng modal
      setCartTab('CONFIRMED'); // Chuyển sang tab đã gọi
    } catch (e) {
      console.error(e);
      alert('❌ Lỗi khi gửi món. Vui lòng kiểm tra lại kết nối.');
    }
  };

  // // --- 5. LOGIC THANH TOÁN ---
  // const handleCheckout = async () => {
  //   if (
  //     !window.confirm(
  //       `Xác nhận thanh toán bàn ${
  //         selectedTable?.name
  //       }? \nTổng tiền: ${formatMoney(totalBill)}`,
  //     )
  //   )
  //     return;

  //   try {
  //     await axiosClient.post('/orders/checkout', {
  //       order_id: orderId,
  //       table_id: selectedTable.id,
  //       // orderitem_id: ... (nếu API yêu cầu, lấy từ response order detail)
  //     });
  //     alert('Thanh toán thành công!');
  //     setShowCart(false);
  //     handleBackToTables(); // Quay về danh sách
  //   } catch (e) {
  //     alert('Lỗi thanh toán');
  //     console.error(e);
  //   }
  // };

  return (
    <div className="m-container">
      {/* --- HEADER --- */}
      <div className="m-header">
        <div className="m-title">
          {currentView === 'TABLES'
            ? '📱 Mobile POS'
            : `Bàn: ${selectedTable?.name}`}
        </div>
        <div className="m-user">
          {sessionStorage.getItem('username') || 'Staff'}
        </div>
      </div>

      {/* --- VIEW 1: TABLES --- */}
      {currentView === 'TABLES' && (
        <>
          <div className="m-area-scroll">
            {[1, 2, 3].map((area) => (
              <div
                key={area}
                className={`m-chip ${activeArea === area ? 'active' : ''}`}
                onClick={() => setActiveArea(area)}
              >
                Khu vực {area}
              </div>
            ))}
          </div>

          <div className="m-content">
            <TableGrid
              tables={tables.filter((t) => t.area === activeArea)}
              onSelect={handleSelectTable}
            />
          </div>
        </>
      )}

      {/* --- VIEW 2: MENU --- */}
      {currentView === 'MENU' && (
        <>
          <div className="m-menu-header">
            <button className="btn-back" onClick={handleBackToTables}>
              ←
            </button>
            <div
              style={{
                fontSize: 14,
                color: '#555',
                flex: 1,
                textAlign: 'center',
              }}
            >
              Tổng: <b style={{ color: '#2563eb' }}>{formatMoney(totalBill)}</b>
            </div>
            <button className="btn-icon" onClick={() => setShowCart(true)}>
              🛒{' '}
              <span style={{ fontSize: 12, fontWeight: 'bold' }}>
                ({draftItems.length + confirmedItems.length})
              </span>
            </button>
          </div>

          <div className="m-category-bar">
            {categories.map((c) => (
              <div
                key={c}
                className={`cat-pill ${activeCategory === c ? 'active' : ''}`}
                onClick={() => setActiveCategory(c)}
              >
                {c === 'all' ? 'Tất cả' : c}
              </div>
            ))}
          </div>

          <div className="m-content" style={{ paddingBottom: 100 }}>
            <div className="m-dish-list">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="m-dish-card"
                  onClick={() => handleAddToDraft(dish)}
                >
                  <div className="m-dish-info">
                    <h4>{dish.name}</h4>
                    <span className="m-dish-price">
                      {formatMoney(dish.price)}
                    </span>
                  </div>
                  <button className="btn-add">+</button>
                </div>
              ))}
            </div>
          </div>

          {/* FLOATING BAR (Chỉ hiện khi có món mới chưa gửi) */}
          {draftItems.length > 0 && (
            <div className="m-bottom-bar">
              <div className="cart-summary">
                <span className="cart-count">
                  {draftItems.length} món mới chưa gửi
                </span>
                <span className="cart-total">{formatMoney(draftTotal)}</span>
              </div>
              <button
                className="btn-view-cart"
                onClick={() => {
                  setCartTab('DRAFT');
                  setShowCart(true);
                }}
              >
                Xem & Gửi
              </button>
            </div>
          )}
        </>
      )}

      {/* --- DRAWER GIỎ HÀNG --- */}
      {showCart && (
        <div
          className="m-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCart(false);
          }}
        >
          <div className="m-drawer">
            <div className="drawer-header">
              {/* Tabs chuyển đổi */}
              <div style={{ display: 'flex', gap: 15 }}>
                <div
                  onClick={() => setCartTab('DRAFT')}
                  style={{
                    fontWeight: 'bold',
                    color: cartTab === 'DRAFT' ? '#2563eb' : '#999',
                    borderBottom:
                      cartTab === 'DRAFT' ? '2px solid #2563eb' : 'none',
                    paddingBottom: 4,
                    cursor: 'pointer',
                  }}
                >
                  Món mới ({draftItems.length})
                </div>
                <div
                  onClick={() => setCartTab('CONFIRMED')}
                  style={{
                    fontWeight: 'bold',
                    color: cartTab === 'CONFIRMED' ? '#2563eb' : '#999',
                    borderBottom:
                      cartTab === 'CONFIRMED' ? '2px solid #2563eb' : 'none',
                    paddingBottom: 4,
                    cursor: 'pointer',
                  }}
                >
                  Đã gọi ({confirmedItems.length})
                </div>
              </div>

              <button
                onClick={() => setShowCart(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  color: '#999',
                }}
              >
                &times;
              </button>
            </div>

            <div className="drawer-items">
              {/* === TAB 1: DRAFT (Món chưa gửi) === */}
              {cartTab === 'DRAFT' && (
                <>
                  {draftItems.length === 0 && (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#999',
                        marginTop: 20,
                      }}
                    >
                      Chưa chọn món nào
                    </div>
                  )}
                  {draftItems.map((item, idx) => (
                    <div key={idx} className="cart-item">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                        <div style={{ color: '#666', fontSize: 13 }}>
                          {formatMoney(item.price * item.quantity)}
                        </div>
                        <input
                          placeholder="Ghi chú..."
                          style={{
                            border: 'none',
                            borderBottom: '1px dashed #ccc',
                            width: '90%',
                            fontSize: 12,
                            marginTop: 4,
                            outline: 'none',
                          }}
                          value={item.note || ''}
                          onChange={(e) => {
                            const newItems = [...draftItems];
                            newItems[idx].note = e.target.value;
                            setDraftItems(newItems);
                          }}
                        />
                      </div>
                      <div className="qty-control">
                        <button
                          className="btn-qty"
                          onClick={() => handleUpdateQty(item.dish_id, -1)}
                        >
                          -
                        </button>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            width: 20,
                            textAlign: 'center',
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="btn-qty"
                          onClick={() => handleUpdateQty(item.dish_id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  {draftItems.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <button
                        className="btn-confirm"
                        onClick={handlePlaceOrder}
                      >
                        Gửi Bếp • {formatMoney(draftTotal)}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* === TAB 2: CONFIRMED (Món đã gọi) === */}
              {cartTab === 'CONFIRMED' && (
                <>
                  {confirmedItems.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#999',
                        marginTop: 20,
                      }}
                    >
                      Chưa có món nào được gọi xuống bếp.
                    </div>
                  ) : (
                    // 👉 Dùng hàm groupConfirmedItems trước khi map
                    groupConfirmedItems(confirmedItems).map((item, idx) => (
                      <div
                        key={idx}
                        className="cart-item"
                        style={{
                          opacity: 0.8,
                          background: '#fafafa',
                          borderLeft: '3px solid #22c55e',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: 15 }}>
                            {item.name}
                          </div>

                          <div
                            style={{
                              color: '#666',
                              fontSize: 13,
                              marginTop: 2,
                            }}
                          >
                            {formatMoney(item.price)} x {item.quantity}
                          </div>

                          {/* Hiển thị ghi chú nếu có */}
                          {item.note && (
                            <div
                              style={{
                                fontSize: 12,
                                color: '#d97706',
                                background: '#fffbeb',
                                display: 'inline-block',
                                padding: '2px 6px',
                                borderRadius: 4,
                                marginTop: 4,
                              }}
                            >
                              📝 {item.note}
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: '#333' }}>
                            {formatMoney(item.totalPrice)}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#22c55e',
                              fontWeight: 'bold',
                              marginTop: 4,
                            }}
                          >
                            ĐÃ GỬI
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Tổng tiền & Nút Thanh Toán
                  {confirmedItems.length > 0 && (
                    <div
                      style={{
                        marginTop: 20,
                        paddingTop: 15,
                        borderTop: '1px dashed #ccc',
                      }}
                    >
                      <button
                        className="btn-confirm"
                        style={{ background: '#1f2937' }}
                        onClick={handleCheckout}
                      >
                        Thanh toán & In Bill
                      </button>
                    </div>
                  )} */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 15,
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: '#666' }}>Tổng tạm tính:</span>
                    <span
                      style={{
                        color: '#2563eb',
                        fontSize: 20,
                        fontWeight: 'bold',
                      }}
                    >
                      {formatMoney(
                        confirmedItems.reduce(
                          (s, i) => {
                            if (i.status === 'cancelled') return s;
                            return s + i.price * i.quantity;
                          },
                          0,
                        ),
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

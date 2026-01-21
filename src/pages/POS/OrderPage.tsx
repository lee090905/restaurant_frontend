import { useState, useMemo } from 'react';
import { DishList } from '../../components/DishList';
import { OrderList } from '../../components/Orderlist';
import './OrderPage.css'; // Nên tạo file css riêng

// Định nghĩa Type cho Món ăn và Order Item
export type Dish = {
  id: number;
  name: string;
  price: number;
  category?: string;
  image?: string;
};

export type OrderItem = Dish & {
  quantity: number;
  note?: string;
};

export default function OrderPage() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // 1. Logic thêm món (từ Menu)
  const handleAddDish = (dish: Dish) => {
    setOrderItems((prev) => {
      const existingItem = prev.find((i) => i.id === dish.id);

      if (existingItem) {
        // Nếu đã có -> Tăng số lượng
        return prev.map((i) =>
          i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }

      // Nếu chưa có -> Thêm mới
      return [...prev, { ...dish, quantity: 1, note: '' }];
    });
  };

  // 2. Logic Tăng số lượng (từ Giỏ hàng)
  const handleIncrease = (id: number) => {
    setOrderItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
    );
  };

  // 3. Logic Giảm số lượng
  const handleDecrease = (id: number) => {
    setOrderItems((prev) => {
      return prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0); // Tự động xóa nếu SL về 0
    });
  };

  // 4. Logic Xóa hẳn món
  const handleRemove = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa món này?')) {
      setOrderItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  // 5. Logic Hủy toàn bộ đơn (Reset)
  const handleClearOrder = () => {
    if (
      orderItems.length > 0 &&
      window.confirm('Hủy toàn bộ đơn hàng hiện tại?')
    ) {
      setOrderItems([]);
    }
  };

  // 6. Tính tổng tiền (Sử dụng useMemo để tối ưu hiệu năng)
  const totalAmount = useMemo(() => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }, [orderItems]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  return (
    <div className="order-page-container">
      {/* CỘT TRÁI: MENU MÓN ĂN */}
      <div className="menu-section">
        <div className="section-header">
          <h3>Thực đơn</h3>
        </div>
        <div className="dish-list-wrapper">
          <DishList onAdd={handleAddDish} />
        </div>
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG & THANH TOÁN */}
      <div className="cart-section">
        <div className="section-header">
          <h3>Đơn hàng hiện tại</h3>
          {orderItems.length > 0 && (
            <button className="btn-clear" onClick={handleClearOrder}>
              Làm mới
            </button>
          )}
        </div>

        <div className="order-list-wrapper">
          {orderItems.length === 0 ? (
            <div className="empty-cart">Chưa có món nào được chọn</div>
          ) : (
            <OrderList
              items={orderItems}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              onRemove={handleRemove}
            />
          )}
        </div>

        {/* Footer của giỏ hàng: Tổng tiền & Nút xác nhận */}
        <div className="cart-footer">
          <div className="total-row">
            <span>Tổng cộng:</span>
            <span className="total-price">{formatMoney(totalAmount)}</span>
          </div>
          <button
            className="btn-checkout"
            disabled={orderItems.length === 0}
            onClick={() => alert(`Gửi đơn hàng: ${formatMoney(totalAmount)}`)}
          >
            Xác nhận gọi món ({orderItems.length})
          </button>
        </div>
      </div>
    </div>
  );
}

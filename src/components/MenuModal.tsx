import { useEffect, useState } from 'react';
import { getActiveDishes, DishDTO } from '../api/dish.api';
import './MenuModal.css';

interface MenuModalProps {
  onClose: () => void;
}

const categoryMap: Record<string, string> = {
  appetizer: 'Khai vị',
  Salad: 'Salad',
  Grilled: 'Món nướng',
  Fried: 'Món chiên',
  'Stir-fried': 'Món xào',
  'Steamed/Boiled': 'Hấp / Luộc',
  Hotpot: 'Lẩu',
  Seafood: 'Hải sản',
  Specials: 'Món đặc biệt',
  Drinks: 'Đồ uống',
};

const categoryIcons: Record<string, string> = {
  appetizer: '🥗',
  Salad: '🥬',
  Grilled: '🔥',
  Fried: '🍗',
  'Stir-fried': '🍳',
  'Steamed/Boiled': '♨️',
  Hotpot: '🍲',
  Seafood: '🦐',
  Specials: '⭐',
  Drinks: '🥤',
};

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

export function MenuModal({ onClose }: MenuModalProps) {
  const [dishes, setDishes] = useState<DishDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    getActiveDishes()
      .then((data) => {
        // Chỉ hiển thị các món đang active
        setDishes(data.filter((d) => d.active));
      })
      .catch((err) => console.error('Lỗi tải thực đơn:', err))
      .finally(() => setLoading(false));
  }, []);

  // Lấy danh sách category từ dữ liệu thực tế
  const categories = Array.from(
    new Set(dishes.map((d) => d.category).filter(Boolean)),
  );

  const filteredDishes = activeCategory
    ? dishes.filter((d) => d.category === activeCategory)
    : dishes;

  // Nhóm theo category để hiển thị đẹp khi không lọc
  const groupedDishes = categories.reduce(
    (acc, cat) => {
      acc[cat] = dishes.filter((d) => d.category === cat);
      return acc;
    },
    {} as Record<string, DishDTO[]>,
  );

  // Đóng modal khi click overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="menu-modal-overlay" onClick={handleOverlayClick}>
      <div className="menu-modal-content">
        {/* Header */}
        <div className="menu-modal-header">
          <div>
            <h2 className="menu-modal-title">📖 Thực đơn Nhà hàng</h2>
            <p className="menu-modal-subtitle">
              Khám phá các món ăn hấp dẫn của chúng tôi
            </p>
          </div>
          <button className="menu-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="menu-category-bar">
          <button
            className={`menu-cat-btn ${activeCategory === null ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            🍽️ Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`menu-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {categoryIcons[cat] || '🍴'} {categoryMap[cat] || cat}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="menu-modal-body">
          {loading ? (
            <div className="menu-loading">
              <div className="menu-spinner" />
              <span>Đang tải thực đơn...</span>
            </div>
          ) : dishes.length === 0 ? (
            <div className="menu-empty">Chưa có món ăn nào trong thực đơn</div>
          ) : activeCategory ? (
            /* Hiển thị danh sách khi đã chọn 1 category */
            <div className="menu-dish-grid">
              {filteredDishes.map((dish) => (
                <div key={dish.id} className="menu-dish-card">
                  <div className="menu-dish-icon">
                    {categoryIcons[dish.category] || '🍴'}
                  </div>
                  <div className="menu-dish-info">
                    <span className="menu-dish-name">{dish.name}</span>
                    <span className="menu-dish-cat">
                      {categoryMap[dish.category] || dish.category}
                    </span>
                  </div>
                  <span className="menu-dish-price">
                    {formatVND(dish.price)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Hiển thị nhóm theo category khi chọn "Tất cả" */
            <div className="menu-groups">
              {categories.map((cat) => (
                <div key={cat} className="menu-group">
                  <h3 className="menu-group-title">
                    {categoryIcons[cat] || '🍴'} {categoryMap[cat] || cat}
                    <span className="menu-group-count">
                      {groupedDishes[cat].length} món
                    </span>
                  </h3>
                  <div className="menu-dish-grid">
                    {groupedDishes[cat].map((dish) => (
                      <div key={dish.id} className="menu-dish-card">
                        <div className="menu-dish-icon">
                          {categoryIcons[dish.category] || '🍴'}
                        </div>
                        <div className="menu-dish-info">
                          <span className="menu-dish-name">{dish.name}</span>
                        </div>
                        <span className="menu-dish-price">
                          {formatVND(dish.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="menu-modal-footer">
          <span className="menu-total-info">
            Tổng cộng <b>{dishes.length}</b> món
          </span>
          <button className="menu-close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

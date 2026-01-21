import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import các trang
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POS/POSPage';
import MobilePOSPage from './pages/POS/MobilePOSPage';
import ReservationPage from './pages/ReservationPage'; // ✅ Import trang đặt bàn

// Import Admin components
import AdminRoute from './routes/AdminRoute';
import AdminPage from './pages/admin/AdminPage';
import Dashboard from './pages/admin/Dashboard';
import TablesAdmin from './pages/admin/TablesAdmin';
import DishesAdmin from './pages/admin/DishesAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import ShiftsAdmin from './pages/admin/ShiftsAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token'),
  );

  return (
    <Routes>
      {/* 1. Trang Đăng nhập */}
      <Route path="/login" element={<LoginPage onLoginSuccess={setToken} />} />

      {/* 2. Trang Đặt bàn (Khách dùng) - Thêm mới ở đây */}
      <Route path="/reservation" element={<ReservationPage />} />

      {/* 3. Trang POS (Máy tính) */}
      <Route path="/" element={<POSPage />} />

      {/* 4. Trang POS (Mobile) */}
      <Route path="/mobile" element={<MobilePOSPage />} />

      {/* 5. Khu vực Admin (Cần quyền Admin) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tables" element={<TablesAdmin />} />
        <Route path="dishes" element={<DishesAdmin />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="shifts" element={<ShiftsAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
      </Route>
    </Routes>
  );
}

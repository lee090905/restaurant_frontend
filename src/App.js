import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const [token, setToken] = useState(localStorage.getItem('token'));
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, { onLoginSuccess: setToken }) }), _jsx(Route, { path: "/reservation", element: _jsx(ReservationPage, {}) }), _jsx(Route, { path: "/", element: _jsx(POSPage, {}) }), _jsx(Route, { path: "/mobile", element: _jsx(MobilePOSPage, {}) }), _jsxs(Route, { path: "/admin", element: _jsx(AdminRoute, { children: _jsx(AdminPage, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "tables", element: _jsx(TablesAdmin, {}) }), _jsx(Route, { path: "dishes", element: _jsx(DishesAdmin, {}) }), _jsx(Route, { path: "orders", element: _jsx(OrdersAdmin, {}) }), _jsx(Route, { path: "shifts", element: _jsx(ShiftsAdmin, {}) }), _jsx(Route, { path: "users", element: _jsx(UsersAdmin, {}) })] })] }));
}

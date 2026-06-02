import { Navigate } from 'react-router-dom';

// Component này sẽ bọc ngoài các trang cần đăng nhập mới được xem
export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = sessionStorage.getItem('token');

  // Nếu không có token trong phiên làm việc -> Đá văng về trang login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token -> Cho phép render trang đích (children)
  return children;
};

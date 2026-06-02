import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const token = sessionStorage.getItem('token');
  const userRaw = sessionStorage.getItem('user');

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userRaw);

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

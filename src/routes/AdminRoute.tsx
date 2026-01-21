import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userRaw);

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

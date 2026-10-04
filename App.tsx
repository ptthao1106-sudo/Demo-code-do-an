import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import api from './services/api';
import type { AdminUser } from './types';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PublicDetailPage from './pages/PublicDetailPage';
import PublicRoutePage from './pages/PublicRoutePage';

export default function App() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((response) => setAdmin(response.data.admin))
      .catch(() => localStorage.removeItem('admin_token'))
      .finally(() => setLoading(false));
  }, []);

  const auth = useMemo(() => ({
    admin,
    login: (data: { token: string; admin: AdminUser }) => {
      localStorage.setItem('admin_token', data.token);
      setAdmin(data.admin);
    },
    logout: () => {
      localStorage.removeItem('admin_token');
      setAdmin(null);
    }
  }), [admin]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-blue-700">Đang khởi tạo hệ thống...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/live" element={<HomePage />} />
      <Route path="/detail/:id" element={<PublicDetailPage />} />
      <Route path="/route/:id" element={<PublicRoutePage />} />
      <Route path="/admin/login" element={<AdminLoginPage onLogin={auth.login} />} />
      <Route path="/admin" element={admin ? <AdminDashboardPage admin={admin} onLogout={auth.logout} /> : <Navigate to="/admin/login" replace />} />
      <Route path="/admin/*" element={admin ? <AdminDashboardPage admin={admin} onLogout={auth.logout} /> : <Navigate to="/admin/login" replace />} />
      <Route path="/live/admin/login" element={<AdminLoginPage onLogin={auth.login} />} />
      <Route path="/live/admin/*" element={admin ? <AdminDashboardPage admin={admin} onLogout={auth.logout} /> : <Navigate to="/live/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

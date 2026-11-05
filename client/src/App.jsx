import { Navigate, Route, Routes } from 'react-router';
import AppLayout from './components/layout/AppLayout.jsx';
import RequireAuth from './auth/RequireAuth.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import MenusPage from './pages/MenusPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/kasir" replace />} />
          <Route path="kasir" element={<PlaceholderPage title="Kasir" />} />
          <Route path="pesanan" element={<PlaceholderPage title="Pesanan aktif" />} />
          <Route path="riwayat" element={<PlaceholderPage title="Riwayat transaksi" />} />

          <Route element={<RequireAuth roles={['ADMIN']} />}>
            <Route path="dashboard" element={<PlaceholderPage title="Dashboard" />} />
            <Route path="menu" element={<MenusPage />} />
            <Route path="kategori" element={<CategoriesPage />} />
            <Route path="meja" element={<PlaceholderPage title="Kelola meja" />} />
            <Route path="user" element={<PlaceholderPage title="Kelola user" />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
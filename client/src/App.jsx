import { Navigate, Route, Routes } from 'react-router';
import AppLayout from './components/layout/AppLayout.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/menu" replace />} />
        <Route path="kasir" element={<PlaceholderPage title="Kasir" />} />
        <Route path="pesanan" element={<PlaceholderPage title="Pesanan aktif" />} />
        <Route path="riwayat" element={<PlaceholderPage title="Riwayat transaksi" />} />
        <Route path="dashboard" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="menu" element={<PlaceholderPage title="Kelola menu" />} />
        <Route path="kategori" element={<CategoriesPage />} />
        <Route path="meja" element={<PlaceholderPage title="Kelola meja" />} />
        <Route path="user" element={<PlaceholderPage title="Kelola user" />} />
      </Route>
    </Routes>
  );
}
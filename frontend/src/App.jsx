// frontend/src/App.jsx
// Complete routing — semua route beserta layout dan proteksi role

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import WargaLayout from './components/layout/WargaLayout';
import RTRWLayout from './components/layout/RTRWLayout';
import SuperAdminLayout from './components/layout/SuperAdminLayout';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginWarga from './pages/auth/LoginWarga';
import { LoginRTRW, LoginSuperadmin, RegisterWarga } from './pages/auth/AuthPages';

// Warga pages
import WargaDashboard from './pages/warga/Dashboard';
import BuatSurat from './pages/warga/BuatSurat';

import StatusSurat from './pages/warga/StatusSurat';
import WargaProfil from './pages/warga/ProfilWarga';

// RT/RW pages
import RTRWDashboard from './pages/rtrw/Dashboard';
import TandaTangan from './pages/rtrw/TtdSurat';
import AjukanOffline from './pages/rtrw/AjukanSurat';
import Riwayat from './pages/rtrw/RiwayatSurat';
import RTRWProfil from './pages/rtrw/profil';

// Superadmin pages
import SuperadminDashboard from './pages/superadmin/Dashboard';
import Template from './pages/superadmin/TemplateSurat';
import SuratManual from './pages/superadmin/suratmanual';

// Halaman yang masih dipertahankan dari SIPRAGA (tidak ada di CORETAX)
import LoginRtRw from './pages/auth/LoginRtRw';
import RegisterRtRw from './pages/auth/RegisterRtRw';
import RegisterSuperadmin from './pages/auth/RegisterSuperadmin';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login-warga" element={<LoginWarga />} />
        <Route path="/login-rtrw" element={<LoginRTRW />} />
        <Route path="/register-warga" element={<RegisterWarga />} />
        <Route path="/superadmin/login" element={<LoginSuperadmin />} />

        {/* Routes khusus SIPRAGA yang tidak ada di CORETAX */}
        <Route path="/register-rtrw" element={<RegisterRtRw />} />
        <Route path="/register-superadmin" element={<RegisterSuperadmin />} />

        {/* ── Warga routes ── */}
        <Route
          path="/warga"
          element={
            <ProtectedRoute allowedRoles={['warga']}>
              <WargaLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/warga/dashboard" replace />} />
          <Route path="dashboard" element={<WargaDashboard />} />
          <Route path="buat-surat" element={<BuatSurat />} />

          <Route path="status" element={<StatusSurat />} />
          <Route path="profil" element={<WargaProfil />} />
        </Route>

        {/* ── RT/RW routes ── */}
        <Route
          path="/rtrw"
          element={
            <ProtectedRoute allowedRoles={['rt', 'rw']}>
              <RTRWLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/rtrw/dashboard" replace />} />
          <Route path="dashboard" element={<RTRWDashboard />} />
          <Route path="ttd" element={<TandaTangan />} />
          <Route path="ajukan" element={<AjukanOffline />} />
          <Route path="riwayat" element={<Riwayat />} />
          <Route path="profil" element={<RTRWProfil />} />
        </Route>

        {/* ── Superadmin routes ── */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperadminDashboard />} />
          <Route path="template" element={<Template />} />
          <Route path="surat-manual" element={<SuratManual />} />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginWarga from './pages/auth/LoginWarga';
import RegisterWarga from './pages/auth/RegisterWarga';
import LoginRtRw from './pages/auth/LoginRtRw';
import WargaDashboard from './pages/warga/Dashboard';
import AjukanSurat from './pages/warga/AjukanSurat';
import StatusSurat from './pages/warga/StatusSurat';
import RtRwDashboard from './pages/rtrw/Dashboard';
import RtRwAjukanSurat from './pages/rtrw/AjukanSurat';
import TtdSurat from './pages/rtrw/TtdSurat';
import RiwayatSurat from './pages/rtrw/RiwayatSurat';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import TemplateSurat from './pages/superadmin/TemplateSurat';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login-warga" element={<LoginWarga />} />
          <Route path="/register-warga" element={<RegisterWarga />} />
          <Route path="/login-rtrw" element={<LoginRtRw />} />

          {/* Warga Dashboard & Actions */}
          <Route
            path="/warga/dashboard"
            element={<ProtectedRoute allowedRoles={['warga']}><WargaDashboard /></ProtectedRoute>}
          />
          <Route
            path="/warga/ajukan"
            element={<ProtectedRoute allowedRoles={['warga']}><AjukanSurat /></ProtectedRoute>}
          />
          <Route
            path="/warga/status"
            element={<ProtectedRoute allowedRoles={['warga']}><StatusSurat /></ProtectedRoute>}
          />

          {/* RT/RW Dashboard & Actions */}
          <Route
            path="/rtrw/dashboard"
            element={<ProtectedRoute allowedRoles={['rt', 'rw']}><RtRwDashboard /></ProtectedRoute>}
          />
          <Route
            path="/rtrw/ajukan"
            element={<ProtectedRoute allowedRoles={['rt', 'rw']}><RtRwAjukanSurat /></ProtectedRoute>}
          />
          <Route
            path="/rtrw/ttd"
            element={<ProtectedRoute allowedRoles={['rt', 'rw']}><TtdSurat /></ProtectedRoute>}
          />
          <Route
            path="/rtrw/riwayat"
            element={<ProtectedRoute allowedRoles={['rt', 'rw']}><RiwayatSurat /></ProtectedRoute>}
          />

          {/* Super Admin Dashboard & Actions */}
          <Route
            path="/superadmin/dashboard"
            element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/superadmin/template"
            element={<ProtectedRoute allowedRoles={['superadmin']}><TemplateSurat /></ProtectedRoute>}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login-warga" element={<LoginWarga />} />
        <Route path="/register-warga" element={<RegisterWarga />} />
        <Route path="/login-rtrw" element={<LoginRtRw />} />

        {/* Warga Dashboard & Actions */}
        <Route path="/warga/dashboard" element={<WargaDashboard />} />
        <Route path="/warga/ajukan" element={<AjukanSurat />} />
        <Route path="/warga/status" element={<StatusSurat />} />

        {/* RT/RW Dashboard & Actions */}
        <Route path="/rtrw/dashboard" element={<RtRwDashboard />} />
        <Route path="/rtrw/ajukan" element={<RtRwAjukanSurat />} />
        <Route path="/rtrw/ttd" element={<TtdSurat />} />
        <Route path="/rtrw/riwayat" element={<RiwayatSurat />} />

        {/* Super Admin Dashboard & Actions */}
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/template" element={<TemplateSurat />} />
      </Routes>
    </Router>
  );
}

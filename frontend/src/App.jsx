import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LetterWizardPage from './features/letters/pages/LetterWizardPage';
import LetterDetailPage from './features/letters/pages/LetterDetailPage';
import LetterListPage   from './features/letters/pages/LetterListPage';
import LetterInboxPage  from './features/letters/pages/LetterInboxPage';
import QrVerifyPage  from './features/letters/pages/QrVerifyPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import LoginWarga from './pages/auth/LoginWarga';
import RegisterWarga from './pages/auth/RegisterWarga';
import LoginRtRw from './pages/auth/LoginRtRw';
import RegisterRtRw from './pages/auth/RegisterRtRw';
import RegisterSuperadmin from './pages/auth/RegisterSuperadmin';
import WargaDashboard from './pages/warga/Dashboard';
import AjukanSurat from './pages/warga/AjukanSurat';
import StatusSurat from './pages/warga/StatusSurat';
import RtRwDashboard from './pages/rtrw/Dashboard';
import RtRwAjukanSurat from './pages/rtrw/AjukanSurat';
import TtdSurat from './pages/rtrw/TtdSurat';
import RiwayatSurat from './pages/rtrw/RiwayatSurat';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import TemplateSurat from './pages/superadmin/TemplateSurat';

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen text-slate-400 text-sm gap-2">
    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    Memuat Aplikasi...
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/"                    element={<LandingPage />} />
            <Route path="/login-warga"         element={<LoginWarga />} />
            <Route path="/register-warga"      element={<RegisterWarga />} />
            <Route path="/login-rtrw"          element={<LoginRtRw />} />
            <Route path="/register-rtrw"       element={<RegisterRtRw />} />
            <Route path="/register-superadmin" element={<RegisterSuperadmin />} />
            <Route path="/verify/:qrToken" element={<QrVerifyPage />} />
            {/* Dashboard Layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/warga/dashboard" element={<ProtectedRoute allowedRoles={['warga']}><WargaDashboard /></ProtectedRoute>} />
              <Route path="/warga/ajukan"    element={<ProtectedRoute allowedRoles={['warga']}><AjukanSurat /></ProtectedRoute>} />
              <Route path="/warga/status"    element={<ProtectedRoute allowedRoles={['warga']}><StatusSurat /></ProtectedRoute>} />
              <Route path="/warga/buat-surat-v2"  element={<ProtectedRoute allowedRoles={['warga']}><LetterWizardPage /></ProtectedRoute>} />
              <Route path="/warga/surat/:uuid"    element={<ProtectedRoute allowedRoles={['warga']}><LetterDetailPage /></ProtectedRoute>} />
              <Route path="/warga/riwayat"        element={<ProtectedRoute allowedRoles={['warga']}><LetterListPage /></ProtectedRoute>} />
              <Route path="/warga/inbox"          element={<ProtectedRoute allowedRoles={['warga']}><LetterInboxPage /></ProtectedRoute>} />

              <Route path="/rtrw/dashboard"  element={<ProtectedRoute allowedRoles={['rt', 'rw']}><RtRwDashboard /></ProtectedRoute>} />
              <Route path="/rtrw/ajukan"     element={<ProtectedRoute allowedRoles={['rt', 'rw']}><RtRwAjukanSurat /></ProtectedRoute>} />
              <Route path="/rtrw/buat-surat-v2" element={<ProtectedRoute allowedRoles={['rt', 'rw']}><LetterWizardPage /></ProtectedRoute>} />
              <Route path="/rtrw/surat/:uuid"   element={<ProtectedRoute allowedRoles={['rt', 'rw']}><LetterDetailPage /></ProtectedRoute>} />
              <Route path="/rtrw/ttd"        element={<ProtectedRoute allowedRoles={['rt', 'rw']}><TtdSurat /></ProtectedRoute>} />
              <Route path="/rtrw/riwayat"    element={<ProtectedRoute allowedRoles={['rt', 'rw']}><RiwayatSurat /></ProtectedRoute>} />
              <Route path="/rtrw/riwayat-v2" element={<ProtectedRoute allowedRoles={['rt', 'rw']}><LetterListPage /></ProtectedRoute>} />
              <Route path="/rtrw/inbox"      element={<ProtectedRoute allowedRoles={['rt', 'rw']}><LetterInboxPage /></ProtectedRoute>} />
              
              
              <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/superadmin/template"  element={<ProtectedRoute allowedRoles={['superadmin']}><TemplateSurat /></ProtectedRoute>} />
              
              {/* Unified Profile Route */}
              <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
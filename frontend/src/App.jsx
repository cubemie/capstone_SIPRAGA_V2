import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy load semua halaman
const LandingPage        = lazy(() => import('./pages/LandingPage'));
const LoginWarga         = lazy(() => import('./pages/auth/LoginWarga'));
const RegisterWarga      = lazy(() => import('./pages/auth/RegisterWarga'));
const LoginRtRw          = lazy(() => import('./pages/auth/LoginRtRw'));
const RegisterRtRw       = lazy(() => import('./pages/auth/RegisterRtRw'));
const RegisterSuperadmin = lazy(() => import('./pages/auth/RegisterSuperadmin'));
const WargaDashboard     = lazy(() => import('./pages/warga/Dashboard'));
const AjukanSurat        = lazy(() => import('./pages/warga/AjukanSurat'));
const StatusSurat        = lazy(() => import('./pages/warga/StatusSurat'));
const RtRwDashboard      = lazy(() => import('./pages/rtrw/Dashboard'));
const RtRwAjukanSurat    = lazy(() => import('./pages/rtrw/AjukanSurat'));
const TtdSurat           = lazy(() => import('./pages/rtrw/TtdSurat'));
const RiwayatSurat       = lazy(() => import('./pages/rtrw/RiwayatSurat'));
const SuperAdminDashboard= lazy(() => import('./pages/superadmin/Dashboard'));
const TemplateSurat      = lazy(() => import('./pages/superadmin/TemplateSurat'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh] text-slate-400 text-sm gap-2">
    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    Memuat...
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

            {/* Dashboard Layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/warga/dashboard" element={<ProtectedRoute allowedRoles={['warga']}><WargaDashboard /></ProtectedRoute>} />
              <Route path="/warga/ajukan"    element={<ProtectedRoute allowedRoles={['warga']}><AjukanSurat /></ProtectedRoute>} />
              <Route path="/warga/status"    element={<ProtectedRoute allowedRoles={['warga']}><StatusSurat /></ProtectedRoute>} />

              <Route path="/rtrw/dashboard"  element={<ProtectedRoute allowedRoles={['rt', 'rw']}><RtRwDashboard /></ProtectedRoute>} />
              <Route path="/rtrw/ajukan"     element={<ProtectedRoute allowedRoles={['rt', 'rw']}><RtRwAjukanSurat /></ProtectedRoute>} />
              <Route path="/rtrw/ttd"        element={<ProtectedRoute allowedRoles={['rt', 'rw']}><TtdSurat /></ProtectedRoute>} />
              <Route path="/rtrw/riwayat"    element={<ProtectedRoute allowedRoles={['rt', 'rw']}><RiwayatSurat /></ProtectedRoute>} />

              <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/superadmin/template"  element={<ProtectedRoute allowedRoles={['superadmin']}><TemplateSurat /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
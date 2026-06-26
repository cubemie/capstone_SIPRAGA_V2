import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider }       from './context/AuthContext';
import ProtectedRoute         from './components/ProtectedRoute';
import DashboardLayout        from './components/layout/DashboardLayout';
import LetterWizardPage       from './features/letters/pages/LetterWizardPage';
import LetterDetailPage       from './features/letters/pages/LetterDetailPage';
import LetterListPage         from './features/letters/pages/LetterListPage';
import LetterInboxPage        from './features/letters/pages/LetterInboxPage';
import QrVerifyPage           from './features/letters/pages/QrVerifyPage';
import ProfilePage            from './pages/ProfilePage';
import LandingPage            from './pages/LandingPage';
import LoginWarga             from './pages/auth/LoginWarga';
import RegisterWarga          from './pages/auth/RegisterWarga';
import LoginRtRw              from './pages/auth/LoginRtRw';
import RegisterRtRw           from './pages/auth/RegisterRtRw';
import RegisterSuperadmin     from './pages/auth/RegisterSuperadmin';
import WargaDashboard         from './pages/warga/Dashboard';
import RtRwDashboard          from './pages/rtrw/Dashboard';
import TtdSurat               from './pages/rtrw/TtdSurat';

// Superadmin pages (membawa DashboardLayout-nya sendiri)
import SuperAdminDashboard    from './pages/superadmin/Dashboard';
import TemplateSuratMarkdown  from './pages/superadmin/TemplateSuratMarkdown';
import ManajemenAkun          from './pages/superadmin/ManajemenAkun';
import KonfigurasiInstansi    from './pages/superadmin/KonfigurasiInstansi';
import LogSistem              from './pages/superadmin/LogSistem';

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen text-[var(--color-ink-muted)] text-sm gap-2">
    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    Memuat Aplikasi...
  </div>
);

const sa = (allowedRoles, Element) => (
  <ProtectedRoute allowedRoles={allowedRoles}>{Element}</ProtectedRoute>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public Routes ─────────────────────────────────────────── */}
            <Route path="/"                    element={<LandingPage />} />
            <Route path="/login-warga"         element={<LoginWarga />} />
            <Route path="/register-warga"      element={<RegisterWarga />} />
            <Route path="/login-rtrw"          element={<LoginRtRw />} />
            <Route path="/register-rtrw"       element={<RegisterRtRw />} />
            <Route path="/register-superadmin" element={<RegisterSuperadmin />} />
            <Route path="/verify/:qrToken"     element={<QrVerifyPage />} />

            {/* ── Protected — menggunakan DashboardLayout via Outlet ─────── */}
            <Route element={<DashboardLayout />}>
              {/* Warga */}
              <Route path="/warga/dashboard"      element={sa(['warga'], <WargaDashboard />)} />
              <Route path="/warga/buat-surat-v2"  element={sa(['warga'], <LetterWizardPage />)} />
              <Route path="/warga/surat/:uuid"    element={sa(['warga'], <LetterDetailPage />)} />
              <Route path="/warga/riwayat"        element={sa(['warga'], <LetterListPage />)} />


              {/* RT / RW */}
              <Route path="/rtrw/dashboard"    element={sa(['rt', 'rw'], <RtRwDashboard />)} />
              <Route path="/rtrw/buat-surat-v2" element={sa(['rt', 'rw'], <LetterWizardPage />)} />
              <Route path="/rtrw/surat/:uuid"   element={sa(['rt', 'rw'], <LetterDetailPage />)} />
              <Route path="/rtrw/ttd"           element={sa(['rt', 'rw'], <TtdSurat />)} />
              <Route path="/rtrw/riwayat-v2"    element={sa(['rt', 'rw'], <LetterListPage />)} />
              <Route path="/rtrw/inbox"         element={sa(['rt', 'rw'], <LetterInboxPage />)} />

              {/* Profil — semua role */}
              <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Superadmin */}
              <Route path="/superadmin/dashboard"   element={sa(['superadmin'], <SuperAdminDashboard />)} />
              <Route path="/superadmin/template-md" element={sa(['superadmin'], <TemplateSuratMarkdown />)} />
              <Route path="/superadmin/akun"        element={sa(['superadmin'], <ManajemenAkun />)} />
              <Route path="/superadmin/config"      element={sa(['superadmin'], <KonfigurasiInstansi />)} />
              <Route path="/superadmin/log"         element={sa(['superadmin'], <LogSistem />)} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';
import {
  User, Send, FileText, CheckSquare, Award, History,
  LayoutDashboard, LogOut, Bell, Menu, X, UserCircle,
} from 'lucide-react';
import NotificationBell from '../NotificationBell';

function SidebarContent({
  menuItems,
  location,
  sidebarActive,
  sidebarHover,
  handleLogout,
  setSidebarOpen,
}) {
  return (
    <>
      <div className="p-5 flex items-center justify-between border-b border-white/10">
        <Logo className="text-white [&_svg]:text-white [&_span]:text-white" />
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium transition text-sm ${
                isActive ? sidebarActive + ' shadow-sm' : 'text-white/80 ' + sidebarHover + ' hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium transition text-slate-400 hover:bg-red-800/60 hover:text-white text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(user?.role === 'warga' ? '/login-warga' : '/login-rtrw');
  };

  let menuItems = [];
  // Default palette: navy primary sidebar with accent active state
  let sidebarBg    = 'bg-[var(--color-primary)]';
  let sidebarHover = 'hover:bg-[var(--color-primary-light)]';
  let sidebarActive= 'bg-[var(--color-accent)] text-[var(--color-primary)]';

  if (user?.role === 'warga') {
    menuItems = [
      { path: '/warga/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
      { path: '/profil',          label: 'Profil Saya',  icon: UserCircle },
      { path: '/warga/buat-surat-v2', label: 'Ajukan Surat Baru', icon: Send },
      { path: '/warga/riwayat',   label: 'Status & Riwayat', icon: History },
      { path: '/warga/inbox',     label: 'Kotak Masuk', icon: Bell },
    ];
    sidebarBg     = 'bg-[var(--color-primary)]';
    sidebarHover  = 'hover:bg-[var(--color-primary-light)]';
    sidebarActive = 'bg-[var(--color-accent)] text-[var(--color-primary)]';
  } else if (user?.role === 'rt' || user?.role === 'rw') {
    menuItems = [
      { path: '/profil',         label: 'Profil Saya',          icon: UserCircle },
      { path: '/rtrw/inbox',     label: 'Tugas & Kotak Masuk', icon: Bell },
      { path: '/rtrw/buat-surat-v2', label: 'Buat Surat Pengantar', icon: FileText },
      { path: '/rtrw/riwayat-v2',label: 'Riwayat Surat',   icon: History },
      { path: '/rtrw/ttd',       label: 'Tanda Tangan Digital', icon: Award },
    ];
    sidebarBg     = 'bg-[var(--color-primary-dark)]';
    sidebarHover  = 'hover:bg-[var(--color-primary)]';
    sidebarActive = 'bg-[var(--color-accent)] text-[var(--color-primary)]';
  } else if (user?.role === 'superadmin') {
    menuItems = [
      { path: '/superadmin/dashboard',   label: 'Dashboard',           icon: LayoutDashboard },
      { path: '/profil',                 label: 'Profil Saya',         icon: UserCircle },
      { path: '/superadmin/akun',        label: 'Manajemen Akun',      icon: User },
      { path: '/superadmin/template-md', label: 'Template Markdown',   icon: FileText },
      { path: '/superadmin/config',      label: 'Konfigurasi Instansi',icon: CheckSquare },
      { path: '/superadmin/log',         label: 'Log Sistem',          icon: History },
    ];
    sidebarBg     = 'bg-[#0A1F5C]';
    sidebarHover  = 'hover:bg-[var(--color-primary)]';
    sidebarActive = 'bg-[var(--color-accent)] text-[var(--color-primary)]';
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex font-sans text-[var(--color-ink)]">
      {/* Sidebar Desktop */}
      <aside className={`w-64 ${sidebarBg} text-white flex-col hidden md:flex`}>
        <SidebarContent
          menuItems={menuItems}
          location={location}
          sidebarActive={sidebarActive}
          sidebarHover={sidebarHover}
          handleLogout={handleLogout}
          setSidebarOpen={setSidebarOpen}
        />
      </aside>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className={`relative w-64 h-full ${sidebarBg} text-white flex flex-col z-50`}>
            <SidebarContent
              menuItems={menuItems}
              location={location}
              sidebarActive={sidebarActive}
              sidebarHover={sidebarHover}
              handleLogout={handleLogout}
              setSidebarOpen={setSidebarOpen}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-[var(--color-surface-card)] border-b border-[var(--color-surface-border)] px-4 md:px-6 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] rounded-lg hover:bg-[var(--color-surface-muted)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <span className="text-[var(--color-ink-muted)] font-medium text-xs uppercase tracking-wider">
                {user?.role === 'superadmin' ? 'Panel Kontrol' : user?.role === 'warga' ? 'Selamat Datang' : 'Dashboard Pelayanan'}
              </span>
              <h2 className="text-base font-bold text-[var(--color-ink)] leading-tight">
                {user?.nama || user?.username || 'Pengguna'}
                {(user?.role === 'rt' || user?.role === 'rw') && (
                  <span className="ml-2 text-xs font-semibold text-[var(--color-ink-muted)] uppercase">({user.role})</span>
                )}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationBell />
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
              user?.role === 'warga' ? 'bg-[var(--color-brand-100)] text-[var(--color-primary)]' : 'bg-[var(--color-primary)] text-white'
            }`}>
              {(user?.nama || user?.username || 'US')?.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[var(--color-surface)]">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
}

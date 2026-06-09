import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';
import { 
  User, Send, FileText, CheckSquare, Award, History, 
  LayoutDashboard, LogOut, Bell 
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    if (user?.role === 'warga') {
      navigate('/login-warga');
    } else {
      navigate('/login-rtrw');
    }
  };

  // Konfigurasi Menu berdasarkan Role
  let menuItems = [];
  let sidebarBg = 'bg-blue-900';
  let sidebarHover = 'hover:bg-blue-800';
  let sidebarActive = 'bg-blue-800';

  if (user?.role === 'warga') {
    menuItems = [
      { path: '/warga/dashboard', label: 'Dashboard', icon: User },
      { path: '/warga/ajukan', label: 'Ajukan Surat', icon: Send },
      { path: '/warga/status', label: 'Status Surat', icon: FileText },
    ];
    sidebarBg = 'bg-blue-900';
    sidebarHover = 'hover:bg-blue-800';
    sidebarActive = 'bg-blue-800';
  } else if (user?.role === 'rt' || user?.role === 'rw') {
    menuItems = [
      { path: '/rtrw/dashboard', label: 'Verifikasi Surat', icon: CheckSquare },
      { path: '/rtrw/ajukan', label: 'Buat Surat Pengantar', icon: FileText },
      { path: '/rtrw/ttd', label: 'Tanda Tangan Digital', icon: Award },
      { path: '/rtrw/riwayat', label: 'Riwayat Surat', icon: History },
    ];
    sidebarBg = 'bg-slate-900';
    sidebarHover = 'hover:bg-slate-800';
    sidebarActive = 'bg-slate-800';
  } else if (user?.role === 'superadmin') {
    menuItems = [
      { path: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/superadmin/template', label: 'Kelola Template', icon: FileText },
    ];
    sidebarBg = 'bg-slate-950';
    sidebarHover = 'hover:bg-slate-900';
    sidebarActive = 'bg-slate-900';
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className={`w-64 ${sidebarBg} text-white flex flex-col hidden md:flex`}>
        <div className={`p-6 flex items-center justify-center border-b border-white/10`}>
          <Logo className="text-white [&_svg]:text-white [&_span]:text-white" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium transition ${
                  isActive ? sidebarActive : sidebarHover
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={`p-4 border-t border-white/10`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium transition text-slate-300 hover:bg-red-800 hover:text-white`}
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-900 md:hidden flex items-center space-x-2">
            <Logo />
          </h1>
          <div className="hidden md:block">
            <span className="text-slate-500 font-medium text-sm">
              {user?.role === 'superadmin' ? 'Panel Kontrol,' : user?.role === 'warga' ? 'Selamat Datang kembali,' : 'Dashboard Pelayanan,'}
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              {user?.nama || user?.username || 'Pengguna'}
              {(user?.role === 'rt' || user?.role === 'rw') && (
                <span className="ml-2 text-xs font-semibold text-slate-400 uppercase">({user.role})</span>
              )}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative bg-slate-100 rounded-full transition">
              <Bell className="w-5 h-5" />
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              user?.role === 'warga' ? 'bg-blue-100 text-blue-900' : 'bg-slate-800 text-white'
            }`}>
              {(user?.nama || user?.username || 'US')?.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Pages Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';
import {
  User, Send, FileText, CheckSquare, Award, History,
  LayoutDashboard, LogOut, Bell, Menu, X, UserCircle,
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(user?.role === 'warga' ? '/login-warga' : '/login-rtrw');
  };

  let menuItems = [];
  let sidebarBg    = 'bg-[#1e3a5f]';
  let sidebarHover = 'hover:bg-[#2d5282]';
  let sidebarActive= 'bg-[#2d5282]';

  if (user?.role === 'warga') {
    menuItems = [
      { path: '/warga/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
      { path: '/profil',          label: 'Profil Saya',  icon: UserCircle },
      { path: '/warga/buat-surat-v2', label: 'Ajukan Surat Baru', icon: Send },
      { path: '/warga/riwayat',   label: 'Status & Riwayat', icon: History },
      { path: '/warga/inbox',     label: 'Kotak Masuk', icon: Bell },
    ];
    sidebarBg     = 'bg-[#1e3a5f]';
    sidebarHover  = 'hover:bg-[#2d5282]';
    sidebarActive = 'bg-[#2d5282]';
  } else if (user?.role === 'rt' || user?.role === 'rw') {
    menuItems = [
      { path: '/profil',         label: 'Profil Saya',          icon: UserCircle },
      { path: '/rtrw/inbox',     label: 'Tugas & Kotak Masuk', icon: Bell },
      { path: '/rtrw/buat-surat-v2', label: 'Buat Surat Pengantar', icon: FileText },
      { path: '/rtrw/riwayat-v2',label: 'Riwayat Surat',   icon: History },
      { path: '/rtrw/ttd',       label: 'Tanda Tangan Digital', icon: Award },
    ];
    sidebarBg     = 'bg-slate-900';
    sidebarHover  = 'hover:bg-slate-800';
    sidebarActive = 'bg-slate-800';
  } else if (user?.role === 'superadmin') {
    menuItems = [
      { path: '/superadmin/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
      { path: '/superadmin/template',  label: 'Kelola Template', icon: FileText },
    ];
    sidebarBg     = 'bg-slate-950';
    sidebarHover  = 'hover:bg-slate-900';
    sidebarActive = 'bg-slate-900';
  }

  const SidebarContent = () => (
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
                isActive ? sidebarActive + ' text-white' : 'text-slate-300 ' + sidebarHover + ' hover:text-white'
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

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar Desktop */}
      <aside className={`w-64 ${sidebarBg} text-white flex-col hidden md:flex`}>
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className={`relative w-64 h-full ${sidebarBg} text-white flex flex-col z-50`}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                {user?.role === 'superadmin' ? 'Panel Kontrol' : user?.role === 'warga' ? 'Selamat Datang' : 'Dashboard Pelayanan'}
              </span>
              <h2 className="text-base font-bold text-slate-800 leading-tight">
                {user?.nama || user?.username || 'Pengguna'}
                {(user?.role === 'rt' || user?.role === 'rw') && (
                  <span className="ml-2 text-xs font-semibold text-slate-400 uppercase">({user.role})</span>
                )}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition">
              <Bell className="w-4.5 h-4.5" />
            </button>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
              user?.role === 'warga' ? 'bg-blue-100 text-blue-900' : 'bg-slate-800 text-white'
            }`}>
              {(user?.nama || user?.username || 'US')?.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/rtrw/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/rtrw/ttd', icon: '✍️', label: 'Tanda Tangan Surat' },
  { to: '/rtrw/ajukan', icon: '📄', label: 'Ajukan (Offline)' },
  { to: '/rtrw/riwayat', icon: '📋', label: 'Riwayat Surat' },
  { to: '/rtrw/profil', icon: '👤', label: 'Profil' },
];

const RTRWLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
    ${isActive
      ? 'bg-blue-100 text-[#0F2D5C] font-semibold border-l-4 border-[#1A4A8A] pl-3'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`;

  const roleLabel = user?.role === 'rt' ? 'RT' : 'RW';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Topbar */}
      <header className="h-16 bg-[#0F2D5C] flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30 relative">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-white p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Buka menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-bold text-lg tracking-tight">🏛️ SIPRAGA</span>
          <span className="hidden md:inline text-white/50 text-sm">Sistem Administrasi RT/RW</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-white/80 text-sm">{user?.nama ?? user?.username}</span>
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">{roleLabel}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/70 hover:text-white text-sm border border-white/30 hover:border-white/60 px-3 py-1 rounded transition-colors"
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        <aside
          className={`fixed md:static top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-50 border-r border-gray-200
            flex flex-col z-20 transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <span aria-hidden="true">🚪</span> Keluar
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RTRWLayout;

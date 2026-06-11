import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { Menu, LogOut, Landmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AppLayout = ({ navItems, userDisplay, roleBadgeText, roleBadgeColor, renderExtraComponents }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
    ${isActive
      ? 'bg-primary-light/10 text-primary-dark font-semibold border-l-4 border-primary pl-3'
      : 'text-secondary hover:bg-neutral-100 hover:text-neutral-900'}`;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Topbar */}
      <header className="h-16 bg-primary flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30 relative shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-white/80 hover:text-white p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Buka menu"
          >
            <Menu size={24} />
          </button>
          <span className="text-white font-bold text-lg tracking-tight flex items-center gap-2"><Landmark className="w-5 h-5" /> SIPRAGA</span>
          <span className="hidden md:inline text-white/60 text-sm">Sistem Administrasi RT/RW</span>
        </div>
        <div className="flex items-center gap-3">
          {renderExtraComponents && renderExtraComponents()}
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-white/90 text-sm">{userDisplay}</span>
            <span className={`${roleBadgeColor} text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
              {roleBadgeText}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/80 hover:text-white text-sm border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-neutral-900/40 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-neutral-100
            flex flex-col z-20 transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLinkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <span aria-hidden="true" className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t border-neutral-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

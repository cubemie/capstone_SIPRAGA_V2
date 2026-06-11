import { useState } from 'react';
import { Home, Pencil, FileSignature, ClipboardList, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from '../ui/NotificationPanel';
import AppLayout from './AppLayout';

const NAV = [
  { to: '/warga/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/warga/buat-surat', icon: <Pencil className="w-5 h-5" />, label: 'Buat Surat' },
  { to: '/warga/ajukan-ttd', icon: <FileSignature className="w-5 h-5" />, label: 'Ajukan TTD' },
  { to: '/warga/status', icon: <ClipboardList className="w-5 h-5" />, label: 'Status Surat' },
  { to: '/warga/profil', icon: <User className="w-5 h-5" />, label: 'Profil Saya' },
];

const WargaLayout = () => {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  const renderExtra = () => (
    <>
      <button
        onClick={() => setNotifOpen(true)}
        aria-label="Buka notifikasi"
        className="relative text-white/80 hover:text-white transition-colors p-1"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );

  return (
    <AppLayout
      navItems={NAV}
      userDisplay={user?.nama ?? user?.nik}
      roleBadgeText="Warga"
      roleBadgeColor="bg-primary-light/100"
      renderExtraComponents={renderExtra}
    />
  );
};

export default WargaLayout;
